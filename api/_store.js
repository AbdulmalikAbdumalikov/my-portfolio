import pg from 'pg'
import { env } from './_telegram.js'

const { Pool } = pg
let pool
let schemaPromise

const databaseUrl = () => env('DATABASE_URL') || env('POSTGRES_URL')
const hasUserStore = () => Boolean(databaseUrl())

function getPool() {
  if (pool || !databaseUrl()) return pool
  const localDatabase = /localhost|127\.0\.0\.1|sslmode=disable/i.test(databaseUrl())
  pool = new Pool({
    connectionString: databaseUrl(),
    max: 1,
    ssl: localDatabase ? false : { rejectUnauthorized: false },
  })
  return pool
}

async function ensureSchema() {
  const client = getPool()
  if (!client) return null
  if (!schemaPromise) {
    schemaPromise = client.query(`
      CREATE TABLE IF NOT EXISTS portfolio_bot_users (
        user_id BIGINT PRIMARY KEY,
        visitor JSONB,
        contact JSONB,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS portfolio_pro_users (
        user_id BIGINT PRIMARY KEY,
        added_by BIGINT NOT NULL,
        added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        active BOOLEAN NOT NULL DEFAULT TRUE
      );
      CREATE TABLE IF NOT EXISTS portfolio_pro_codes (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL REFERENCES portfolio_pro_users(user_id) ON DELETE CASCADE,
        code_hash TEXT NOT NULL UNIQUE,
        issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        used_at TIMESTAMPTZ
      );
      CREATE TABLE IF NOT EXISTS portfolio_pro_sessions (
        id BIGSERIAL PRIMARY KEY,
        user_id BIGINT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        device_hash TEXT NOT NULL,
        style TEXT NOT NULL DEFAULT 'minimalism',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );
      CREATE INDEX IF NOT EXISTS portfolio_pro_sessions_device_idx ON portfolio_pro_sessions (device_hash, expires_at);
    `).catch(error => {
      schemaPromise = null
      throw error
    })
  }
  await schemaPromise
  return client
}

async function getColumn(userId, column) {
  try {
    const client = await ensureSchema()
    if (!client) return null
    const result = await client.query(`SELECT ${column} FROM portfolio_bot_users WHERE user_id = $1`, [userId])
    return result.rows[0]?.[column] || null
  } catch (error) {
    console.error(`PostgreSQL ${column} read failed:`, error.message)
    return null
  }
}

async function saveColumn(userId, column, value) {
  try {
    const client = await ensureSchema()
    if (!client) return false
    await client.query(
      `INSERT INTO portfolio_bot_users (user_id, ${column}) VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET ${column} = EXCLUDED.${column}, updated_at = NOW()`,
      [userId, JSON.stringify(value)],
    )
    return true
  } catch (error) {
    console.error(`PostgreSQL ${column} write failed:`, error.message)
    return false
  }
}

export const getUserProfile = userId => getColumn(userId, 'contact')
export const saveUserProfile = (userId, profile) => saveColumn(userId, 'contact', profile)
export const getVisitorProfile = userId => getColumn(userId, 'visitor')
export const saveVisitorProfile = (userId, profile) => saveColumn(userId, 'visitor', profile)

export async function listVisitorProfiles(limit = 40) {
  try {
    const client = await ensureSchema()
    if (!client) return []
    const result = await client.query(`
      SELECT b.user_id, b.visitor, p.active AS is_pro
      FROM portfolio_bot_users b
      LEFT JOIN portfolio_pro_users p ON p.user_id = b.user_id
      WHERE b.visitor IS NOT NULL
      ORDER BY b.updated_at DESC
      LIMIT $1
    `, [limit])
    return result.rows
  } catch (error) {
    console.error('PostgreSQL visitor list failed:', error.message)
    return []
  }
}

export async function listProUsers() {
  try {
    const client = await ensureSchema()
    if (!client) return []
    const result = await client.query(`
      SELECT p.user_id, p.added_at, b.visitor
      FROM portfolio_pro_users p
      LEFT JOIN portfolio_bot_users b ON b.user_id = p.user_id
      WHERE p.active = TRUE
      ORDER BY p.added_at DESC
    `)
    return result.rows
  } catch (error) {
    console.error('PostgreSQL pro user list failed:', error.message)
    return []
  }
}

