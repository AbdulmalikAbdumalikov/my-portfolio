import { useState } from 'react'
import { ArrowUp, ArrowUpRight, Mail, MessageCircle, Phone, Send, User, X } from 'lucide-react'
import PlexusBackground from './PlexusBackground'
import { site } from '../data/site'

const copy = {
  uz: {
    eyebrow: '04 / ALOQA',
    note: 'Yangi loyiha, hamkorlik yoki shunchaki yaxshi g\u2018oya bormi? Xabaringizni qoldiring.',
    name: 'Ismingiz', surname: 'Familiyangiz', email: 'Email', phone: 'Telefon (ixtiyoriy)', message: 'Xabaringiz',
    socials: 'Meni shu yerda ham topasiz', unavailable: 'Havola hali kiritilmagan',
    pending: 'Xabar yuborilmoqda…', sent: 'Xabaringiz yetkazildi. Rahmat!', error: 'Xabar yuborilmadi. Birozdan so‘ng qayta urinib ko‘ring.',
    consent: 'Mening xabarim yuborilishiga roziman.',
    status: "it's more about hard work than talent", back: 'Yuqoriga',
  },
  en: {
    eyebrow: '04 / CONTACT',
    note: 'Have a new project, collaboration or simply a good idea? Leave me a message.',
    name: 'Your name', surname: 'Your surname', email: 'Email', phone: 'Phone (optional)', message: 'Your message',
    socials: 'Find me elsewhere', unavailable: 'Link has not been added yet',
    pending: 'Sending your message…', sent: 'Your message was delivered. Thank you!', error: 'The message could not be sent. Please try again shortly.',
    consent: 'I agree to have my message sent.',
    status: "it's more about hard work than talent", back: 'Back to top',
  },
  ru: {
    eyebrow: '04 / КОНТАКТЫ',
    note: 'Есть новый проект, идея или предложение о сотрудничестве? Оставьте сообщение.',
    name: 'Ваше имя', surname: 'Ваша фамилия', email: 'Email', phone: 'Телефон (необязательно)', message: 'Сообщение',
    socials: 'Я также здесь', unavailable: 'Ссылка пока не добавлена',
    pending: 'Форма готова. Осталось подключить адрес отправки.',
    status: "it's more about hard work than talent", back: 'Наверх',
  },
}

const channels = [
  { id: 'instagram', label: 'Instagram', icon: '/social-icons/instagram.svg' },
  { id: 'telegram', label: 'Telegram', icon: '/social-icons/telegram.svg' },
  { id: 'github', label: 'GitHub', icon: '/social-icons/github.svg' },
  { id: 'gmail', label: 'Gmail', icon: '/social-icons/gmail.svg' },
  { id: 'linkedin', label: 'LinkedIn', icon: '/social-icons/linkedin.svg' },
  { id: 'discord', label: 'Discord', icon: '/social-icons/discord.svg' },
  { id: 'mentors', label: 'Ustozlarim', icon: '/social-icons/mentors.svg' },
]

function SocialLink({ channel, compact = false, onOpen }) {
  return <button type="button" className={`contact-social${compact ? ' is-compact' : ''}${channel.id === 'mentors' ? ' is-mentors' : ''}`} onClick={() => onOpen(channel)} aria-label={`${channel.label} kontaktlari`} title={channel.label}>
      <span className="contact-social-icon"><img src={channel.icon} alt="" aria-hidden="true" /></span>
      {(!compact || channel.id === 'mentors') && <><b>{channel.label}</b>{!compact && <ArrowUpRight size={15} aria-hidden="true" />}</>}
    </button>
}

function ContactModal({ channel, onClose }) {
  if (!channel) return null
  const link = (href, label, note) => <a className="contact-modal-link" href={href} target="_blank" rel="noreferrer"><span>{label}</span>{note && <small>{note}</small>}<ArrowUpRight size={16} aria-hidden="true" /></a>
  const content = {
    instagram: <div className="contact-modal-accounts">{link('https://www.instagram.com/abdulmalik_developer/', 'abdulmalik_developer', 'Shaxsiy account')}{link('https://www.instagram.com/windows11pro_/', 'windows11pro_', 'Ish account')}</div>,
    telegram: <><p className="contact-modal-handle">@bot_for_contact_bot</p><p>Kontaktingizni tasdiqlang va mening Telegram profilimni oling.</p>{link('https://t.me/bot_for_contact_bot?start=telegram', 'Botni ochish')}</>,
    github: <><p className="contact-modal-handle">github.com/AbdulmalikAbdumalikov</p>{link('https://github.com/AbdulmalikAbdumalikov', 'GitHub profilini ochish')}<p className="contact-modal-chance">Javob berish ehtimoli: <b>30%</b></p></>,
    gmail: <><p className="contact-modal-handle">@bot_for_contact_bot</p><p>Email bo‘yicha murojaat qilish uchun avval botda kontaktingizni tasdiqlang.</p>{link('https://t.me/bot_for_contact_bot?start=email', 'Botni ochish')}</>,
    linkedin: <><p className="contact-modal-handle">linkedin.com/in/abdulmalikabdumalikov</p>{link('https://www.linkedin.com/in/abdulmalikabdumalikov', 'LinkedIn profilini ochish')}<p className="contact-modal-chance">Javob berish ehtimoli: <b>40%</b></p></>,
    discord: <><p className="contact-modal-handle">selerown</p><p>Discord’da shu username orqali topishingiz mumkin.</p>{link('https://discord.com', 'Discordni ochish')}<p className="contact-modal-chance">Javob berish ehtimoli: <b>25%</b></p></>,
    mentors: <div className="contact-modal-accounts">{link('https://www.bunyodbeknurmamatov.uz/', 'bunyodbeknurmamatov.uz')}{link('https://dapper-manatee-c95601.netlify.app/', 'dapper-manatee-c95601.netlify.app')}{link('https://t.me/butterflyeffect_571', '@butterflyeffect_571 / Telegram')}{link('https://www.instagram.com/muhammadali_eshonqulov', 'muhammadali_eshonqulov / Instagram')}{link('https://t.me/Muhammadali_Eshonqulov', '@Muhammadali_Eshonqulov / Telegram')}</div>,
  }[channel.id]
  return <div className="contact-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="contact-modal" role="dialog" aria-modal="true" aria-label={`${channel.label} kontaktlari`}><button className="contact-modal-close" type="button" onClick={onClose} aria-label="Modalni yopish"><X size={18} /></button><div className="contact-modal-title"><img src={channel.icon} alt="" /><div><p>CONTACT / {channel.label.toUpperCase()}</p><h3>{channel.label}</h3></div></div><div className="contact-modal-content">{content}</div></section></div>
}

