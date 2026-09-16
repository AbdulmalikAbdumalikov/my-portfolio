import { env, html, sendHtml, telegram } from './_telegram.js'
import { getUserProfile, hasUserStore, saveUserProfile } from './_store.js'

const TEAM_INVITE_URL = 'https://t.me/+NZqQCwLt0agxOTMy'
const TEAM_CHAT_ID = () => env('TELEGRAM_TEAM_CHAT_ID') || '-1004323111381'
const AUDIT_CHAT_ID = () => env('TELEGRAM_AUDIT_CHAT_ID')
const ownerUsername = () => env('PORTFOLIO_TELEGRAM_USERNAME') || 'Abdulmalik_Abdumalikov'
const topicEnv = { users: 'TELEGRAM_TOPIC_USERS_ID', commands: 'TELEGRAM_TOPIC_COMMANDS_ID', userContact: 'TELEGRAM_TOPIC_USER_CONTACT_ID', questions: 'TELEGRAM_TOPIC_QUESTIONS_ID' }
const commonBlockedWords = ['fuck', 'shit', 'bitch', 'asshole', 'сука', 'блять', 'хуй', 'пизда', 'ебать', 'мудак', 'долбоеб']

const topicId = topic => {
  const value = Number(env(topicEnv[topic]))
  return Number.isInteger(value) && value > 0 ? value : null
}

async function audit(topic, text) {
  const chatId = AUDIT_CHAT_ID()
  const threadId = topicId(topic)
  if (!chatId || !threadId) return
  try { await sendHtml(chatId, text, { message_thread_id: threadId }) } catch (error) { console.error(`Audit ${topic} failed:`, error.message) }
}

const label = value => html(value || 'Yo‘q')
const userDetails = user => `<b>Ism:</b> ${label(user.first_name)} ${label(user.last_name)}\n<b>Username:</b> ${label(user.username ? '@' + user.username : null)}\n<b>User ID:</b> <code>${html(user.id)}</code>\n<b>Til:</b> ${label(user.language_code)}\n<b>Premium:</b> ${user.is_premium ? 'Ha' : 'Yo‘q'}\n<b>Bot:</b> ${user.is_bot ? 'Ha' : 'Yo‘q'}`

