import { useEffect, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUp, ChevronDown, ExternalLink, FolderKanban, Image, LayoutDashboard, Link2, LockKeyhole, LogOut, MonitorUp, Plus, Save, Settings, Sparkles, Trash2, Upload, UserRound, Wrench, X } from 'lucide-react'
import { defaultContent } from './data/content'
import './admin.css'

const languages = ['uz', 'en', 'ru']
const tabs = [
  ['dashboard', 'Boshqaruv', LayoutDashboard], ['hero', 'Asosiy sahifa', MonitorUp], ['photos', 'Rasmlar', Image], ['about', 'Men haqimda', UserRound],
  ['skills', 'Qobiliyatlar', Sparkles], ['projects', 'Loyihalar', FolderKanban], ['links', 'Linklar', Link2], ['settings', 'Sozlamalar', Settings],
]
const clone = value => JSON.parse(JSON.stringify(value))
const listOr = (value, fallback) => Array.isArray(value) ? value : clone(fallback)
const normalizeContent = value => ({
  ...clone(defaultContent), ...value,
  hero: Object.fromEntries(languages.map(lang => [lang, { ...defaultContent.hero[lang], ...(value?.hero?.[lang] || {}), roles: listOr(value?.hero?.[lang]?.roles, defaultContent.hero[lang].roles) }])),
  photos: listOr(value?.photos, defaultContent.photos),
  about: Object.fromEntries(languages.map(lang => [lang, listOr(value?.about?.[lang], defaultContent.about[lang])])),
  skills: listOr(value?.skills, defaultContent.skills),
  projects: listOr(value?.projects, defaultContent.projects).map(project => ({ banner: '', link: '', ...project })),
  links: listOr(value?.links, defaultContent.links),
})

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

function LanguageTabs({ value, onChange }) {
  return <div className="admin-language-tabs">{languages.map(item => <button type="button" className={value === item ? 'active' : ''} onClick={() => onChange(item)} key={item}>{item.toUpperCase()}</button>)}</div>
}