export default function ContactSection({ lang = 'uz', title, sendLabel }) {
  const [pending, setPending] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [activeChannel, setActiveChannel] = useState(null)
  const [messageScroll, setMessageScroll] = useState({ visible: false, size: 100, top: 0 })
  const t = copy[lang] || copy.uz

  const syncMessageScroll = field => {
    const visible = field.scrollHeight > field.clientHeight + 1
    const size = visible ? Math.max(18, field.clientHeight / field.scrollHeight * 100) : 100
    const progress = visible ? field.scrollTop / (field.scrollHeight - field.clientHeight) : 0
    setMessageScroll({ visible, size, top: progress * (100 - size) })
  }

  const updateMessageScroll = event => {
    const field = event.currentTarget
    syncMessageScroll(field)
  }

  const updateMessageScrollAfterInput = event => {
    const field = event.currentTarget
    requestAnimationFrame(() => syncMessageScroll(field))
  }

  const submit = async event => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    if (pending) return
    const form = event.currentTarget
    const formData = Object.fromEntries(new FormData(form))
    if (formData.website) return
    setPending(true)
    setSubmitStatus('')
    try {
      const response = await fetch(site.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error('Delivery failed')
      form.reset()
      setSubmitStatus('sent')
    } catch {
      setSubmitStatus('error')
    } finally {
      setPending(false)
    }
  }

  return (
    <section id="contact" className="contact-ending">
      <PlexusBackground subtle />
      <div className="contact-stage">
        <header className="contact-heading">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{title}</h2>
          <p>{t.note}</p>
        </header>

        <div className="contact-reveal-panel">
          <form className="contact-form" onSubmit={submit}>
            <div className="contact-field"><User size={17} /><label><span>{t.name}</span><input name="name" autoComplete="name" required /></label></div>
            <div className="contact-field"><User size={17} /><label><span>{t.surname}</span><input name="surname" autoComplete="family-name" required /></label></div>
            <div className="contact-field"><Mail size={17} /><label><span>{t.email}</span><input name="email" type="email" autoComplete="email" required /></label></div>
            <div className="contact-field is-phone"><Phone size={17} /><label><span>{t.phone}</span><input name="phone" type="tel" autoComplete="tel" /></label></div>
            <div className="contact-field is-message">
              <MessageCircle size={17} />
              <label><span>{t.message}</span><textarea name="message" rows="5" onInput={updateMessageScroll} onScroll={updateMessageScroll} onKeyUp={updateMessageScrollAfterInput} onWheel={updateMessageScrollAfterInput} required /></label>
              <span
                className={`message-scroll-indicator${messageScroll.visible ? ' is-visible' : ''}`}
                style={{ '--message-thumb-size': `${messageScroll.size}%`, '--message-thumb-top': `${messageScroll.top}%` }}
                aria-hidden="true"
              ><i /></span>
            </div>
            <label className="contact-consent"><input name="consent" type="checkbox" required /><span>{t.consent}</span></label>
            <input name="website" className="contact-honeypot" tabIndex="-1" autoComplete="off" aria-hidden="true" />
            <div className="contact-submit-row">
              <button className="contact-submit" type="submit" disabled={pending}>{pending ? t.pending : sendLabel}<Send size={17} /></button>
              {submitStatus && <p role="status" className={submitStatus === 'error' ? 'is-error' : ''}>{t[submitStatus]}</p>}
            </div>
          </form>

          <aside className="contact-networks">
            <div><span className="contact-orbit-dot" /><p>{t.socials}</p></div>
            <div className="contact-social-grid">
              {channels.map(channel => <SocialLink key={channel.id} channel={channel} onOpen={setActiveChannel} />)}
            </div>
          </aside>
        </div>
      </div>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-identity"><img className="footer-brand-logo" src="/brand/aa-mark.png" alt="Abdulmalik logosi" /><span>© {new Date().getFullYear()} {site.name.toUpperCase()}</span></div>
          <div className="footer-status">{t.status}</div>
          <div className="footer-socials">{channels.map(channel => <SocialLink key={channel.id} channel={channel} compact onOpen={setActiveChannel} />)}</div>
          <a className="footer-top" href="#home"><span>{t.back}</span><ArrowUp size={15} /></a>
        </div>
      </footer>
      <ContactModal channel={activeChannel} onClose={() => setActiveChannel(null)} />
    </section>
  )
}
