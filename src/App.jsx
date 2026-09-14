import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ArrowRight, Lightbulb, Menu, Moon, Sun, X } from 'lucide-react'
import PlexusBackground from './components/PlexusBackground'
import AboutCarousel from './components/AboutCarousel'
import ProjectCarousel from './components/ProjectCarousel'
import ContactSection from './components/ContactSection'
import { moreWork, planned, projects } from './data/site'

const SkillPlayground = lazy(() => import('./components/SkillPlayground'))
const InteractiveLamp = lazy(() => import('./components/InteractiveLamp'))

const i18n = {
  en: {
    nav: ['Home', 'About', 'Projects', 'Skills', 'Contact'], hello: 'Hello, I am',
    description: 'I build web applications, automation systems, Telegram bots and useful technology solutions.',
    work: 'View my work', contact: 'Contact me', aboutTitle: 'I build digital things.',
    aboutCopy: 'Uzbekistan-based developer focused on web development, automation, Telegram bots, APIs, systems and robotics.',
    featured: 'Featured work', more: 'More work', skills: 'Technology stack', lab: 'The Lab',
    mainProjects: 'Main projects', telegramBots: 'Telegram bots', plannedProjects: 'Planned projects', planned: 'PLANNED',
    contactTitle: 'Let\'s build something useful.', send: 'Send message', built: 'BUILT', active: 'BUILT / ACTIVE',
    badge: 'Developer & Tech Builder',
    roles: ['Web Developer', 'React Developer', 'Telegram Bot Builder', 'Automation Builder', 'Tech Builder'],
  },
  uz: {
    nav: ['Bosh sahifa', 'Men haqimda', 'Loyihalar', 'Ko‘nikmalar', 'Aloqa'], hello: 'Salom, men',
    description: 'Men web ilovalar, avtomatlashtirish tizimlari, Telegram botlar va foydali texnologik yechimlar yarataman.',
    work: 'Loyihalarimni ko‘rish', contact: 'Men bilan bog‘lanish', aboutTitle: 'Men raqamli mahsulotlar yarataman.',
    aboutCopy: 'O‘zbekistonda faoliyat yurituvchi web, avtomatlashtirish, Telegram botlar, API, tizimlar va robototexnikaga ixtisoslashgan dasturchi.',
    featured: 'Tanlangan loyihalar', more: 'Yana ishlar', skills: 'Texnologiyalar', lab: 'Laboratoriya',
    mainProjects: 'Asosiy loyihalar', telegramBots: 'Telegram botlar', plannedProjects: 'Rejalashtirilgan loyihalar', planned: 'REJALASHTIRILGAN',
    contactTitle: 'Keling, foydali narsa yarataylik.', send: 'Yuborish', built: 'YARATILGAN', active: 'YARATILGAN / ACTIVE',
    badge: 'Developer & Tech Builder',
    roles: ['Web Developer', 'React Developer', 'Telegram Bot Builder', 'Automation Builder', 'Tech Builder'],
  },
  ru: {
    nav: ['Главная', 'Обо мне', 'Проекты', 'Навыки', 'Контакты'], hello: 'Привет, я',
    description: 'Я создаю веб-приложения, системы автоматизации, Telegram-ботов и полезные технологические решения.',
    work: 'Смотреть проекты', contact: 'Связаться со мной', aboutTitle: 'Я создаю цифровые продукты.',
    aboutCopy: 'Разработчик из Узбекистана: веб-разработка, автоматизация, Telegram-боты, API, системы и робототехника.',
    featured: 'Избранные проекты', more: 'Другие работы', skills: 'Технологический стек', lab: 'Лаборатория',
    mainProjects: 'Основные проекты', telegramBots: 'Telegram-боты', plannedProjects: 'Запланированные проекты', planned: 'ЗАПЛАНИРОВАНО',
    contactTitle: 'Давайте создадим что-нибудь полезное.', send: 'Отправить', built: 'СОЗДАНО', active: 'СОЗДАНО / ACTIVE',
    badge: 'Developer & Tech Builder',
    roles: ['Веб-разработчик', 'React-разработчик', 'Разработчик Telegram-ботов', 'Специалист по автоматизации', 'Tech Builder'],
  },
}

