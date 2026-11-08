import crypto from 'node:crypto'
import pg from 'pg'
import { env } from './_telegram.js'
import { defaultContent } from '../src/data/content.js'

const { Pool } = pg
const COOKIE_NAME = 'abdulmalik_admin_session'
const SESSION_SECONDS = 8 * 60 * 60
const INITIAL_USERNAME = 'Abdulmalik_Abdumalikov'
const INITIAL_PASSWORD_SALT = 'a688794412b471f9a69cc639d3b7ac06ce0b77a744ff4cbd'
const INITIAL_PASSWORD_HASH = 'a3b018781efe5fc9c6ee0f13738296b9385f02cba80717bf48b4708a8d5d7bea2d996ebdd859fd1f65e9202a3c03d7ae82be1f6b7dc92c0e16ab136a92529afa'
let pool
let schemaPromise

function databaseUrl() { return env('DATABASE_URL') || env('POSTGRES_URL') }
function getPool() {
  if (pool || !databaseUrl()) return pool
  const local = /localhost|127\.0\.0\.1|sslmode=disable/i.test(databaseUrl())
  pool = new Pool({ connectionString: databaseUrl(), max: 1, ssl: local ? false : { rejectUnauthorized: false } })
  return pool
}

function scrypt(password, salt) {
  return new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, (error, key) => error ? reject(error) : resolve(key.toString('hex'))))
}

export async function ensureAdminSchema() {
  const client = getPool()
  if (!client) throw new Error('DATABASE_URL is not configured')
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await client.query(`
        CREATE TABLE IF NOT EXISTS portfolio_admin_users (
          id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          password_salt TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS portfolio_admin_content (
          id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
          content JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS portfolio_admin_media (
          id UUID PRIMARY KEY,
          mime_type TEXT NOT NULL,
          bytes BYTEA NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS portfolio_admin_login_attempts (
          address TEXT PRIMARY KEY,
          attempts INTEGER NOT NULL DEFAULT 0,
          locked_until TIMESTAMPTZ
        );
      `)
      const user = await client.query('SELECT 1 FROM portfolio_admin_users WHERE id = 1')
      if (!user.rowCount) {
        const username = env('ADMIN_INITIAL_USERNAME') || env('PORTFOLIO_TELEGRAM_USERNAME') || INITIAL_USERNAME
        const password = env('ADMIN_INITIAL_PASSWORD')
        const salt = password ? crypto.randomBytes(24).toString('hex') : INITIAL_PASSWORD_SALT
        const passwordHash = password ? await scrypt(password, salt) : INITIAL_PASSWORD_HASH
        await client.query('INSERT INTO portfolio_admin_users (id, username, password_hash, password_salt) VALUES (1, $1, $2, $3)', [username, passwordHash, salt])
      }
      await client.query('INSERT INTO portfolio_admin_content (id, content) VALUES (1, $1::jsonb) ON CONFLICT (id) DO NOTHING', [JSON.stringify(defaultContent)])
      return client
    })().catch(error => { schemaPromise = null; throw error })
  }
  return schemaPromise
}

const safeEqual = (left, right) => {
  const a = Buffer.from(left || '')
  const b = Buffer.from(right || '')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export async function verifyCredentials(username, password) {
  const client = await ensureAdminSchema()
  const result = await client.query('SELECT username, password_hash, password_salt FROM portfolio_admin_users WHERE id = 1')
  const user = result.rows[0]
  if (!user || username !== user.username) return false
  return safeEqual(await scrypt(password, user.password_salt), user.password_hash)
}

function sessionSecret() {
  const source = env('ADMIN_SESSION_SECRET') || env('TELEGRAM_WEBHOOK_SECRET') || env('TELEGRAM_BOT_TOKEN') || databaseUrl()
  if (!source) throw new Error('Admin session secret is not configured')
  return crypto.createHash('sha256').update(source).digest('hex')
}

function sign(payload) { return crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url') }
export function createSession(username) {
  const payload = Buffer.from(JSON.stringify({ username, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function readCookie(req) {
  const cookies = Object.fromEntries(String(req.headers.cookie || '').split(';').map(part => part.trim().split(/=(.*)/s)).filter(([key]) => key))
  return cookies[COOKIE_NAME] || ''
}

export function authenticate(req) {
  try {
    const [payload, signature] = readCookie(req).split('.')
    if (!payload || !safeEqual(sign(payload), signature)) return null
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return session.exp > Date.now() / 1000 ? session : null
  } catch { return null }
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_SECONDS}`)
}
export function clearSessionCookie(res) { res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`) }

export async function changeCredentials(currentPassword, username, newPassword) {
  const client = await ensureAdminSchema()
  const current = await client.query('SELECT username FROM portfolio_admin_users WHERE id = 1')
  if (!await verifyCredentials(current.rows[0]?.username, currentPassword)) return false
  const salt = crypto.randomBytes(24).toString('hex')
  await client.query('UPDATE portfolio_admin_users SET username = $1, password_hash = $2, password_salt = $3, updated_at = NOW() WHERE id = 1', [username, await scrypt(newPassword, salt), salt])
  return true
}

export async function loginAllowed(address) {
  const client = await ensureAdminSchema()
  const result = await client.query('SELECT locked_until FROM portfolio_admin_login_attempts WHERE address = $1', [address])
  return !result.rows[0]?.locked_until || new Date(result.rows[0].locked_until).getTime() <= Date.now()
}
export async function recordLogin(address, success) {
  const client = await ensureAdminSchema()
  if (success) return client.query('DELETE FROM portfolio_admin_login_attempts WHERE address = $1', [address])
  return client.query(`INSERT INTO portfolio_admin_login_attempts (address, attempts) VALUES ($1, 1)
    ON CONFLICT (address) DO UPDATE SET attempts = portfolio_admin_login_attempts.attempts + 1,
    locked_until = CASE WHEN portfolio_admin_login_attempts.attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes' ELSE NULL END`, [address])
}

export { getPool }
