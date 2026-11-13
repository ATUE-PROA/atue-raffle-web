import { RAFFLE } from '@/content/raffle'

export function padNumber(value: number): string {
  return String(value).padStart(3, '0')
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Mantenha em sincronia com worker/src/index.ts: o servidor é a fonte da verdade.
export function calculateTotal(count: number): number {
  const bundles = Math.floor(count / RAFFLE.bundleSize)
  const remaining = count % RAFFLE.bundleSize
  return bundles * RAFFLE.bundlePrice + remaining * RAFFLE.priceSingle
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 2) return name.trim()
  return `${parts[0]} ${parts[parts.length - 1]}`
}

export function shuffle<T>(input: readonly T[]): T[] {
  const items = [...input]
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}
