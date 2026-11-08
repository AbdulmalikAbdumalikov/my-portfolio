import crypto from 'node:crypto'
import { authenticate, ensureAdminSchema } from './_admin.js'

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export default async function handler(req, res) {
  try {
    if (!authenticate(req)) return res.status(401).json({ error: 'Sessiya tugagan.' })
    const client = await ensureAdminSchema()
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      const mimeType = String(body?.mimeType || '').toLowerCase()
      const encoded = String(body?.data || '').replace(/^data:[^;]+;base64,/, '')
      const bytes = Buffer.from(encoded, 'base64')
      if (!allowed.has(mimeType) || !bytes.length || bytes.length > 2_500_000) return res.status(400).json({ error: 'Rasm JPG, PNG, WEBP yoki GIF va 2.5 MB dan kichik bo‘lishi kerak.' })
      const id = crypto.randomUUID()
      await client.query('INSERT INTO portfolio_admin_media (id, mime_type, bytes) VALUES ($1, $2, $3)', [id, mimeType, bytes])
      return res.status(201).json({ ok: true, url: `/api/media?id=${id}` })
    }
    if (req.method === 'DELETE') {
      const id = String(req.query?.id || '')
      if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).json({ error: 'Invalid media id' })
      await client.query('DELETE FROM portfolio_admin_media WHERE id = $1', [id])
      return res.status(200).json({ ok: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin media failed:', error.message)
    return res.status(500).json({ error: 'Rasmni saqlashda xatolik.' })
  }
}