function ImagePicker({ label, value, onChange, uploadFile, wide = false }) {
  const [busy, setBusy] = useState(false)
  const choose = async event => {
    const file = event.target.files?.[0]; event.target.value = ''; if (!file) return
    setBusy(true)
    try { onChange(await uploadFile(file)) } catch {} finally { setBusy(false) }
  }
  return <div className={`admin-image-picker${wide ? ' is-wide' : ''}`}>
    <span>{label}</span>
    <div className="admin-image-preview">{value ? <img src={value} alt={`${label} preview`} /> : <div><Image /><small>Rasm yo‘q</small></div>}</div>
    <div className="admin-image-actions"><label><Upload />{busy ? 'Yuklanmoqda…' : value ? 'Almashtirish' : 'Rasm qo‘shish'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={choose} /></label>{value && <button type="button" className="danger" onClick={() => onChange('')}><Trash2 /> Olib tashlash</button>}</div>
  </div>
}

function MoveActions({ index, length, onMove, onDelete }) {
  return <div className="admin-compact-actions" onClick={event => event.stopPropagation()}>
    <label><span>№</span><select value={index} onChange={event => onMove(index, Number(event.target.value))}>{Array.from({ length }, (_, item) => <option value={item} key={item}>{item + 1}</option>)}</select></label>
    <button type="button" onClick={() => onMove(index, index - 1)} disabled={index === 0} aria-label="Yuqoriga"><ArrowUp /></button>
    <button type="button" onClick={() => onMove(index, index + 1)} disabled={index === length - 1} aria-label="Pastga"><ArrowDown /></button>
    <button type="button" className="danger" onClick={onDelete} aria-label="O‘chirish"><Trash2 /></button>
  </div>
}

function moveItem(setContent, key, from, to) {
  if (to < 0) return
  setContent(current => { const next = clone(current); if (to >= next[key].length) return current; const [item] = next[key].splice(from, 1); next[key].splice(to, 0, item); return next })
}

function TagEditor({ tags = [], onChange }) {
  const update = (index, value) => onChange(tags.map((tag, item) => item === index ? value : tag))
  return <div className="admin-tag-editor"><span>TEG / TEXNOLOGIYALAR</span><div>{tags.map((tag, index) => <label key={index}><input value={tag} onChange={event => update(index, event.target.value)} /><button type="button" onClick={() => onChange(tags.filter((_, item) => item !== index))} aria-label="Tagni o‘chirish"><X /></button></label>)}<button type="button" className="admin-tag-add" onClick={() => onChange([...tags, 'Yangi tag'])}><Plus /> Tag qo‘shish</button></div></div>
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('Abdulmalik_Abdumalikov'); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [pending, setPending] = useState(false)
  const submit = async event => { event.preventDefault(); setPending(true); setError(''); try { const data = await api('/api/admin-auth', { method: 'POST', body: JSON.stringify({ action: 'login', username, password }) }); onLogin(data.username) } catch (reason) { setError(reason.message) } finally { setPending(false) } }
  return <main className="admin-login-page"><section className="admin-login-card"><div className="admin-login-mark"><LockKeyhole /></div><p className="admin-kicker">ABDULMALIK / CONTROL CENTER</p><h1>Admin panel</h1><p className="admin-muted">Portfolio kontentini xavfsiz boshqaring.</p><form onSubmit={submit}><Field label="LOGIN" value={username} onChange={setUsername} /><Field label="PAROL" type="password" value={password} onChange={setPassword} />{error && <p className="admin-error">{error}</p>}<button className="admin-primary" disabled={pending}>{pending ? 'Tekshirilmoqda…' : 'Kirish'}</button></form><a href="https://abdulmalik.uz"><ArrowLeft /> Portfolio’ga qaytish</a></section></main>
}

function HeroEditor({ content, setContent }) {
  const [language, setLanguage] = useState('uz'); const item = content.hero[language]
  const update = (key, value) => setContent(current => { const next = clone(current); next.hero[language][key] = value; return next })
  return <section><header className="admin-section-head"><div><p>HERO / MAIN</p><h2>Asosiy sahifa matnlari</h2></div></header><LanguageTabs value={language} onChange={setLanguage} /><div className="admin-edit-card admin-hero-editor"><div className="admin-form-grid"><Field label="KICHIK BADGE" value={item.badge} onChange={value => update('badge', value)} /><Field label="SALOMLASHUV" value={item.hello} onChange={value => update('hello', value)} /><Field label="ISM" value={item.firstName} onChange={value => update('firstName', value)} /><Field label="FAMILIYA" value={item.lastName} onChange={value => update('lastName', value)} /><Field label="ROL OLDIDAGI MATN" value={item.rolePrefix} onChange={value => update('rolePrefix', value)} /><Field label="PASTDAGI META MATN" value={item.meta} onChange={value => update('meta', value)} /><Field label="ASOSIY TAVSIF" value={item.description} textarea onChange={value => update('description', value)} /><Field label="LOYIHALAR TUGMASI" value={item.work} onChange={value => update('work', value)} /><Field label="ALOQA TUGMASI" value={item.contact} onChange={value => update('contact', value)} /></div><TagEditor tags={item.roles} onChange={value => update('roles', value)} /></div></section>
}

function PhotosEditor({ content, setContent, uploadFile }) {
  const add = async event => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { const src = await uploadFile(file); setContent(current => ({ ...current, photos: [...current.photos, { src, position: 'center' }] })) } catch {} }
  return <section><header className="admin-section-head"><div><p>MEDIA LIBRARY</p><h2>Rasmlar</h2></div><label className="admin-add"><Plus /> Rasm qo‘shish<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={add} /></label></header><div className="admin-photo-grid">{content.photos.map((photo, index) => <article className="admin-photo-card" key={`${photo.src}-${index}`}><ImagePicker label={`RASM ${index + 1}`} value={photo.src} uploadFile={uploadFile} wide onChange={src => setContent(current => { const next = clone(current); next.photos[index].src = src; return next })} /><Field label="RASM JOYLASHUVI" value={photo.position} onChange={value => setContent(current => { const next = clone(current); next.photos[index].position = value; return next })} placeholder="center / top / 50% 20%" /><MoveActions index={index} length={content.photos.length} onMove={(from, to) => moveItem(setContent, 'photos', from, to)} onDelete={() => setContent(current => ({ ...current, photos: current.photos.filter((_, item) => item !== index) }))} /></article>)}</div>{!content.photos.length && <Empty text="Hali rasm yo‘q." />}</section>
}

function AboutEditor({ content, setContent }) {
  const [language, setLanguage] = useState('uz'); const items = content.about[language] || []
  return <section><header className="admin-section-head"><div><p>PROFILE COPY</p><h2>Men haqimda</h2></div><button className="admin-add" onClick={() => setContent(current => { const next = clone(current); next.about[language].push('Yangi paragraf'); return next })}><Plus /> Paragraf</button></header><LanguageTabs value={language} onChange={setLanguage} /><div className="admin-stack">{items.map((paragraph, index) => <article className="admin-edit-card" key={index}><Field label={`PARAGRAF ${index + 1}`} value={paragraph} textarea onChange={value => setContent(current => { const next = clone(current); next.about[language][index] = value; return next })} /><MoveActions index={index} length={items.length} onMove={(from, to) => setContent(current => { const next = clone(current); const [item] = next.about[language].splice(from, 1); next.about[language].splice(to, 0, item); return next })} onDelete={() => setContent(current => { const next = clone(current); next.about[language].splice(index, 1); return next })} /></article>)}</div></section>
}

