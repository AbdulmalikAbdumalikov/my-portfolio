import { moreWork, planned, projects } from './site'
import { skillDetails, skills } from './skills'

const projectIcons = {
  ilmpage: '/original-icons/projects/ilmpage.svg',
  pcverse: '/original-icons/projects/pcverse-uz.svg',
  deorator: '/original-icons/projects/deorator-bot.svg',
  'tts-uz': '/original-icons/projects/tts-uz-bot.svg',
  'vodiy-taxi': '/original-icons/projects/vodiy-taxi-bot.svg',
  'CONVERTIO BOT': '/original-icons/projects/convertio-bot.svg',
  'INTIZOMLI BOT': '/original-icons/projects/intizomli-bot.svg',
  'YUKSALISH SCHOOL TEST BOT': '/original-icons/projects/yuksalish-test-bot.svg',
  'ULTIMA TAXI BOT': '/original-icons/projects/ultima-taxi-bot.svg',
  'MUSIC ISLAND BOT': '/original-icons/projects/music-island-bot.svg',
  'ANONYMOUS BOT': '/original-icons/projects/anonymous-bot.svg',
  'SOCIAL GROWTH WORKFLOW BOT': '/original-icons/projects/social-growth-bot.svg',
  'PERSONAL PORTFOLIO': '/original-icons/core-tech/react.svg',
  WGRAM: '/original-icons/projects/wgram.svg',
  'ONLINE BOOKSTORE': '/original-icons/projects/online-bookstore.svg',
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

const initialProjects = [
  ...projects.map(project => ({ ...project, type: ['ilmpage', 'pcverse'].includes(project.slug) ? 'website' : 'telegram', icon: projectIcons[project.slug] })),
  ...moreWork.map(project => ({ ...project, type: project.title === 'PERSONAL PORTFOLIO' ? 'website' : 'telegram', year: '2026', description: workDescriptions[project.title], technologies: project.title === 'PERSONAL PORTFOLIO' ? ['React', 'Three.js', 'UI/UX'] : ['Telegram', 'Automation'], icon: projectIcons[project.title] })),
  ...planned.map(project => ({ ...project, type: 'planned', year: '2026', description: project.title === 'WGRAM' ? 'Future communication platform focused on convenient messaging, file and data sharing workflows.' : 'A future website planned for an online bookstore.', technologies: [], icon: projectIcons[project.title] })),
]

export const defaultContent = {
  photos: [
    { src: '/about/bdcbf095-c6cd-466c-b494-17d820b9e40d.png', position: 'center' },
    { src: '/about/MYrasm%20(1).jpg', position: 'center' },
    { src: '/about/MYrasm%20(1).png', position: 'center' },
    { src: '/about/MYrasm%20(2).jpg', position: 'center' },
    { src: '/about/MYrasm%20(4).jpg', position: 'center' },
  ],
  about: {
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
  },
  skills: skills.map(skill => ({ ...skill, category: skillDetails[skill.name]?.[0] || 'Skill', description: skillDetails[skill.name]?.[1] || '' })),
  projects: initialProjects,
  links: [
    { id: 'instagram', label: 'Instagram', icon: '/social-icons/instagram.svg', url: 'https://www.instagram.com/abdulmalik_developer/', note: 'Shaxsiy account' },
    { id: 'telegram', label: 'Telegram', icon: '/social-icons/telegram.svg', url: 'https://t.me/bot_for_contact_bot?start=telegram', note: '@bot_for_contact_bot' },
    { id: 'github', label: 'GitHub', icon: '/social-icons/github.svg', url: 'https://github.com/AbdulmalikAbdumalikov', note: 'github.com/AbdulmalikAbdumalikov' },
    { id: 'gmail', label: 'Gmail', icon: '/social-icons/gmail.svg', url: 'https://t.me/bot_for_contact_bot?start=email', note: 'Email uchun bot orqali bog‘laning' },
    { id: 'linkedin', label: 'LinkedIn', icon: '/social-icons/linkedin.svg', url: 'https://www.linkedin.com/in/abdulmalikabdumalikov', note: 'LinkedIn profil' },
    { id: 'discord', label: 'Discord', icon: '/social-icons/discord.svg', url: 'https://discord.com', note: 'selerown' },
  ],
}