export async function addProUser(userId, addedBy) {
  try {
    const client = await ensureSchema()
    if (!client) return false
    await client.query(`
      INSERT INTO portfolio_pro_users (user_id, added_by, active)
      VALUES ($1, $2, TRUE)
      ON CONFLICT (user_id) DO UPDATE SET active = TRUE, added_by = EXCLUDED.added_by
    `, [userId, addedBy])
    return true
  } catch (error) {
    console.error('PostgreSQL pro user add failed:', error.message)
    return false
  }
}

export async function isProUser(userId) {
  try {
    const client = await ensureSchema()
    if (!client) return false
    const result = await client.query('SELECT 1 FROM portfolio_pro_users WHERE user_id = $1 AND active = TRUE', [userId])
    return result.rowCount > 0
  } catch (error) {
    console.error('PostgreSQL pro user check failed:', error.message)
    return false
  }
}

export async function issueProCode(userId, codeHash) {
  try {
    const client = await ensureSchema()
    if (!client) return false
    const result = await client.query(`
      INSERT INTO portfolio_pro_codes (user_id, code_hash)
      SELECT user_id, $2 FROM portfolio_pro_users WHERE user_id = $1 AND active = TRUE
      RETURNING id
    `, [userId, codeHash])
    return result.rowCount > 0
  } catch (error) {
    console.error('PostgreSQL pro code issue failed:', error.message)
    return false
  }
}

export async function redeemProCode(codeHash, deviceHash, tokenHash, expiresAt) {
  const client = getPool()
  if (!client) return { ok: false, reason: 'database' }
  const connection = await client.connect()
  try {
    await connection.query('BEGIN')
    await connection.query('DELETE FROM portfolio_pro_sessions WHERE expires_at <= NOW()')
    const active = await connection.query(
      'SELECT expires_at FROM portfolio_pro_sessions WHERE device_hash = $1 AND expires_at > NOW() LIMIT 1 FOR UPDATE',
      [deviceHash],
    )
    if (active.rowCount) {
      await connection.query('ROLLBACK')
      return { ok: false, reason: 'cooldown', expiresAt: active.rows[0].expires_at }
    }
    const code = await connection.query(`
      UPDATE portfolio_pro_codes c
      SET used_at = NOW()
      FROM portfolio_pro_users p
      WHERE c.code_hash = $1 AND c.user_id = p.user_id AND p.active = TRUE AND c.used_at IS NULL
      RETURNING c.user_id
    `, [codeHash])
    if (!code.rowCount) {
      await connection.query('ROLLBACK')
      return { ok: false, reason: 'invalid' }
    }
    await connection.query(
      'INSERT INTO portfolio_pro_sessions (user_id, token_hash, device_hash, expires_at) VALUES ($1, $2, $3, $4)',
      [code.rows[0].user_id, tokenHash, deviceHash, expiresAt],
    )
    await connection.query('COMMIT')
    return { ok: true, userId: code.rows[0].user_id, expiresAt }
  } catch (error) {
    await connection.query('ROLLBACK').catch(() => {})
    console.error('PostgreSQL pro code redeem failed:', error.message)
    return { ok: false, reason: 'database' }
  } finally {
    connection.release()
  }
}

export async function getProSession(tokenHash) {
  try {
    const client = await ensureSchema()
    if (!client) return null
    const result = await client.query(
      'SELECT user_id, style, expires_at FROM portfolio_pro_sessions WHERE token_hash = $1 AND expires_at > NOW()',
      [tokenHash],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error('PostgreSQL pro session read failed:', error.message)
    return null
  }
}

export async function setProStyle(tokenHash, style) {
  try {
    const client = await ensureSchema()
    if (!client) return null
    const result = await client.query(
      'UPDATE portfolio_pro_sessions SET style = $2 WHERE token_hash = $1 AND expires_at > NOW() RETURNING user_id, style, expires_at',
      [tokenHash, style],
    )
    return result.rows[0] || null
  } catch (error) {
    console.error('PostgreSQL pro style update failed:', error.message)
    return null
  }
}
export { hasUserStore }
