import { env, html, sendHtml, telegram } from './_telegram.js'
import { addProUser, getUserProfile, getVisitorProfile, hasUserStore, isProUser, issueProCode, listProUsers, listVisitorProfiles, saveUserProfile, saveVisitorProfile } from './_store.js'
import { createProCode, hashValue } from './_pro.js'

const TEAM_INVITE_URL = 'https://t.me/+NZqQCwLt0agxOTMy'
const TEAM_CHAT_ID = () => env('TELEGRAM_TEAM_CHAT_ID') || '-1004323111381'
const AUDIT_CHAT_ID = () => env('TELEGRAM_AUDIT_CHAT_ID')
const OWNER_CHAT_ID = () => env('TELEGRAM_OWNER_CHAT_ID') || '6876382325'
const PRO_GROUP_CHAT_ID = () => env('TELEGRAM_PRO_GROUP_CHAT_ID') || '-1004480846914'
const PRO_TOPIC_ID = () => Number(env('TELEGRAM_PRO_TOPIC_ID') || 69)
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
const userSnapshot = user => ({
  userId: user.id,
  firstName: user.first_name || '',
  lastName: user.last_name || '',
  username: user.username || '',
  languageCode: user.language_code || '',
  isPremium: Boolean(user.is_premium),
})
const sameSnapshot = (left, right) => left && right && Object.keys(right).every(key => left[key] === right[key])

function contactKeyboard() {
  return { keyboard: [[{ text: '📱 Kontaktimni ulashaman', request_contact: true }]], resize_keyboard: true, one_time_keyboard: true }
}

function mainMenu({ admin = false, pro = false } = {}) {
  const keyboard = [['🌐 Site', '❓ Savol berish'], ['💳 Donate', '🤝 Bizning jamoaga qo‘shilish']]
  if (pro) keyboard.push(['🔑 Code olish'])
  if (admin) keyboard.push(['👑 Pro users'])
  return { keyboard, resize_keyboard: true, is_persistent: true }
}

const isOwner = userId => String(userId) === OWNER_CHAT_ID()

async function proAudit(text) {
  try {
    await sendHtml(PRO_GROUP_CHAT_ID(), text, { message_thread_id: PRO_TOPIC_ID() })
  } catch (error) {
    console.error('Pro audit failed:', error.message)
  }
}

function proAdminMenu() {
  return { keyboard: [['➕ Pro user qo‘shish'], ['📋 Pro userlar'], ['⬅️ Orqaga']], resize_keyboard: true, is_persistent: true }
}

async function issueCodeForUser(chatId, userId) {
  if (!await isProUser(userId)) return sendHtml(chatId, 'Siz hali Pro user sifatida qo‘shilmagansiz.')
  const code = createProCode()
  if (!await issueProCode(userId, hashValue(code))) return sendHtml(chatId, 'Code yaratilmadi. Database sozlamalarini tekshiring.')
  await proAudit(`<b>Pro code yaratildi</b>\n<b>User ID:</b> <code>${html(userId)}</code>\n<b>Code:</b> <code>${html(code)}</code>`)
  return sendHtml(chatId, `<b>Sizning bir martalik Pro code’ingiz:</b>\n\n<code>${html(code)}</code>\n\nBu code faqat bir marta ishlaydi va kiritilgandan keyin ushbu qurilmada 6 soat amal qiladi.`, { reply_markup: mainMenu({ pro: true }) })
}

const chatRequests = {
  '/own_channel': { requestId: 201, label: '📢 O‘z kanalimni tanlash', chatIsChannel: true, chatIsCreated: true, title: 'O‘zingiz yaratgan kanalni tanlang.' },
  '/own_channels': { requestId: 201, label: '📢 O‘z kanalimni tanlash', chatIsChannel: true, chatIsCreated: true, title: 'O‘zingiz yaratgan kanalni tanlang.' },
  '/own_group': { requestId: 202, label: '👥 O‘z guruhimni tanlash', chatIsChannel: false, chatIsCreated: true, title: 'O‘zingiz yaratgan guruhni tanlang.' },
  '/own_groups': { requestId: 202, label: '👥 O‘z guruhimni tanlash', chatIsChannel: false, chatIsCreated: true, title: 'O‘zingiz yaratgan guruhni tanlang.' },
  '/admin_channel': { requestId: 203, label: '📢 Admin kanalni tanlash', chatIsChannel: true, title: 'Admin bo‘lgan kanalingizni tanlang.' },
  '/admin_channels': { requestId: 203, label: '📢 Admin kanalni tanlash', chatIsChannel: true, title: 'Admin bo‘lgan kanalingizni tanlang.' },
  '/admin_group': { requestId: 204, label: '👥 Admin guruhni tanlash', chatIsChannel: false, title: 'Admin bo‘lgan guruhingizni tanlang.' },
  '/admin_groups': { requestId: 204, label: '👥 Admin guruhni tanlash', chatIsChannel: false, title: 'Admin bo‘lgan guruhingizni tanlang.' },
  '/admini_group': { requestId: 204, label: '👥 Admin guruhni tanlash', chatIsChannel: false, title: 'Admin bo‘lgan guruhingizni tanlang.' },
}