const projectIcon = {
  ilmpage: '/original-icons/projects/ilmpage.svg',
  pcverse: '/original-icons/projects/pcverse-uz.svg',
  deorator: '/original-icons/projects/deorator-bot.svg',
  'tts-uz': '/original-icons/projects/tts-uz-bot.svg',
  'vodiy-taxi': '/original-icons/projects/vodiy-taxi-bot.svg',
}

const moreWorkIcon = {
  'CONVERTIO BOT': 'convertio-bot.svg',
  'INTIZOMLI BOT': 'intizomli-bot.svg',
  'YUKSALISH SCHOOL TEST BOT': 'yuksalish-test-bot.svg',
  'ULTIMA TAXI BOT': 'ultima-taxi-bot.svg',
  'MUSIC ISLAND BOT': 'music-island-bot.svg',
  'ANONYMOUS BOT': 'anonymous-bot.svg',
  'SOCIAL GROWTH WORKFLOW BOT': 'social-growth-bot.svg',
}

const workDescriptions = {
  'PERSONAL PORTFOLIO': 'Interactive personal portfolio built with React, motion and 3D experiences.',
  'CONVERTIO BOT': 'Telegram utility connected to Convertio workflows for convenient file conversion.',
  'INTIZOMLI BOT': 'Daily planning, reminders, rewards and discipline workflows in Telegram.',
  'YUKSALISH SCHOOL TEST BOT': 'Testing and lesson-checking system created for school students.',
  'ULTIMA TAXI BOT': 'Automation bot that distributes driver announcements to Telegram groups.',
  'MUSIC ISLAND BOT': 'Music discovery and listening experience designed inside Telegram.',
  'ANONYMOUS BOT': 'Anonymous feedback and message delivery for teams and organizations.',
  'SOCIAL GROWTH WORKFLOW BOT': 'Workflow automation for social media growth service operators.',
}

const aboutContent = {
  uz: [
    'Men, Abdulmalik Abdumalikov, web dasturlash, avtomatlashtirish va zamonaviy texnologiyalar yordamida foydali raqamli yechimlar yaratishga qiziqadigan dasturchiman. Java, Spring Boot, JavaScript, React, PostgreSQL va REST API kabi texnologiyalar bilan ishlayman. Shuningdek, Telegram botlar, Google Apps Script va turli API integratsiyalari orqali kundalik jarayonlarni soddalashtiruvchi va avtomatlashtiruvchi tizimlar yarataman.',
    'Men uchun dasturlash shunchaki kod yozish emas — mavjud muammoni tushunish va unga sodda, qulay hamda amaliy yechim topishdir. Shu sababli loyihalarimda foydalanuvchi tajribasi, kodning tartibliligi, tizimning barqarorligi va zamonaviy texnologiyalardan to‘g‘ri foydalanishga alohida e’tibor beraman. Web loyihalardan tashqari Telegram botlar, avtomatlashtirish tizimlari va turli raqamli servislar ustida ham ishlayman.',
    'Dasturiy ta’minot bilan birga kompyuter tizimlari va robototexnikaga ham qiziqaman. Windows va Linux muhitlari bilan ishlayman, Arduino, ESP32, sensorlar va IoT texnologiyalari orqali dasturiy ta’minotni real qurilmalar bilan bog‘lashni o‘rganib, amaliy loyihalar yarataman.',
    'Doimiy ravishda yangi texnologiyalarni o‘rganish, mavjud bilimlarimni chuqurlashtirish va murakkabroq loyihalar ustida ishlashga intilaman. Maqsadim — web, avtomatlashtirish, dasturiy tizimlar va hardware imkoniyatlarini birlashtirib, odamlar uchun haqiqatan ham foydali bo‘lgan zamonaviy texnologik mahsulotlar yaratish.',
  ],
  en: [
    'I am Abdulmalik Abdumalikov, a developer interested in creating useful digital solutions through web development, automation and modern technology. I work with Java, Spring Boot, JavaScript, React, PostgreSQL and REST APIs, as well as Telegram bots, Google Apps Script and API integrations.',
    'For me, programming is more than writing code — it is understanding a real problem and finding a simple, convenient and practical solution. I pay close attention to user experience, clean code, system stability and using modern technologies purposefully.',
    'Alongside software, I am interested in computer systems and robotics. I work with Windows and Linux and build practical experiments that connect software with Arduino, ESP32, sensors and IoT devices.',
    'I continuously learn new technologies and deepen my knowledge through more ambitious projects. My goal is to combine web, automation, software systems and hardware into modern products that are genuinely useful to people.',
  ],
  ru: [
    'Я — Абдулмалик Абдумаликов, разработчик, который создаёт полезные цифровые решения с помощью веб-разработки, автоматизации и современных технологий. Я работаю с Java, Spring Boot, JavaScript, React, PostgreSQL и REST API, а также с Telegram-ботами, Google Apps Script и различными API-интеграциями.',
    'Для меня программирование — это не просто написание кода, а понимание реальной проблемы и поиск простого, удобного и практичного решения. В своих проектах я уделяю внимание пользовательскому опыту, чистоте кода, стабильности системы и осознанному применению технологий.',
    'Помимо программного обеспечения, я интересуюсь компьютерными системами и робототехникой. Работаю в Windows и Linux и создаю практические проекты, связывающие программы с Arduino, ESP32, датчиками и IoT-устройствами.',
    'Я постоянно изучаю новые технологии, углубляю знания и стремлюсь работать над более сложными проектами. Моя цель — объединять веб, автоматизацию, программные системы и hardware в современные продукты, действительно полезные людям.',
  ],
}

