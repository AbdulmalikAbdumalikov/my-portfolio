import { useEffect, useState } from 'react'
import { KeyRound, LockKeyhole, Palette, X } from 'lucide-react'

const STORAGE_KEY = 'aa-pro-access'
const DEVICE_KEY = 'aa-pro-device'
const styles = [
  ['glassmorphism', 'Glassmorphism', 'Shaffof va yorqin'],
  ['liquid-glass', 'Liquid glass', 'Suyuqlikdek yumshoq'],
  ['neomorphism', 'Neomorphism', 'Yumshoq 3D'],
  ['skeuomorphism', 'Skeuomorphism', 'Real obyekt hissi'],
  ['minimalism', 'Minimalism', 'Toza va sokin'],
  ['maximalism', 'Maximalism', 'Ko‘p rangli va jasur'],
]

function readSession() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return value?.token && new Date(value.expiresAt).getTime() > Date.now() ? value : null
  } catch {
    return null
  }
}

function deviceId() {
  let value = localStorage.getItem(DEVICE_KEY)
  if (!value) {
    value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem(DEVICE_KEY, value)
  }
  return value
}

function applyStyle(style) {
  if (style) document.documentElement.dataset.proStyle = style
}

export default function ProAccess() {
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState(null)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = readSession()
    if (saved) {
      setSession(saved)
      applyStyle(saved.style)
    } else {
      localStorage.removeItem(STORAGE_KEY)
      delete document.documentElement.dataset.proStyle
    }
  }, [])

  const openPanel = () => {
    setStatus('')
    setSession(readSession())
    setOpen(true)
  }

  const redeem = async event => {
    event.preventDefault()
    if (loading) return
    setLoading(true)
    setStatus('')
    try {
      const response = await fetch('/api/pro-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem', code, deviceId: deviceId() }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 429 && data.expiresAt) {
          const minutes = Math.max(1, Math.ceil((new Date(data.expiresAt).getTime() - Date.now()) / 60000))
          throw new Error(`Bu qurilmada qayta code kiritish uchun ${minutes} daqiqa kuting.`)
        }
        throw new Error(data.error || 'Code qabul qilinmadi.')
      }
      const next = { token: data.token, expiresAt: data.expiresAt, style: data.style || 'minimalism' }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setSession(next)
      applyStyle(next.style)
      setCode('')
      setStatus('Pro rejim ochildi.')
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  const chooseStyle = async style => {
    if (!session || loading) return
    setLoading(true)
    setStatus('')
    applyStyle(style)
    try {
      const response = await fetch('/api/pro-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set-style', token: session.token, style }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Style saqlanmadi.')
      const next = { ...session, style: data.style, expiresAt: data.expiresAt }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setSession(next)
      setStatus(`${style} style yoqildi.`)
    } catch (error) {
      setStatus(error.message)
    } finally {
      setLoading(false)
    }
  }

  return <>
    <button className="pro-access-trigger" type="button" onClick={openPanel} aria-label="Pro style menyusini ochish" title="Pro styles"><KeyRound size={14} /><span>PRO</span></button>
    {open && <div className="pro-access-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}>
      <section className="pro-access-panel" role="dialog" aria-modal="true" aria-labelledby="pro-access-title">
        <button className="pro-access-close" type="button" onClick={() => setOpen(false)} aria-label="Pro menyuni yopish"><X size={18} /></button>
        <div className="pro-access-heading"><span><LockKeyhole size={18} /></span><div><p>PRIVATE ACCESS</p><h2 id="pro-access-title">Pro styles</h2></div></div>
        {session ? <>
          <p className="pro-access-note">Sayt ko‘rinishini tanlang. Sessiya <b>6 soat</b> amal qiladi.</p>
          <div className="pro-style-grid">{styles.map(([id, name, note]) => <button type="button" className={session.style === id ? 'active' : ''} onClick={() => chooseStyle(id)} disabled={loading} key={id}><Palette size={16} /><b>{name}</b><small>{note}</small></button>)}</div>
        </> : <form className="pro-code-form" onSubmit={redeem}>
          <p className="pro-access-note">Telegram botdagi <b>🔑 Code olish</b> tugmasidan olingan bir martalik code’ni kiriting.</p>
          <label><span>PRO CODE</span><input value={code} onChange={event => setCode(event.target.value.toUpperCase())} placeholder="PRO-XXXXXXXX" maxLength="12" autoComplete="one-time-code" autoFocus required /></label>
          <button type="submit" disabled={loading}>{loading ? 'Tekshirilmoqda…' : 'Kirish'}</button>
        </form>}
        {status && <p className="pro-access-status" role="status">{status}</p>}
      </section>
    </div>}
  </>
}
