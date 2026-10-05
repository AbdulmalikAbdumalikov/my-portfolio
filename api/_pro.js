import { createHash, randomBytes } from 'node:crypto'

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const normalizeCode = value => String(value || '').trim().toUpperCase().replace(/\s+/g, '')
export const hashValue = value => createHash('sha256').update(String(value)).digest('hex')

export function createProCode() {
  const bytes = randomBytes(8)
  let code = 'PRO-'
  for (const byte of bytes) code += alphabet[byte % alphabet.length]
  return code
}

export const createSessionToken = () => randomBytes(32).toString('hex')
