import { authenticate, changeCredentials, clearSessionCookie, createSession, ensureAdminSchema, loginAllowed, recordLogin, setSessionCookie, verifyCredentials } from './_admin.js'

const bodyOf = req => typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
const addressOf = req => String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim().slice(0, 120)

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const session = authenticate(req)
      return res.status(session ? 200 : 401).json({ authenticated: Boolean(session), username: session?.username })
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const body = bodyOf(req)
    if (body.action === 'login') {
      const address = addressOf(req)
      if (!await loginAllowed(address)) return res.status(429).json({ error: 'Juda ko‘p urinish. 15 daqiqadan keyin qayta urinib ko‘ring.' })
      const username = String(body.username || '').trim()
      const password = String(body.password || '')
      const valid = username.length <= 80 && password.length <= 200 && await verifyCredentials(username, password)
      await recordLogin(address, valid)
      if (!valid) return res.status(401).json({ error: 'Login yoki parol noto‘g‘ri.' })
      setSessionCookie(res, createSession(username))
      return res.status(200).json({ ok: true, username })
    }
    if (body.action === 'logout') {
      clearSessionCookie(res)
      return res.status(200).json({ ok: true })
    }
    if (body.action === 'change-credentials') {
      if (!authenticate(req)) return res.status(401).json({ error: 'Sessiya tugagan.' })
      const username = String(body.username || '').trim()
      const password = String(body.password || '')
      if (!/^[A-Za-z0-9_.-]{4,80}$/.test(username) || password.length < 8 || password.length > 200) return res.status(400).json({ error: 'Login 4–80 belgi, parol kamida 8 belgi bo‘lishi kerak.' })
      if (!await changeCredentials(String(body.currentPassword || ''), username, password)) return res.status(401).json({ error: 'Joriy parol noto‘g‘ri.' })
      setSessionCookie(res, createSession(username))
      return res.status(200).json({ ok: true, username })
    }
    return res.status(400).json({ error: 'Unknown action' })
  } catch (error) {
    console.error('Admin auth failed:', error.message)
    return res.status(500).json({ error: 'Admin tizimi sozlanmagan yoki database ishlamayapti.' })
  }
}