function SkillsEditor({ content, setContent, uploadFile }) {
  const add = () => setContent(current => ({ ...current, skills: [...current.skills, { name: 'Yangi qobiliyat', icon: '', badge: 'NEW', category: 'Skill', description: '' }] }))
  const update = (index, key, value) => setContent(current => { const next = clone(current); next.skills[index][key] = value; return next })
  return <section><header className="admin-section-head"><div><p>KNOWLEDGE BASE</p><h2>Qobiliyatlar</h2><small className="admin-section-note">Kartani ochib tahrirlang. Yopiq holatda tartiblash mumkin.</small></div><button className="admin-add" onClick={add}><Plus /> Yangi qobiliyat</button></header><div className="admin-collapsible-list">{content.skills.map((item, index) => <details className="admin-collapsible-card" key={`${item.name}-${index}`}><summary><span className="admin-summary-image">{item.icon ? <img src={item.icon} alt="" /> : <b>{item.badge || '—'}</b>}</span><div><small>{item.category || 'Skill'}</small><strong>{item.name}</strong></div><MoveActions index={index} length={content.skills.length} onMove={(from, to) => moveItem(setContent, 'skills', from, to)} onDelete={() => setContent(current => ({ ...current, skills: current.skills.filter((_, itemIndex) => itemIndex !== index) }))} /><ChevronDown className="admin-summary-chevron" /></summary><div className="admin-collapsible-body"><ImagePicker label="QOBILIYAT ICONI" value={item.icon} uploadFile={uploadFile} onChange={value => update(index, 'icon', value)} /><div className="admin-form-grid"><Field label="NOMI" value={item.name} onChange={value => update(index, 'name', value)} /><Field label="KATEGORIYA" value={item.category} onChange={value => update(index, 'category', value)} /><Field label="BADGE (icon bo‘lmasa)" value={item.badge} onChange={value => update(index, 'badge', value)} /><Field label="TAVSIF" value={item.description} textarea onChange={value => update(index, 'description', value)} /></div></div></details>)}</div></section>
}

function ProjectsEditor({ content, setContent, uploadFile }) {
  const add = () => setContent(current => ({ ...current, projects: [...current.projects, { title: 'Yangi loyiha', slug: '', category: 'WEB', status: 'planned', year: String(new Date().getFullYear()), description: '', technologies: [], icon: '', banner: '', type: 'website', link: '' }] }))
  const update = (index, key, value) => setContent(current => { const next = clone(current); next.projects[index][key] = value; return next })
  return <section><header className="admin-section-head"><div><p>PORTFOLIO DIRECTORY</p><h2>Loyihalar</h2></div><button className="admin-add" onClick={add}><Plus /> Yangi loyiha</button></header><div className="admin-collapsible-list">{content.projects.map((item, index) => <details className="admin-collapsible-card" key={`${item.title}-${index}`}><summary><span className="admin-summary-image is-project">{item.icon ? <img src={item.icon} alt="" /> : <FolderKanban />}</span><div><small>{item.type} / {item.status}</small><strong>{item.title}</strong></div><MoveActions index={index} length={content.projects.length} onMove={(from, to) => moveItem(setContent, 'projects', from, to)} onDelete={() => setContent(current => ({ ...current, projects: current.projects.filter((_, itemIndex) => itemIndex !== index) }))} /><ChevronDown className="admin-summary-chevron" /></summary><div className="admin-collapsible-body"><div className="admin-project-images"><ImagePicker label="LOYIHA ICONI" value={item.icon} uploadFile={uploadFile} onChange={value => update(index, 'icon', value)} /><ImagePicker label="LOYIHA BANNERI" value={item.banner} uploadFile={uploadFile} wide onChange={value => update(index, 'banner', value)} /></div><div className="admin-form-grid"><Field label="NOMI" value={item.title} onChange={value => update(index, 'title', value)} /><Field label="KATEGORIYA" value={item.category} onChange={value => update(index, 'category', value)} /><label className="admin-field"><span>TURI</span><select value={item.type} onChange={event => update(index, 'type', event.target.value)}><option value="website">Website</option><option value="telegram">Telegram bot</option><option value="planned">Rejalashtirilgan</option></select></label><label className="admin-field"><span>HOLATI</span><select value={item.status} onChange={event => update(index, 'status', event.target.value)}><option value="completed">Completed</option><option value="maintained">Active</option><option value="planned">Planned</option></select></label><Field label="YIL" value={item.year} onChange={value => update(index, 'year', value)} /><Field label="LOYIHA LINKI" value={item.link} placeholder="https://..." onChange={value => update(index, 'link', value)} /><Field label="TAVSIF" value={item.description} textarea onChange={value => update(index, 'description', value)} /></div><TagEditor tags={item.technologies || []} onChange={value => update(index, 'technologies', value)} /></div></details>)}</div></section>
}

