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
      )
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
export { hasUserStore }
