const API_BASE = 'https://api.telegram.org/bot'

const escapeHtml = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

export const env = name => process.env[name]?.trim() || ''

export async function telegram(method, payload) {
  const token = env('TELEGRAM_BOT_TOKEN')
  if (!token) throw new Error('Telegram is not configured.')

  const response = await fetch(`${API_BASE}${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error('Telegram request failed.')
  const data = await response.json()
  if (!data.ok) throw new Error('Telegram request was rejected.')
  return data.result
}

export const sendHtml = (chatId, text, extra = {}) => telegram('sendMessage', {
  chat_id: chatId,
  text,
  parse_mode: 'HTML',
  disable_web_page_preview: true,
  ...extra,
})

export const html = escapeHtml
