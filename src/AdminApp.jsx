import { useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, FolderKanban, Image, LayoutDashboard, Link2, LockKeyhole, LogOut, Plus, Save, Settings, Sparkles, Trash2, UserRound, Wrench } from 'lucide-react'
import { defaultContent } from './data/content'
import './admin.css'

const tabs = [
  ['dashboard', 'Boshqaruv', LayoutDashboard], ['photos', 'Rasmlar', Image], ['about', 'Men haqimda', UserRound], ['skills', 'Qobiliyatlar', Sparkles],
  ['projects', 'Loyihalar', FolderKanban], ['links', 'Linklar', Link2], ['settings', 'Sozlamalar', Settings],
]
const clone = value => JSON.parse(JSON.stringify(value))

async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'So‘rov bajarilmadi.')
  return data
}

function Field({ label, value, onChange, type = 'text', placeholder = '', textarea = false }) {
  const Tag = textarea ? 'textarea' : 'input'
  return <label className="admin-field"><span>{label}</span><Tag type={textarea ? undefined : type} value={value ?? ''} onChange={event => onChange(event.target.value)} placeholder={placeholder} /></label>
}

function ItemActions({ index, length, onMove, onDelete }) {
  return <div className="admin-item-actions">
    <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label="Yuqoriga"><ArrowUp /></button>
    <button type="button" onClick={() => onMove(index, 1)} disabled={index === length - 1} aria-label="Pastga"><ArrowDown /></button>
    <button type="button" className="danger" onClick={onDelete} aria-label="O‘chirish"><Trash2 /></button>
  </div>
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('Abdulmalik_Abdumalikov')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const submit = async event => {
    event.preventDefault(); setPending(true); setError('')
    try { const data = await api('/api/admin-auth', { method: 'POST', body: JSON.stringify({ action: 'login', username, password }) }); onLogin(data.username) }
    catch (reason) { setError(reason.message) } finally { setPending(false) }
  }
  return <main className="admin-login-page"><section className="admin-login-card">
    <div className="admin-login-mark"><LockKeyhole /></div><p className="admin-kicker">ABDULMALIK / CONTROL CENTER</p><h1>Admin panel</h1><p className="admin-muted">Portfolio kontentini xavfsiz boshqaring.</p>
    <form onSubmit={submit}><Field label="LOGIN" value={username} onChange={setUsername} autoComplete="username" /><Field label="PAROL" type="password" value={password} onChange={setPassword} />{error && <p className="admin-error">{error}</p>}<button className="admin-primary" disabled={pending}>{pending ? 'Tekshirilmoqda…' : 'Kirish'}</button></form>
    <a href="https://abdulmalik.uz"><ArrowLeft /> Portfolio’ga qaytish</a>
  </section></main>
}