function TypedRole({ prefix, roles }) {
  const [roleIndex, setRoleIndex] = useState(0)
  const [letterCount, setLetterCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLetterCount(roles[0].length)
      return undefined
    }
    const current = roles[roleIndex]
    const typed = !deleting && letterCount === current.length
    const erased = deleting && letterCount === 0
    const delay = typed ? 1450 : erased ? 250 : deleting ? 38 : 72
    const timer = setTimeout(() => {
      if (typed) setDeleting(true)
      else if (erased) {
        setDeleting(false)
        setRoleIndex(index => (index + 1) % roles.length)
      } else setLetterCount(count => count + (deleting ? -1 : 1))
    }, delay)
    return () => clearTimeout(timer)
  }, [deleting, letterCount, roleIndex, roles])

  useEffect(() => {
    setRoleIndex(0)
    setLetterCount(0)
    setDeleting(false)
  }, [roles])

  return <p className="typed-role" aria-live="polite"><span>{prefix}</span>{' '}<strong>{roles[roleIndex].slice(0, letterCount)}</strong><i aria-hidden="true" /></p>
}

export default function App() {
  const initialLanguage = useMemo(() => {
    const saved = localStorage.getItem('aa-lang')
    if (saved && i18n[saved]) return saved
    const browserLanguage = navigator.language || 'en'
    if (browserLanguage.startsWith('uz')) return 'uz'
    if (browserLanguage.startsWith('ru')) return 'ru'
    return 'en'
  }, [])
  const [lang, setLang] = useState(initialLanguage)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aa-theme')
    return saved === 'dark' || saved === 'light' ? saved : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  })
  const [open, setOpen] = useState(false)
  const [aboutLampMode, setAboutLampMode] = useState('off')
  const [aboutZoom, setAboutZoom] = useState(100)
  const t = i18n[lang]

  const cycleAboutLight = () => setAboutLampMode(mode => {
    if (mode === 'off') return 'on'
    if (mode === 'on') return 'light'
    if (mode === 'light') return 'fading'
    return mode
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('aa-theme', theme)
  }, [theme])
  useEffect(() => {
    if (aboutLampMode !== 'fading') return undefined
    const timer = window.setTimeout(() => setAboutLampMode('off'), 950)
    return () => window.clearTimeout(timer)
  }, [aboutLampMode])
  useEffect(() => { localStorage.setItem('aa-lang', lang); document.documentElement.lang = lang }, [lang])

  const statusLabel = status => status === 'planned' ? t.planned : status === 'maintained' ? t.active : t.built
  const rolePrefix = lang === 'ru' ? 'Я' : lang === 'en' ? 'I am a' : 'Men'

  const mainProjectItems = [
    ...projects.filter(project => ['ilmpage', 'pcverse'].includes(project.slug)),
    { ...moreWork.find(project => project.title === 'PERSONAL PORTFOLIO'), description: workDescriptions['PERSONAL PORTFOLIO'], technologies: ['React', 'Three.js', 'UI/UX'] },
  ].map(project => ({ ...project, icon: projectIcon[project.slug] || '/original-icons/core-tech/react.svg' }))

  const telegramProjectItems = [
    ...projects.filter(project => !['ilmpage', 'pcverse'].includes(project.slug)),
    ...moreWork.filter(project => project.title !== 'PERSONAL PORTFOLIO').map(project => ({
      ...project,
      description: workDescriptions[project.title],
      technologies: ['Telegram', 'Automation'],
    })),
  ].map(project => ({ ...project, icon: projectIcon[project.slug] || `/original-icons/projects/${moreWorkIcon[project.title]}` }))

  const plannedProjectItems = planned.map(project => ({
    ...project,
    icon: project.title === 'WGRAM' ? '/original-icons/projects/wgram.svg' : '/original-icons/projects/online-bookstore.svg',
    description: project.title === 'WGRAM'
      ? 'Future communication platform focused on convenient messaging, file and data sharing workflows.'
      : 'A future website planned for an online bookstore.',
    technologies: [],
  }))

  const allProjectItems = [
    ...mainProjectItems.map(project => ({ ...project, projectType: 'website' })),
    ...telegramProjectItems.map(project => ({ ...project, projectType: 'telegram' })),
    ...plannedProjectItems.map(project => ({ ...project, projectType: 'planned' })),
  ]

  return <main>
    <header className="nav">
      <a className="aa" href="#home" aria-label="Abdulmalik — bosh sahifa">AA</a>
      <nav className={open ? 'open' : ''} aria-label="Asosiy navigatsiya">
        {t.nav.map((label, index) => <a href={['#home', '#about', '#projects', '#skills', '#contact'][index]} key={label} onClick={() => setOpen(false)}>{label}</a>)}
      </nav>
      <div className="controls">
        {['uz', 'ru', 'en'].map(code => <button className={lang === code ? 'on' : ''} onClick={() => setLang(code)} key={code}>{code}</button>)}
        <button className="theme-toggle" onClick={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}</button>
      </div>
      <button className="menu" onClick={() => setOpen(value => !value)} aria-label="Menyuni ochish">{open ? <X /> : <Menu />}</button>
    </header>

    <section id="home" className="new-hero">
      <PlexusBackground />
      <div className="hero-copy">
        <span className="glass-badge"><i />{t.badge}</span>
        <h1>{t.hello} <strong>Abdulmalik<br />Abdumalikov</strong></h1>
        <TypedRole prefix={rolePrefix} roles={t.roles} />
        <p className="description">{t.description}</p>
        <div className="hero-actions">
          <a className="primary" href="#projects">{t.work}<ArrowRight size={16} /></a>
          <a className="secondary" href="#contact">{t.contact}</a>
        </div>
        <p className="hero-meta">UZBEKISTAN · PORTFOLIO / 2026</p>
      </div>
    </section>

    <section id="about" className="about about-expanded">
      <AboutCarousel />
      <div className={`about-copy lamp-${aboutLampMode}`} data-tilt>
        <Suspense fallback={null}><InteractiveLamp mode={aboutLampMode} /></Suspense>
        <div className="about-copy-scroll">
          <div className="about-copy-content">
            <p className="eyebrow">01 / ABOUT ME</p>
            <h2>Developer &amp;<br />Tech Builder</h2>
            <div className="about-copy-body" style={{ zoom: aboutZoom / 100 }}>
              {aboutContent[lang].map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </div>
        <div className="about-reading-controls">
          <span aria-hidden="true" />
          <label className="about-zoom-control">
            <input type="range" min="80" max="300" step="5" value={aboutZoom} onChange={event => setAboutZoom(Number(event.target.value))} aria-label="About matni o‘lchami" />
            <output>{aboutZoom}%</output>
          </label>
          <button
            className={`lamp-cycle-toggle mode-${aboutLampMode}`}
            onClick={cycleAboutLight}
            aria-label={`O‘qish yoritgichi: ${aboutLampMode}. Keyingi holatga o‘tkazish`}
            title={`Light mode: ${aboutLampMode.toUpperCase()}`}
          ><Lightbulb size={19} aria-hidden="true" /></button>
        </div>
      </div>
    </section>
    <Suspense fallback={<section className="skills-loading">3D SKILLS LOADING…</section>}><SkillPlayground title={t.skills} eyebrow={t.skills} /></Suspense>
    <section id="projects" className="projects">
      <div className="projects-shell">
        <div className="projects-intro"><p className="eyebrow">03 / PROJECTS</p><h2>{t.featured}</h2></div>
        <ProjectCarousel items={allProjectItems} statusLabel={statusLabel} />
      </div>
    </section>
    <ContactSection lang={lang} title={t.contactTitle} sendLabel={t.send} />
  </main>
}