function LinksEditor({ content, setContent, uploadFile }) {
  const add = () => setContent(current => ({ ...current, links: [...current.links, { id: `link-${Date.now()}`, label: 'Yangi link', icon: '', url: 'https://', note: '' }] }))
  const update = (index, key, value) => setContent(current => { const next = clone(current); next.links[index][key] = value; return next })
  return <section><header className="admin-section-head"><div><p>CONTACT CHANNELS</p><h2>Portfolio linklari</h2></div><button className="admin-add" onClick={add}><Plus /> Yangi link</button></header><div className="admin-card-grid">{content.links.map((item, index) => <article className="admin-edit-card" key={`${item.id}-${index}`}><ImagePicker label={`${item.label || 'LINK'} ICONI`} value={item.icon} uploadFile={uploadFile} onChange={value => update(index, 'icon', value)} /><div className="admin-form-grid"><Field label="NOMI" value={item.label} onChange={value => update(index, 'label', value)} /><Field label="LINK" value={item.url} onChange={value => update(index, 'url', value)} /><Field label="IZOH" value={item.note} onChange={value => update(index, 'note', value)} /></div><MoveActions index={index} length={content.links.length} onMove={(from, to) => moveItem(setContent, 'links', from, to)} onDelete={() => setContent(current => ({ ...current, links: current.links.filter((_, itemIndex) => itemIndex !== index) }))} /></article>)}</div></section>
}

function SettingsEditor({ username, setUsername }) {
  const [form, setForm] = useState({ username, currentPassword: '', password: '' }); const [status, setStatus] = useState('')
  const submit = async event => { event.preventDefault(); setStatus(''); try { const data = await api('/api/admin-auth', { method: 'POST', body: JSON.stringify({ action: 'change-credentials', ...form }) }); setUsername(data.username); setForm(current => ({ ...current, currentPassword: '', password: '' })); setStatus('Login va parol yangilandi.') } catch (error) { setStatus(error.message) } }
  return <section><header className="admin-section-head"><div><p>SECURITY</p><h2>Login va parol</h2></div></header><form className="admin-settings-card" onSubmit={submit}><Field label="YANGI LOGIN" value={form.username} onChange={value => setForm(current => ({ ...current, username: value }))} /><Field label="JORIY PAROL" type="password" value={form.currentPassword} onChange={value => setForm(current => ({ ...current, currentPassword: value }))} /><Field label="YANGI PAROL" type="password" value={form.password} onChange={value => setForm(current => ({ ...current, password: value }))} /><p className="admin-muted">Parol kamida 8 belgidan iborat bo‘lishi kerak.</p>{status && <p className={status.includes('yangilandi') ? 'admin-success' : 'admin-error'}>{status}</p>}<button className="admin-primary">Login va parolni almashtirish</button></form></section>
}

function Empty({ text }) { return <div className="admin-empty"><Wrench /><p>{text}</p></div> }
function Dashboard({ content, openTab }) {
  const cards = [['hero', 'Asosiy sahifa', 3, MonitorUp, '3 tildagi hero matnlari'], ['photos', 'Rasmlar', content.photos.length, Image, 'Portfolio galereyasi'], ['about', 'Men haqimda', Object.values(content.about).reduce((total, list) => total + list.length, 0), UserRound, '3 tildagi matnlar'], ['skills', 'Qobiliyatlar', content.skills.length, Sparkles, 'Texnologiya va vositalar'], ['projects', 'Loyihalar', content.projects.length, FolderKanban, 'Faol va rejalashtirilgan'], ['links', 'Linklar', content.links.length, Link2, 'Ijtimoiy va tashqi linklar']]
  return <section className="admin-dashboard"><div className="admin-welcome"><div><p className="admin-kicker">PORTFOLIO CONTROL CENTER</p><h2>Kontentingizni bir joydan boshqaring.</h2><p>Kerakli bo‘limni tanlang, o‘zgarish kiriting va yuqoridagi <b>Saqlash</b> tugmasini bosing.</p></div>{content.photos[0]?.src && <img src={content.photos[0].src} alt="Portfolio preview" />}</div><div className="admin-overview-grid">{cards.map(([id, label, count, Icon, note]) => <button type="button" onClick={() => openTab(id)} key={id}><span><Icon /></span><div><strong>{count}</strong><b>{label}</b><small>{note}</small></div><ArrowLeft className="admin-card-arrow" /></button>)}</div><div className="admin-dashboard-note"><span><i /></span><div><b>Portfolio bilan sinxron</b><p>Saqlangan o‘zgarishlar avtomatik ravishda asosiy saytda ko‘rinadi.</p></div><a href="https://abdulmalik.uz" target="_blank" rel="noreferrer">Saytni ko‘rish <ExternalLink /></a></div></section>
}