function PhotosEditor({ content, setContent, upload, busy }) {
  const items = content.photos
  const move = (index, direction) => setContent(current => { const next = clone(current); const [item] = next.photos.splice(index, 1); next.photos.splice(index + direction, 0, item); return next })
  return <section><header className="admin-section-head"><div><p>MEDIA LIBRARY</p><h2>Rasmlar</h2></div><label className="admin-add"><Plus /> {busy ? 'Yuklanmoqda…' : 'Rasm yuklash'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={upload} /></label></header>
    <div className="admin-photo-grid">{items.map((photo, index) => <article className="admin-photo-card" key={`${photo.src}-${index}`}><img src={photo.src} alt="" /><Field label="RASM JOYLASHUVI" value={photo.position} onChange={value => setContent(current => { const next = clone(current); next.photos[index].position = value; return next })} placeholder="center / top / 50% 20%" /><ItemActions index={index} length={items.length} onMove={move} onDelete={() => setContent(current => ({ ...current, photos: current.photos.filter((_, itemIndex) => itemIndex !== index) }))} /></article>)}</div>
    {!items.length && <Empty text="Hali rasm yo‘q." />}
  </section>
}

function AboutEditor({ content, setContent }) {
  const [language, setLanguage] = useState('uz')
  const items = content.about[language] || []
  const move = (index, direction) => setContent(current => { const next = clone(current); const [item] = next.about[language].splice(index, 1); next.about[language].splice(index + direction, 0, item); return next })
  return <section><header className="admin-section-head"><div><p>PROFILE COPY</p><h2>Men haqimda</h2></div><button className="admin-add" onClick={() => setContent(current => { const next = clone(current); next.about[language].push('Yangi paragraf'); return next })}><Plus /> Paragraf</button></header>
    <div className="admin-language-tabs">{['uz', 'en', 'ru'].map(item => <button className={language === item ? 'active' : ''} onClick={() => setLanguage(item)} key={item}>{item.toUpperCase()}</button>)}</div>
    <div className="admin-stack">{items.map((paragraph, index) => <article className="admin-edit-card" key={index}><Field label={`PARAGRAF ${index + 1}`} value={paragraph} textarea onChange={value => setContent(current => { const next = clone(current); next.about[language][index] = value; return next })} /><ItemActions index={index} length={items.length} onMove={move} onDelete={() => setContent(current => { const next = clone(current); next.about[language].splice(index, 1); return next })} /></article>)}</div>
  </section>
}

function SkillsEditor({ content, setContent }) {
  const items = content.skills
  const add = () => setContent(current => ({ ...current, skills: [...current.skills, { name: 'Yangi qobiliyat', icon: '', badge: 'NEW', category: 'Skill', description: '' }] }))
  const update = (index, key, value) => setContent(current => { const next = clone(current); next.skills[index][key] = value; return next })
  const move = (index, direction) => setContent(current => { const next = clone(current); const [item] = next.skills.splice(index, 1); next.skills.splice(index + direction, 0, item); return next })
  return <section><header className="admin-section-head"><div><p>KNOWLEDGE BASE</p><h2>Qobiliyatlar</h2></div><button className="admin-add" onClick={add}><Plus /> Yangi qobiliyat</button></header><div className="admin-card-grid">{items.map((item, index) => <article className="admin-edit-card" key={`${item.name}-${index}`}><div className="admin-item-title">{item.icon ? <img src={item.icon} alt="" /> : <b>{item.badge || '—'}</b>}<strong>{item.name}</strong></div><div className="admin-form-grid"><Field label="NOMI" value={item.name} onChange={value => update(index, 'name', value)} /><Field label="KATEGORIYA" value={item.category} onChange={value => update(index, 'category', value)} /><Field label="ICON URL" value={item.icon} onChange={value => update(index, 'icon', value)} /><Field label="BADGE" value={item.badge} onChange={value => update(index, 'badge', value)} /><Field label="TAVSIF" value={item.description} textarea onChange={value => update(index, 'description', value)} /></div><ItemActions index={index} length={items.length} onMove={move} onDelete={() => setContent(current => ({ ...current, skills: current.skills.filter((_, itemIndex) => itemIndex !== index) }))} /></article>)}</div></section>
}

function ProjectsEditor({ content, setContent }) {
  const items = content.projects
  const add = () => setContent(current => ({ ...current, projects: [...current.projects, { title: 'Yangi loyiha', slug: '', category: 'WEB', status: 'planned', year: String(new Date().getFullYear()), description: '', technologies: [], icon: '', type: 'website', link: '' }] }))
  const update = (index, key, value) => setContent(current => { const next = clone(current); next.projects[index][key] = value; return next })
  const move = (index, direction) => setContent(current => { const next = clone(current); const [item] = next.projects.splice(index, 1); next.projects.splice(index + direction, 0, item); return next })
  return <section><header className="admin-section-head"><div><p>PORTFOLIO DIRECTORY</p><h2>Loyihalar</h2></div><button className="admin-add" onClick={add}><Plus /> Yangi loyiha</button></header><div className="admin-stack">{items.map((item, index) => <article className="admin-edit-card admin-project-card" key={`${item.title}-${index}`}><div className="admin-item-title">{item.icon && <img src={item.icon} alt="" />}<div><small>{item.type} / {item.status}</small><strong>{item.title}</strong></div></div><div className="admin-form-grid"><Field label="NOMI" value={item.title} onChange={value => update(index, 'title', value)} /><Field label="KATEGORIYA" value={item.category} onChange={value => update(index, 'category', value)} /><label className="admin-field"><span>TURI</span><select value={item.type} onChange={event => update(index, 'type', event.target.value)}><option value="website">Website</option><option value="telegram">Telegram bot</option><option value="planned">Rejalashtirilgan</option></select></label><label className="admin-field"><span>HOLATI</span><select value={item.status} onChange={event => update(index, 'status', event.target.value)}><option value="completed">Completed</option><option value="maintained">Active</option><option value="planned">Planned</option></select></label><Field label="YIL" value={item.year} onChange={value => update(index, 'year', value)} /><Field label="ICON URL" value={item.icon} onChange={value => update(index, 'icon', value)} /><Field label="LOYIHA LINKI" value={item.link} onChange={value => update(index, 'link', value)} /><Field label="TEXNOLOGIYALAR (vergul bilan)" value={(item.technologies || []).join(', ')} onChange={value => update(index, 'technologies', value.split(',').map(part => part.trim()).filter(Boolean))} /><Field label="TAVSIF" value={item.description} textarea onChange={value => update(index, 'description', value)} /></div><ItemActions index={index} length={items.length} onMove={move} onDelete={() => setContent(current => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) }))} /></article>)}</div></section>
}

