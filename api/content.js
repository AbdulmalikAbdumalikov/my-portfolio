import { authenticate, ensureAdminSchema } from './_admin.js'

const text = (value, max = 500) => String(value ?? '').trim().slice(0, max)
const safeUrl = value => {
  const url = text(value, 2500)
  return /^(https?:\/\/|\/)/i.test(url) ? url : ''
}
const list = value => Array.isArray(value) ? value : []

function cleanContent(value) {
  const about = value?.about || {}
  return {
    photos: list(value?.photos).slice(0, 20).map(item => ({ src: safeUrl(item?.src), position: text(item?.position, 40) || 'center' })).filter(item => item.src),
    about: Object.fromEntries(['uz', 'en', 'ru'].map(lang => [lang, list(about[lang]).slice(0, 20).map(item => text(item, 5000)).filter(Boolean)])),
    skills: list(value?.skills).slice(0, 100).map(item => ({ name: text(item?.name, 100), icon: safeUrl(item?.icon), badge: text(item?.badge, 24), category: text(item?.category, 100), description: text(item?.description, 2000) })).filter(item => item.name),
    projects: list(value?.projects).slice(0, 100).map(item => ({
      title: text(item?.title, 140), slug: text(item?.slug, 100), category: text(item?.category, 100), status: ['completed', 'maintained', 'planned'].includes(item?.status) ? item.status : 'completed', year: text(item?.year, 12), description: text(item?.description, 3000), technologies: list(item?.technologies).slice(0, 20).map(technology => text(technology, 60)).filter(Boolean), icon: safeUrl(item?.icon), type: ['website', 'telegram', 'planned'].includes(item?.type) ? item.type : 'website', link: safeUrl(item?.link),
    })).filter(item => item.title),
    links: list(value?.links).slice(0, 40).map((item, index) => ({ id: text(item?.id, 80) || `link-${index + 1}`, label: text(item?.label, 100), icon: safeUrl(item?.icon), url: safeUrl(item?.url), note: text(item?.note, 500) })).filter(item => item.label),
  }
}

export default async function handler(req, res) {
  try {
    // Portfolio content is edited from the admin subdomain. Never let Vercel's
    // edge cache serve an older copy after a successful save.
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('CDN-Cache-Control', 'no-store')
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store')
    const client = await ensureAdminSchema()
    if (req.method === 'GET') {
      const result = await client.query('SELECT content, updated_at FROM portfolio_admin_content WHERE id = 1')
      return res.status(200).json({ content: result.rows[0]?.content, updatedAt: result.rows[0]?.updated_at })
    }
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })
    if (!authenticate(req)) return res.status(401).json({ error: 'Sessiya tugagan.' })
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const content = cleanContent(body?.content)
    const result = await client.query('UPDATE portfolio_admin_content SET content = $1::jsonb, updated_at = NOW() WHERE id = 1 RETURNING updated_at', [JSON.stringify(content)])
    return res.status(200).json({ ok: true, content, updatedAt: result.rows[0].updated_at })
  } catch (error) {
    console.error('Portfolio content failed:', error.message)
    return res.status(500).json({ error: 'Kontentni saqlashda xatolik.' })
  }
}
