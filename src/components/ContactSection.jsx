import { useEffect, useRef, useState } from 'react'
import { ArrowUp, ArrowUpRight, Mail, MessageCircle, Phone, Send, User } from 'lucide-react'
import PlexusBackground from './PlexusBackground'
import { site } from '../data/site'

const copy = {
  uz: {
    eyebrow: '04 / ALOQA',
    note: 'Yangi loyiha, hamkorlik yoki shunchaki yaxshi g\u2018oya bormi? Xabaringizni qoldiring.',
    name: 'Ismingiz', surname: 'Familiyangiz', email: 'Email', phone: 'Telefon (ixtiyoriy)', message: 'Xabaringiz',
    socials: 'Meni shu yerda ham topasiz', unavailable: 'Havola hali kiritilmagan',
    pending: 'Forma tayyor. Yuborish manzili ulanishi kutilmoqda.',
    status: "it's more about hard work than talent", back: 'Yuqoriga',
  },
  en: {
    eyebrow: '04 / CONTACT',
    note: 'Have a new project, collaboration or simply a good idea? Leave me a message.',
    name: 'Your name', surname: 'Your surname', email: 'Email', phone: 'Phone (optional)', message: 'Your message',
    socials: 'Find me elsewhere', unavailable: 'Link has not been added yet',
    pending: 'The form is ready. A delivery address still needs to be connected.',
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
  { id: 'whatsapp', label: 'WhatsApp', icon: '/social-icons/whatsapp.svg' },
  { id: 'max', label: 'MAX', icon: '/social-icons/max.svg' },
  { id: 'discord', label: 'Discord', icon: '/social-icons/discord.svg' },
]

function SocialLink({ channel, compact = false, unavailable }) {
  const href = site.socials[channel.id]
  const Element = href ? 'a' : 'button'
  const linkProps = href ? { href, target: '_blank', rel: 'noreferrer' } : { type: 'button', disabled: true }
  return (
    <Element
      {...linkProps}
      className={`contact-social${compact ? ' is-compact' : ''}${href ? '' : ' is-pending'}`}
      aria-label={`${channel.label}${href ? '' : ` — ${unavailable}`}`}
      title={href ? channel.label : unavailable}
    >
      <span className="contact-social-icon"><img src={channel.icon} alt="" aria-hidden="true" /></span>
      {!compact && <><b>{channel.label}</b><ArrowUpRight size={15} aria-hidden="true" /></>}
    </Element>
  )
}

export default function ContactSection({ lang = 'uz', title, sendLabel }) {
  const sectionRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [pending, setPending] = useState(false)
  const [messageScroll, setMessageScroll] = useState({ visible: false, size: 100, top: 0 })
  const t = copy[lang] || copy.uz

  useEffect(() => {
    const checkBottom = () => {
      const distanceFromBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      setRevealed(isDirty || distanceFromBottom <= 120)
    }
    checkBottom()
    window.addEventListener('scroll', checkBottom, { passive: true })
    window.addEventListener('resize', checkBottom)
    return () => {
      window.removeEventListener('scroll', checkBottom)
      window.removeEventListener('resize', checkBottom)
    }
  }, [isDirty])

  const markAsDirty = event => {
    if (!isDirty && event.currentTarget.value.trim()) setIsDirty(true)
  }

  const syncMessageScroll = field => {
    const visible = field.scrollHeight > field.clientHeight + 1
    const size = visible ? Math.max(18, field.clientHeight / field.scrollHeight * 100) : 100
    const progress = visible ? field.scrollTop / (field.scrollHeight - field.clientHeight) : 0
    setMessageScroll({ visible, size, top: progress * (100 - size) })
  }

  const updateMessageScroll = event => {
    const field = event.currentTarget
    if (event.type === 'input') markAsDirty(event)
    syncMessageScroll(field)
  }

  const updateMessageScrollAfterInput = event => {
    const field = event.currentTarget
    requestAnimationFrame(() => syncMessageScroll(field))
  }

  const submit = event => {
    event.preventDefault()
    if (!event.currentTarget.reportValidity()) return
    if (!site.formEndpoint) setPending(true)
  }

  return (
    <section ref={sectionRef} id="contact" className={`contact-ending${revealed ? ' is-revealed' : ''}`}>
      <PlexusBackground subtle />
      <div className="contact-stage">
        <header className="contact-heading">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2>{title}</h2>
          <p>{t.note}</p>
        </header>

        <div className="contact-reveal-panel">
          <form className="contact-form" onSubmit={submit}>
            <div className="contact-field"><User size={17} /><label><span>{t.name}</span><input name="name" autoComplete="name" onInput={markAsDirty} required /></label></div>
            <div className="contact-field"><User size={17} /><label><span>{t.surname}</span><input name="surname" autoComplete="family-name" onInput={markAsDirty} required /></label></div>
            <div className="contact-field"><Mail size={17} /><label><span>{t.email}</span><input name="email" type="email" autoComplete="email" onInput={markAsDirty} required /></label></div>
            <div className="contact-field is-phone"><Phone size={17} /><label><span>{t.phone}</span><input name="phone" type="tel" autoComplete="tel" onInput={markAsDirty} /></label></div>
            <div className="contact-field is-message">
              <MessageCircle size={17} />
              <label><span>{t.message}</span><textarea name="message" rows="5" onInput={updateMessageScroll} onScroll={updateMessageScroll} onKeyUp={updateMessageScrollAfterInput} onWheel={updateMessageScrollAfterInput} required /></label>
              <span
                className={`message-scroll-indicator${messageScroll.visible ? ' is-visible' : ''}`}
                style={{ '--message-thumb-size': `${messageScroll.size}%`, '--message-thumb-top': `${messageScroll.top}%` }}
                aria-hidden="true"
              ><i /></span>
            </div>
            <div className="contact-submit-row">
              <button className="contact-submit" type="submit">{sendLabel}<Send size={17} /></button>
              {pending && <p role="status">{t.pending}</p>}
            </div>
          </form>

          <aside className="contact-networks">
            <div><span className="contact-orbit-dot" /><p>{t.socials}</p></div>
            <div className="contact-social-grid">
              {channels.map(channel => <SocialLink key={channel.id} channel={channel} unavailable={t.unavailable} />)}
            </div>
          </aside>
        </div>
      </div>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div className="footer-identity"><img className="footer-brand-logo" src="/brand/aa-mark.png" alt="Abdulmalik logosi" /><span>© {new Date().getFullYear()} {site.name.toUpperCase()}</span></div>
          <div className="footer-status">{t.status}</div>
          <div className="footer-socials">{channels.map(channel => <SocialLink key={channel.id} channel={channel} compact unavailable={t.unavailable} />)}</div>
          <a className="footer-top" href="#home"><span>{t.back}</span><ArrowUp size={15} /></a>
        </div>
      </footer>
    </section>
  )
}