function LinksEditor({ content, setContent }) {
  const items = content.links
  const add = () => setContent(current => ({ ...current, links: [...current.links, { id: `link-${Date.now()}`, label: 'Yangi link', icon: '/social-icons/telegram.svg', url: 'https://', note: '' }] }))
  const update = (index, key, value) => setContent(current => { const next = clone(current); next.links[index][key] = value; return next })
  const move = (index, direction) => setContent(current => { const next = clone(current); const [item] = next.links.splice(index, 1); next.links.splice(index + direction, 0, item); return next })
  return <section><header className="admin-section-head"><div><p>CONTACT CHANNELS</p><h2>Portfolio linklari</h2></div><button className="admin-add" onClick={add}><Plus /> Yangi link</button></header><div className="admin-card-grid">{items.map((item, index) => <article className="admin-edit-card" key={`${item.id}-${index}`}><div className="admin-item-title">{item.icon && <img src={item.icon} alt="" />}<strong>{item.label}</strong></div><div className="admin-form-grid"><Field label="NOMI" value={item.label} onChange={value => update(index, 'label', value)} /><Field label="LINK" value={item.url} onChange={value => update(index, 'url', value)} /><Field label="ICON URL" value={item.icon} onChange={value => update(index, 'icon', value)} /><Field label="IZOH" value={item.note} onChange={value => update(index, 'note', value)} /></div><ItemActions index={index} length={items.length} onMove={move} onDelete={() => setContent(current => ({ ...current, links: current.links.filter((_, itemIndex) => itemIndex !== index) }))} /></article>)}</div></section>
}

function SettingsEditor({ username, setUsername }) {
  const [form, setForm] = useState({ username, currentPassword: '', password: '' })
  const [status, setStatus] = useState('')
  const submit = async event => { event.preventDefault(); setStatus(''); try { const data = await api('/api/admin-auth', { method: 'POST', body: JSON.stringify({ action: 'change-credentials', ...form }) }); setUsername(data.username); setForm(current => ({ ...current, currentPassword: '', password: '' })); setStatus('Login va parol yangilandi.') } catch (error) { setStatus(error.message) } }
  return <section><header className="admin-section-head"><div><p>SECURITY</p><h2>Login va parol</h2></div></header><form className="admin-settings-card" onSubmit={submit}><Field label="YANGI LOGIN" value={form.username} onChange={value => setForm(current => ({ ...current, username: value }))} /><Field label="JORIY PAROL" type="password" value={form.currentPassword} onChange={value => setForm(current => ({ ...current, currentPassword: value }))} /><Field label="YANGI PAROL" type="password" value={form.password} onChange={value => setForm(current => ({ ...current, password: value }))} /><p className="admin-muted">Parol kamida 8 belgidan iborat bo‘lishi kerak.</p>{status && <p className={status.includes('yangilandi') ? 'admin-success' : 'admin-error'}>{status}</p>}<button className="admin-primary">Login va parolni almashtirish</button></form></section>
}

function Empty({ text }) { return <div className="admin-empty"><Wrench /><p>{text}</p></div> }

