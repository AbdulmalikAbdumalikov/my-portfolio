import { env } from './_telegram.js'

const redisUrl = () => env('KV_REST_API_URL').replace(/\/$/, '')
const redisToken = () => env('KV_REST_API_TOKEN')
const userKey = userId => `portfolio:bot-user:${userId}`

async function command(parts) {
  const url = redisUrl()
  const token = redisToken()
  if (!url || !token) return null
  const response = await fetch(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(parts),
  })
  if (!response.ok) throw new Error('User store request failed.')
  return response.json()
}

export async function getUserProfile(userId) {
  const response = await command(['GET', userKey(userId)])
  if (!response?.result) return null
  try { return JSON.parse(response.result) } catch { return null }
}

export async function saveUserProfile(userId, profile) {
  await command(['SET', userKey(userId), JSON.stringify(profile)])
}

export const hasUserStore = () => Boolean(redisUrl() && redisToken())