function chatPicker(command) {
  const request = chatRequests[command]
  return {
    keyboard: [[{ text: request.label, request_chat: { request_id: request.requestId, chat_is_channel: request.chatIsChannel, chat_is_created: request.chatIsCreated, request_title: true, request_username: true } }], [{ text: '⬅️ Orqaga' }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  }
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

async function showMainMenu(chatId, note = 'Asosiy menyu tayyor.', userId = null) {
  await sendHtml(chatId, note, { reply_markup: await menuForUser(userId) })
}

async function menuForUser(userId) {
  return mainMenu({ admin: userId !== null && isOwner(userId), pro: userId !== null && await isProUser(userId) })
}

async function showProUserPicker(chatId) {
  const users = (await listVisitorProfiles()).filter(user => !user.is_pro)
  if (!users.length) return sendHtml(chatId, 'Qo‘shish uchun hali botdan o‘tgan yangi user topilmadi.', { reply_markup: proAdminMenu() })
  const inline_keyboard = users.slice(0, 30).map(row => {
    const visitor = row.visitor || {}
    const name = [visitor.firstName, visitor.lastName].filter(Boolean).join(' ') || visitor.username || row.user_id
    return [{ text: `${name} · ${row.user_id}`, callback_data: `pro:add:${row.user_id}` }]
  })
  return sendHtml(chatId, '<b>Pro userga aylantirish uchun userni tanlang:</b>', { reply_markup: { inline_keyboard } })
}

async function showProUsers(chatId) {
  const users = await listProUsers()
  if (!users.length) return sendHtml(chatId, 'Hozircha Pro userlar yo‘q.', { reply_markup: proAdminMenu() })
  const lines = users.map((row, index) => {
    const visitor = row.visitor || {}
    const name = [visitor.firstName, visitor.lastName].filter(Boolean).join(' ') || visitor.username || 'Noma’lum'
    return `${index + 1}. <b>${html(name)}</b> — <code>${html(row.user_id)}</code>`
  })
  return sendHtml(chatId, `<b>Pro userlar:</b>\n\n${lines.join('\n')}`, { reply_markup: proAdminMenu() })
}

async function handleCallbackQuery(query) {
  const from = query.from || {}
  if (!isOwner(from.id)) {
    await telegram('answerCallbackQuery', { callback_query_id: query.id, text: 'Bu menyu faqat admin uchun.', show_alert: true })
    return
  }
  const data = query.data || ''
  if (data.startsWith('pro:add:')) {
    const userId = Number(data.slice('pro:add:'.length))
    const added = Number.isSafeInteger(userId) && await addProUser(userId, from.id)
    await telegram('answerCallbackQuery', { callback_query_id: query.id, text: added ? 'Pro user qo‘shildi.' : 'Qo‘shib bo‘lmadi.' })
    if (added) {
      await proAudit(`<b>Yangi Pro user qo‘shildi</b>\n<b>User ID:</b> <code>${html(userId)}</code>\n<b>Admin:</b> <code>${html(from.id)}</code>`)
      return sendHtml(query.message.chat.id, `User <code>${html(userId)}</code> Pro user sifatida qo‘shildi. Endi u botdagi <b>🔑 Code olish</b> tugmasidan code olishi mumkin.`, { reply_markup: proAdminMenu() })
    }
  }
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
    const previousProfile = hasUserStore() ? await getUserProfile(from.id) : null
    const profile = { ...userSnapshot(from), chatId: chat.id, contactFirstName: contact.first_name || '', contactLastName: contact.last_name || '', phone: contact.phone_number, contactUserId: contact.user_id || null, updatedAt: new Date().toISOString() }
    const sameContact = previousProfile && ['userId', 'firstName', 'lastName', 'username', 'languageCode', 'isPremium', 'chatId', 'contactFirstName', 'contactLastName', 'phone', 'contactUserId'].every(key => previousProfile[key] === profile[key])
    if (hasUserStore()) await saveUserProfile(from.id, profile)
    if (!sameContact) await audit('userContact', `<b>Bot / contact tasdiqlandi</b>\n\n${userDetails(from)}\n<b>Telefon:</b> ${html(contact.phone_number)}\n<b>Contact user ID:</b> <code>${html(contact.user_id || 'Yo‘q')}</code>\n<b>Vaqt:</b> ${html(profile.updatedAt)}`)
    return showMainMenu(chat.id, `<b>Rahmat, kontaktingiz tasdiqlandi.</b>\n\nTelegram: @${html(ownerUsername())}\nGmail masalasi bo‘yicha @${html(ownerUsername())} ga yozing.`, from.id)
  }

  if (isQuestionReply(message)) {
    await audit('questions', `<b>Bot / savol</b>\n\n${userDetails(from)}\n<b>Savol:</b> ${html(text)}\n<b>Vaqt:</b> ${html(new Date().toISOString())}`)
    return showMainMenu(chat.id, 'Savolingiz yuborildi. Javob imkon qadar tez beriladi.', from.id)
  }

  if (message.chat_shared) {
    const shared = message.chat_shared
    const name = shared.title || shared.username || `Chat ID: ${shared.chat_id}`
    return showMainMenu(chat.id, `<b>Chat tanlandi:</b> ${html(name)}\n<code>${html(shared.chat_id)}</code>\n\nBot faqat siz tanlagan chatni ko‘ra oladi.`, from.id)
  }

  if (command === '/start') {
    const source = text.match(/^\/start\s+(telegram|email)$/i)?.[1]?.toLowerCase() || 'oddiy start'
    const visitor = { ...userSnapshot(from), chatId: chat.id }
    const previousVisitor = hasUserStore() ? await getVisitorProfile(from.id) : null
    if (!sameSnapshot(previousVisitor, visitor)) {
      await audit('users', `<b>Bot / yangi kirish</b>\n<b>Manba:</b> ${html(source)}\n${userDetails(from)}\n<b>Chat ID:</b> <code>${html(chat.id)}</code>\n<b>Vaqt:</b> ${html(new Date().toISOString())}`)
      if (hasUserStore()) await saveVisitorProfile(from.id, visitor)
    }
    const profile = hasUserStore() ? await getUserProfile(from.id) : null
    const pro = hasUserStore() && await isProUser(from.id)
    if (profile || pro || isOwner(from.id)) return showMainMenu(chat.id, pro ? 'Pro menyu tayyor.' : `Qaytganingizdan xursandmiz, ${html(profile?.firstName || 'admin')}.`, from.id)
    const request = source === 'email' ? 'Gmail bo‘yicha murojaat qilish' : 'Telegram kontaktini olish'
    return sendHtml(chat.id, `<b>${request}</b> uchun avval pastdagi tugma orqali kontaktingizni tasdiqlang.`, { reply_markup: contactKeyboard() })
  }

  if (isOwner(from.id) && text === '👑 Pro users') return sendHtml(chat.id, '<b>Pro users boshqaruvi</b>', { reply_markup: proAdminMenu() })
  if (isOwner(from.id) && text === '➕ Pro user qo‘shish') return showProUserPicker(chat.id)
  if (isOwner(from.id) && text === '📋 Pro userlar') return showProUsers(chat.id)
  if (text === '🔑 Code olish') return issueCodeForUser(chat.id, from.id)
  if (text === '🌐 Site') return sendHtml(chat.id, '<a href="https://abdulmalik.uz">abdulmalik.uz</a>', { reply_markup: await menuForUser(from.id) })
  if (text === '💳 Donate' || command === '/donate') return sendHtml(chat.id, '<b>Donate</b>\n\nHozircha test karta: <code>1234 1234 1234 1324</code>\n\nHaqiqiy karta keyin yangilanadi.', { reply_markup: await menuForUser(from.id) })
  if (text === '❓ Savol berish') return sendHtml(chat.id, 'Savolingizni yozing. U alohida topicga yuboriladi.', { reply_markup: { force_reply: true, input_field_placeholder: 'Savolingizni yozing…' } })
  if (chatRequests[command]) return sendHtml(chat.id, `${chatRequests[command].title}\n\nPastdagi tugmani bosing.`, { reply_markup: chatPicker(command) })
  if (text === '⬅️ Orqaga') return showMainMenu(chat.id, 'Asosiy menyu tayyor.', from.id)
  if (text === '🤝 Bizning jamoaga qo‘shilish') {
    const member = await isTeamMember(from.id)
    const note = member ? 'Siz jamoa guruhiga allaqachon qo‘shilgansiz.' : 'Jamoaga qo‘shilish uchun quyidagi havolani bosing.'
    return sendHtml(chat.id, `${note}\n\n<a href="${TEAM_INVITE_URL}">Bizning jamoaga qo‘shilish</a>`, { reply_markup: await menuForUser(from.id) })
  }
  return showMainMenu(chat.id, 'Asosiy menyu tayyor.', from.id)
}

async function handleGroupMessage(message) {
  const chat = message.chat
  const from = message.from || {}
  const command = message.text?.trim().split(/\s+/)[0]?.toLowerCase()
  if (command === '/topicid' && isOwner(from.id)) {
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
    if (update.callback_query) await handleCallbackQuery(update.callback_query)
    else if (update.message?.chat?.type === 'private') await handlePrivateMessage(update.message)
    else if (update.message) await handleGroupMessage(update.message)
    else if (update.chat_member) await handleMemberUpdate(update)
    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook failed:', error.message)
    return res.status(500).end()
  }
}