function Dashboard({ content, openTab }) {
  const cards = [
    ['photos', 'Rasmlar', content.photos.length, Image, 'Portfolio galereyasi'],
    ['about', 'Men haqimda', Object.values(content.about).reduce((total, list) => total + list.length, 0), UserRound, '3 tildagi matnlar'],
    ['skills', 'Qobiliyatlar', content.skills.length, Sparkles, 'Texnologiya va vositalar'],
    ['projects', 'Loyihalar', content.projects.length, FolderKanban, 'Faol va rejalashtirilgan'],
    ['links', 'Linklar', content.links.length, Link2, 'Ijtimoiy va tashqi linklar'],
  ]
  return <section className="admin-dashboard"><div className="admin-welcome"><div><p className="admin-kicker">PORTFOLIO CONTROL CENTER</p><h2>Kontentingizni bir joydan boshqaring.</h2><p>Kerakli bo‘limni tanlang, o‘zgarish kiriting va yuqoridagi <b>Saqlash</b> tugmasini bosing.</p></div>{content.photos[0]?.src && <img src={content.photos[0].src} alt="Portfolio preview" />}</div><div className="admin-overview-grid">{cards.map(([id, label, count, Icon, note]) => <button type="button" onClick={() => openTab(id)} key={id}><span><Icon /></span><div><strong>{count}</strong><b>{label}</b><small>{note}</small></div><ArrowLeft className="admin-card-arrow" /></button>)}</div><div className="admin-dashboard-note"><span><i /></span><div><b>Portfolio bilan sinxron</b><p>Saqlangan o‘zgarishlar avtomatik ravishda asosiy saytda ko‘rinadi.</p></div><a href="https://abdulmalik.uz" target="_blank" rel="noreferrer">Saytni ko‘rish <ExternalLink /></a></div></section>
}

export default function AdminApp() {
  const [auth, setAuth] = useState({ checking: true, username: '' })
  const [content, setContent] = useState(clone(defaultContent))
  const [tab, setTab] = useState('dashboard')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  useEffect(() => { api('/api/admin-auth').then(data => setAuth({ checking: false, username: data.username })).catch(() => setAuth({ checking: false, username: '' })) }, [])
  useEffect(() => { if (!auth.username) return; api('/api/content').then(data => data.content && setContent(data.content)).catch(error => setStatus(error.message)) }, [auth.username])
  if (auth.checking) return <main className="admin-loading"><span /> Admin panel yuklanmoqda…</main>
  if (!auth.username) return <Login onLogin={username => setAuth({ checking: false, username })} />

  const save = async () => { setSaving(true); setStatus(''); try { const data = await api('/api/content', { method: 'PUT', body: JSON.stringify({ content }) }); setContent(data.content); setStatus('Barcha o‘zgarishlar saqlandi.') } catch (error) { setStatus(error.message) } finally { setSaving(false) } }
  const logout = async () => { await api('/api/admin-auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }); setAuth({ checking: false, username: '' }) }
  const upload = async event => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return
    setUploading(true); setStatus('')
    try {
      const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file) })
      const uploaded = await api('/api/admin-media', { method: 'POST', body: JSON.stringify({ mimeType: file.type, data: dataUrl }) })
      setContent(current => ({ ...current, photos: [...current.photos, { src: uploaded.url, position: 'center' }] })); setStatus('Rasm yuklandi. Endi “Saqlash”ni bosing.')
    } catch (error) { setStatus(error.message) } finally { setUploading(false) }
  }
  const active = tabs.find(([id]) => id === tab)
  return <div className="admin-shell"><aside className="admin-sidebar"><a className="admin-brand" href="https://abdulmalik.uz"><img src="/brand/aa-mark.png" alt="AA" /><span>CONTROL<br />CENTER</span></a><nav>{tabs.map(([id, label, Icon]) => <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}><Icon />{label}</button>)}</nav><div className="admin-sidebar-bottom"><a href="https://abdulmalik.uz" target="_blank" rel="noreferrer"><ExternalLink /> Saytni ochish</a><button onClick={logout}><LogOut /> Chiqish</button></div></aside>
    <main className="admin-main"><header className="admin-topbar"><div><p>ADMIN / {active?.[0].toUpperCase()}</p><h1>{active?.[1]}</h1></div><div><span className="admin-user"><i />{auth.username}</span><button className="admin-save" onClick={save} disabled={saving}><Save />{saving ? 'Saqlanmoqda…' : 'Saqlash'}</button></div></header>{status && <div className={status.includes('saqlandi') || status.includes('yuklandi') ? 'admin-toast success' : 'admin-toast'}>{status}</div>}<div className="admin-workspace">
      {tab === 'dashboard' && <Dashboard content={content} openTab={setTab} />}
      {tab === 'photos' && <PhotosEditor content={content} setContent={setContent} upload={upload} busy={uploading} />}
      {tab === 'about' && <AboutEditor content={content} setContent={setContent} />}
      {tab === 'skills' && <SkillsEditor content={content} setContent={setContent} />}
      {tab === 'projects' && <ProjectsEditor content={content} setContent={setContent} />}
      {tab === 'links' && <LinksEditor content={content} setContent={setContent} />}
      {tab === 'settings' && <SettingsEditor username={auth.username} setUsername={username => setAuth(current => ({ ...current, username }))} />}
    </div></main></div>
}
