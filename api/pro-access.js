import { env, html, sendHtml } from './_telegram.js'
import { createSessionToken, hashValue, normalizeCode } from './_pro.js'
import { getProSession, hasUserStore, redeemProCode, setProStyle } from './_store.js'

const PRO_GROUP_CHAT_ID = () => env('TELEGRAM_PRO_GROUP_CHAT_ID') || '-1004480846914'
const PRO_TOPIC_ID = () => Number(env('TELEGRAM_PRO_TOPIC_ID') || 69)
const SESSION_HOURS = 6
const allowedStyles = new Set(['glassmorphism', 'liquid-glass', 'neomorphism', 'skeuomorphism', 'minimalism', 'maximalism'])

const audit = async text => {
  try {
    await sendHtml(PRO_GROUP_CHAT_ID(), text, { message_thread_id: PRO_TOPIC_ID() })
  } catch (error) {
    console.error('Pro audit failed:', error.message)
  }
}

function bodyOf(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body)
  return req.body || {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasUserStore()) return res.status(503).json({ error: 'Pro access is not configured' })

  try {
    const body = bodyOf(req)
    const action = String(body.action || '')
    if (action === 'redeem') {
      const code = normalizeCode(body.code)
      const deviceId = String(body.deviceId || '').trim()
      if (!/^PRO-[A-Z2-9]{8}$/.test(code) || deviceId.length < 16 || deviceId.length > 180) {
        return res.status(400).json({ error: 'Invalid code' })
      }
      const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000)
      const token = createSessionToken()
      const result = await redeemProCode(hashValue(code), hashValue(deviceId), hashValue(token), expiresAt)
      if (!result.ok && result.reason === 'cooldown') {
        return res.status(429).json({ error: 'Device cooldown is active', expiresAt: result.expiresAt })
      }
      if (!result.ok) return res.status(result.reason === 'database' ? 503 : 401).json({ error: result.reason === 'database' ? 'Database error' : 'Invalid or already used code' })
      await audit(`<b>Pro access ishlatildi</b>\n<b>User ID:</b> <code>${html(result.userId)}</code>\n<b>Muddati:</b> ${html(expiresAt.toISOString())}`)
      return res.status(200).json({ ok: true, token, expiresAt: expiresAt.toISOString(), style: 'minimalism' })
    }

    const token = String(body.token || '').trim()
    if (token.length < 32) return res.status(401).json({ error: 'Session expired' })
    const session = await getProSession(hashValue(token))
    if (!session) return res.status(401).json({ error: 'Session expired' })

    if (action === 'session') return res.status(200).json({ ok: true, expiresAt: session.expires_at, style: session.style })
    if (action === 'set-style') {
      const style = String(body.style || '')
      if (!allowedStyles.has(style)) return res.status(400).json({ error: 'Unknown style' })
      const updated = await setProStyle(hashValue(token), style)
      if (!updated) return res.status(401).json({ error: 'Session expired' })
      await audit(`<b>Pro style o'zgardi</b>\n<b>User ID:</b> <code>${html(updated.user_id)}</code>\n<b>Style:</b> ${html(style)}`)
      return res.status(200).json({ ok: true, style: updated.style, expiresAt: updated.expires_at })
    }
    return res.status(400).json({ error: 'Unknown action' })
  } catch (error) {
    console.error('Pro access failed:', error.message)
    return res.status(400).json({ error: 'Invalid request' })
  }
}