export default function AdminApp() {
  const [auth, setAuth] = useState({ checking: true, username: '' }); const [content, setContent] = useState(normalizeContent(defaultContent)); const [tab, setTab] = useState('dashboard'); const [status, setStatus] = useState(''); const [saving, setSaving] = useState(false)
  useEffect(() => { api('/api/admin-auth').then(data => setAuth({ checking: false, username: data.username })).catch(() => setAuth({ checking: false, username: '' })) }, [])
  useEffect(() => { if (!auth.username) return; api('/api/content').then(data => data.content && setContent(normalizeContent(data.content))).catch(error => setStatus(error.message)) }, [auth.username])
  if (auth.checking) return <main className="admin-loading"><span /> Admin panel yuklanmoqda…</main>
  if (!auth.username) return <Login onLogin={username => setAuth({ checking: false, username })} />

  const save = async () => { setSaving(true); setStatus(''); try { const data = await api('/api/content', { method: 'PUT', body: JSON.stringify({ content }) }); setContent(normalizeContent(data.content)); setStatus('Barcha o‘zgarishlar saqlandi.') } catch (error) { setStatus(error.message) } finally { setSaving(false) } }
  const uploadFile = async file => { setStatus(''); try { const dataUrl = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file) }); const uploaded = await api('/api/admin-media', { method: 'POST', body: JSON.stringify({ mimeType: file.type, data: dataUrl }) }); setStatus('Rasm yuklandi. Endi “Saqlash”ni bosing.'); return uploaded.url } catch (error) { setStatus(error.message); throw error } }
  const logout = async () => { await api('/api/admin-auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }); setAuth({ checking: false, username: '' }) }
  const active = tabs.find(([id]) => id === tab)
  return <div className="admin-shell"><aside className="admin-sidebar"><a className="admin-brand" href="https://abdulmalik.uz"><img src="/brand/aa-mark.png" alt="AA" /><span>CONTROL<br />CENTER</span></a><nav>{tabs.map(([id, label, Icon]) => <button className={tab === id ? 'active' : ''} onClick={() => setTab(id)} key={id}><Icon />{label}</button>)}</nav><div className="admin-sidebar-bottom"><a href="https://abdulmalik.uz" target="_blank" rel="noreferrer"><ExternalLink /> Saytni ochish</a><button onClick={logout}><LogOut /> Chiqish</button></div></aside><main className="admin-main"><header className="admin-topbar"><div><p>ADMIN / {active?.[0].toUpperCase()}</p><h1>{active?.[1]}</h1></div><div><span className="admin-user"><i />{auth.username}</span><button className="admin-save" onClick={save} disabled={saving}><Save />{saving ? 'Saqlanmoqda…' : 'Saqlash'}</button></div></header>{status && <div className={status.includes('saqlandi') || status.includes('yuklandi') ? 'admin-toast success' : 'admin-toast'}>{status}</div>}<div className="admin-workspace">{tab === 'dashboard' && <Dashboard content={content} openTab={setTab} />}{tab === 'hero' && <HeroEditor content={content} setContent={setContent} />}{tab === 'photos' && <PhotosEditor content={content} setContent={setContent} uploadFile={uploadFile} />}{tab === 'about' && <AboutEditor content={content} setContent={setContent} />}{tab === 'skills' && <SkillsEditor content={content} setContent={setContent} uploadFile={uploadFile} />}{tab === 'projects' && <ProjectsEditor content={content} setContent={setContent} uploadFile={uploadFile} />}{tab === 'links' && <LinksEditor content={content} setContent={setContent} uploadFile={uploadFile} />}{tab === 'settings' && <SettingsEditor username={auth.username} setUsername={username => setAuth(current => ({ ...current, username }))} />}</div></main></div>
}
