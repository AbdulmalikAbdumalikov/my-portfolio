import { ensureAdminSchema } from './_admin.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return res.status(405).end()
    const id = String(req.query?.id || '')
    if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(400).end()
    const client = await ensureAdminSchema()
    const result = await client.query('SELECT mime_type, bytes FROM portfolio_admin_media WHERE id = $1', [id])
    if (!result.rowCount) return res.status(404).end()
    res.setHeader('Content-Type', result.rows[0].mime_type)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    return res.status(200).send(result.rows[0].bytes)
  } catch (error) {
    console.error('Media read failed:', error.message)
    return res.status(500).end()
  }
}