function contactKeyboard() {
  return { keyboard: [[{ text: '📱 Kontaktimni ulashaman', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true }
}

function mainMenu() {
  return { keyboard: [['🌐 Site', '❓ Savol berish'], ['💳 Donate', '🤝 Bizning jamoaga qo‘shilish']], resize_keyboard: true, is_persistent: true }
}

const isQuestionReply = message => message.reply_to_message?.from?.is_bot && /savolingizni yozing/i.test(message.reply_to_message.text || '')
const messageType = message => message.text ? 'text' : message.contact ? 'contact' : message.photo ? 'photo' : message.video ? 'video' : message.document ? 'document' : message.voice ? 'voice' : message.sticker ? 'sticker' : 'other'

function hasBlockedWord(message) {
  const customWords = env('MODERATION_WORDS').split(',').map(word => word.trim().toLowerCase()).filter(Boolean)
  const words = [...commonBlockedWords, ...customWords]
  const normalized = (message.text || message.caption || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ')
  return words.some(word => normalized.split(' ').includes(word))
}

async function isTeamMember(userId) {
  try {
    const member = await telegram('getChatMember', { chat_id: TEAM_CHAT_ID(), user_id: userId })
    return ['creator', 'administrator', 'member'].includes(member.status) || (member.status === 'restricted' && member.is_member)
  } catch { return false }
}

async function showMainMenu(chatId, note = 'Asosiy menyu tayyor.') {
  await sendHtml(chatId, note, { reply_markup: mainMenu() })
}

async function handlePrivateMessage(message) {
  const chat = message.chat
  const from = message.from || {}
  const text = message.text?.trim() || ''
  const command = text.split(/\s+/)[0]?.toLowerCase()
  await audit('commands', `<b>Bot / xabar</b>\n<b>Turi:</b> ${html(messageType(message))}\n${userDetails(from)}\n<b>Matn:</b> ${html(text || '—')}\n<b>Vaqt:</b> ${html(new Date().toISOString())}`)

  if (message.contact) {
    const contact = message.contact
    if (contact.user_id && contact.user_id !== from.id) return sendHtml(chat.id, 'Faqat o‘zingizning kontaktingizni ulashing.')
    const profile = { chatId: chat.id, userId: from.id, firstName: contact.first_name, lastName: contact.last_name || '', phone: contact.phone_number, username: from.username || '', updatedAt: new Date().toISOString() }
    if (hasUserStore()) await saveUserProfile(from.id, profile)
    await audit('userContact', `<b>Bot / contact tasdiqlandi</b>\n\n${userDetails(from)}\n<b>Telefon:</b> ${html(contact.phone_number)}\n<b>Contact user ID:</b> <code>${html(contact.user_id || 'Yo‘q')}</code>\n<b>Vaqt:</b> ${html(profile.updatedAt)}`)
    return showMainMenu(chat.id, `<b>Rahmat, kontaktingiz tasdiqlandi.</b>\n\nTelegram: @${html(ownerUsername())}\nGmail masalasi bo‘yicha @${html(ownerUsername())} ga yozing.`)
  }

  if (isQuestionReply(message)) {
    await audit('questions', `<b>Bot / savol</b>\n\n${userDetails(from)}\n<b>Savol:</b> ${html(text)}\n<b>Vaqt:</b> ${html(new Date().toISOString())}`)
    return showMainMenu(chat.id, 'Savolingiz yuborildi. Javob imkon qadar tez beriladi.')
  }

  if (command === '/start') {
    const source = text.match(/^\/start\s+(telegram|email)$/i)?.[1]?.toLowerCase() || 'oddiy start'
    await audit('users', `<b>Bot / yangi kirish</b>\n<b>Manba:</b> ${html(source)}\n${userDetails(from)}\n<b>Chat ID:</b> <code>${html(chat.id)}</code>\n<b>Vaqt:</b> ${html(new Date().toISOString())}`)
    const profile = hasUserStore() ? await getUserProfile(from.id) : null
    if (profile) return showMainMenu(chat.id, `Qaytganingizdan xursandmiz, ${html(profile.firstName)}.`)
    const request = source === 'email' ? 'Gmail bo‘yicha murojaat qilish' : 'Telegram kontaktini olish'
    return sendHtml(chat.id, `<b>${request}</b> uchun avval pastdagi tugma orqali kontaktingizni tasdiqlang.`, { reply_markup: contactKeyboard() })
  }

  if (text === '🌐 Site') return sendHtml(chat.id, '<a href="https://abdulmalik.uz">abdulmalik.uz</a>', { reply_markup: mainMenu() })
  if (text === '💳 Donate' || command === '/donate') return sendHtml(chat.id, '<b>Donate</b>\n\nHozircha test karta: <code>1234 1234 1234 1324</code>\n\nHaqiqiy karta keyin yangilanadi.', { reply_markup: mainMenu() })
  if (text === '❓ Savol berish') return sendHtml(chat.id, 'Savolingizni yozing. U alohida topicga yuboriladi.', { reply_markup: { force_reply: true, input_field_placeholder: 'Savolingizni yozing…' } })
  if (text === '🤝 Bizning jamoaga qo‘shilish') {
    const member = await isTeamMember(from.id)
    const note = member ? 'Siz jamoa guruhiga allaqachon qo‘shilgansiz.' : 'Jamoaga qo‘shilish uchun quyidagi havolani bosing.'
    return sendHtml(chat.id, `${note}\n\n<a href="${TEAM_INVITE_URL}">Bizning jamoaga qo‘shilish</a>`, { reply_markup: mainMenu() })
  }
  return showMainMenu(chat.id)
}

async function handleGroupMessage(message) {
  const chat = message.chat
  const from = message.from || {}
  const command = message.text?.trim().split(/\s+/)[0]?.toLowerCase()
  if (command === '/topicid' && String(from.id) === env('TELEGRAM_OWNER_CHAT_ID')) {
    return sendHtml(chat.id, `Chat ID: <code>${html(chat.id)}</code>\nTopic ID: <code>${html(message.message_thread_id || 'GENERAL')}</code>`, message.message_thread_id ? { message_thread_id: message.message_thread_id } : {})
  }
  if (String(chat.id) !== TEAM_CHAT_ID()) return
  if (message.left_chat_member && !message.left_chat_member.is_bot) {
    const profile = hasUserStore() ? await getUserProfile(message.left_chat_member.id) : null
    if (profile?.chatId) await sendHtml(profile.chatId, `Nega bizning jamoani tark etdingiz? Qaytib qo‘shilishingiz mumkin:\n<a href="${TEAM_INVITE_URL}">Jamoaga qo‘shilish</a>`)
    return
  }
  if (hasBlockedWord(message)) {
    try { await telegram('deleteMessage', { chat_id: chat.id, message_id: message.message_id }) } catch (error) { console.error('Moderation delete failed:', error.message) }
  }
}

async function handleMemberUpdate(update) {
  const change = update.chat_member
  if (!change || String(change.chat.id) !== TEAM_CHAT_ID()) return
  const active = member => ['creator', 'administrator', 'member'].includes(member?.status) || (member?.status === 'restricted' && member.is_member)
  if (!active(change.old_chat_member) || active(change.new_chat_member) || change.new_chat_member.user.is_bot) return
  const profile = hasUserStore() ? await getUserProfile(change.new_chat_member.user.id) : null
  if (profile?.chatId) await sendHtml(profile.chatId, `Nega bizning jamoani tark etdingiz? Qaytib qo‘shilishingiz mumkin:\n<a href="${TEAM_INVITE_URL}">Jamoaga qo‘shilish</a>`)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const secret = env('TELEGRAM_WEBHOOK_SECRET')
  if (!secret || req.headers['x-telegram-bot-api-secret-token'] !== secret) return res.status(401).end()
  try {
    const update = req.body || {}
    if (update.message?.chat?.type === 'private') await handlePrivateMessage(update.message)
    else if (update.message) await handleGroupMessage(update.message)
    else if (update.chat_member) await handleMemberUpdate(update)
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook failed:', error.message)
    return res.status(500).end()
  }
}
