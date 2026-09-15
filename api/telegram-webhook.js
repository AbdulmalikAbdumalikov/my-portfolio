import { env, html, sendHtml } from './_telegram.js'

const ownerUsername = () => env('PORTFOLIO_TELEGRAM_USERNAME') || 'Abdulmalik_Abdumalikov'

async function audit(text) {
  const auditChatId = env('TELEGRAM_AUDIT_CHAT_ID')
  if (auditChatId) await sendHtml(auditChatId, text)
}

function contactKeyboard() {
  return {
    keyboard: [[{ text: '📱 Kontaktimni ulashaman', request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const secret = env('TELEGRAM_WEBHOOK_SECRET')
  if (!secret || req.headers['x-telegram-bot-api-secret-token'] !== secret) return res.status(401).end()

  const message = req.body?.message
  if (!message) return res.status(200).json({ ok: true })

  try {
    const chat = message.chat
    const from = message.from || {}
    const command = message.text?.trim().split(/\s+/)[0]?.toLowerCase()

    // Run this once in the audit group to discover the exact signed Telegram chat id.
    if (command === '/chatid' && chat?.type !== 'private') {
      await sendHtml(chat.id, `Bu guruhning chat IDsi: <code>${html(chat.id)}</code>`)
      return res.status(200).json({ ok: true })
    }

    if (chat?.type !== 'private') return res.status(200).json({ ok: true })

    if (command === '/donate') {
      await sendHtml(chat.id, '<b>Donate</b>\n\nHozircha test karta: <code>1234 1234 1234 1324</code>\n\nHaqiqiy karta keyin yangilanadi.')
      await audit(`<b>Bot / donate so‘rovi</b>\n${html(from.first_name)} · <code>${html(from.id)}</code>`)
      return res.status(200).json({ ok: true })
    }

    if (message.contact) {
      const contact = message.contact
      if (contact.user_id && contact.user_id !== from.id) {
        await sendHtml(chat.id, 'Faqat o‘zingizning kontaktingizni ulashing.')
        return res.status(200).json({ ok: true })
      }
      await audit(`<b>Bot / contact tasdiqlandi</b>\n\n<b>Ism:</b> ${html(contact.first_name)} ${html(contact.last_name || '')}\n<b>Telefon:</b> ${html(contact.phone_number)}\n<b>Username:</b> ${html(from.username ? '@' + from.username : 'Yo‘q')}\n<b>User ID:</b> <code>${html(from.id)}</code>\n<b>Chat ID:</b> <code>${html(chat.id)}</code>\n<b>Vaqt:</b> ${html(new Date().toISOString())}`)
      await sendHtml(chat.id, `<b>Rahmat, kontaktingiz tasdiqlandi.</b>\n\nTelegram: @${html(ownerUsername())}\n\nGmail masalasi bo‘yicha @${html(ownerUsername())} ga Telegram orqali murojaat qiling.`, { reply_markup: { remove_keyboard: true } })
      return res.status(200).json({ ok: true })
    }

    const source = message.text?.match(/^\/start\s+(telegram|email)$/i)?.[1]?.toLowerCase()
    const request = source === 'email' ? 'Gmail bo‘yicha murojaat qilish' : 'Telegram kontaktini olish'
    await sendHtml(chat.id, `<b>${request}</b> uchun avval pastdagi tugma orqali kontaktingizni tasdiqlang.\n\nFaqat o‘zingiz yuborgan ma’lumotlar audit guruhida saqlanadi.`, { reply_markup: contactKeyboard() })
    await audit(`<b>Bot / kirish</b>\n<b>Manba:</b> ${html(source || 'oddiy start')}\n<b>Ism:</b> ${html(from.first_name || '')}\n<b>Username:</b> ${html(from.username ? '@' + from.username : 'Yo‘q')}\n<b>Chat ID:</b> <code>${html(chat.id)}</code>`)
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook failed:', error.message)
    return res.status(500).end()
  }
}
