import { env, html, sendHtml } from './_telegram.js'

const MAX = { name: 80, surname: 80, email: 254, phone: 40, message: 3000 }
const text = (body, key) => String(body?.[key] ?? '').trim()
const valid = (value, max) => value.length > 0 && value.length <= max

function readBody(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body)
  return req.body || {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = readBody(req)
    if (text(body, 'website')) return res.status(204).end()
    const name = text(body, 'name')
    const surname = text(body, 'surname')
    const email = text(body, 'email').toLowerCase()
    const phone = text(body, 'phone')
    const message = text(body, 'message')
    const consent = body.consent === 'on' || body.consent === true

    if (!consent || !valid(name, MAX.name) || !valid(surname, MAX.surname) || !valid(email, MAX.email) || !valid(message, MAX.message) || phone.length > MAX.phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid message data' })
    }

    const ownerChatId = env('TELEGRAM_OWNER_CHAT_ID')
    if (!ownerChatId) throw new Error('Owner chat is not configured.')

    // The owner receives exactly the fields requested for a site message.
    await sendHtml(ownerChatId, `<b>Yangi sayt xabari</b>\n\n<b>Ism:</b> ${html(name)}\n<b>Familiya:</b> ${html(surname)}\n<b>Email:</b> ${html(email)}\n<b>Xabar:</b> ${html(message)}`)

    // The audit group receives only voluntarily supplied form data.
    const auditChatId = env('TELEGRAM_AUDIT_CHAT_ID')
    if (auditChatId) {
      const source = req.headers.referer || 'Direct form request'
      await sendHtml(auditChatId, `<b>Portfolio / forma logi</b>\n\n<b>Ism:</b> ${html(name)}\n<b>Familiya:</b> ${html(surname)}\n<b>Email:</b> ${html(email)}\n<b>Telefon:</b> ${html(phone || 'Berilmagan')}\n<b>Xabar:</b> ${html(message)}\n<b>Manba:</b> ${html(source)}\n<b>Vaqt:</b> ${html(new Date().toISOString())}`)
    }
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Contact delivery failed:', error.message)
    return res.status(500).json({ error: 'Message delivery failed' })
  }
}
