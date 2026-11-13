import { RAFFLE } from '@/content/raffle'
import type { OccupiedNumber, Reservation, Stats, Winner } from '@/types/raffle'

export function padNumber(value: number): string {
  return String(value).padStart(3, '0')
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

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

export function buildOccupied(reservations: Reservation[]): Map<number, OccupiedNumber> {
  const occupied = new Map<number, OccupiedNumber>()

  for (const reservation of reservations) {
    if (reservation.status === 'cancelled') continue
    for (const number of reservation.numbers) {
      occupied.set(number, {
        number,
        status: reservation.status,
        customerName: reservation.customerName,
      })
    }
  }

  return occupied
}

export function getStats(reservations: Reservation[], total = RAFFLE.totalNumbers): Stats {
  let pending = 0
  let paid = 0
  let revenue = 0

  for (const reservation of reservations) {
    if (reservation.status === 'pending') pending += reservation.numbers.length
    if (reservation.status === 'paid') {
      paid += reservation.numbers.length
      revenue += reservation.totalAmount
    }
  }

  return {
    total,
    available: Math.max(0, total - pending - paid),
    pending,
    paid,
    revenue,
  }
}

export function shuffle<T>(input: readonly T[]): T[] {
  const items = [...input]
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[items[i], items[j]] = [items[j], items[i]]
  }
  return items
}

export function drawWinners(reservations: Reservation[], prizes = RAFFLE.prizes): Winner[] {
  const entries = reservations
    .filter((reservation) => reservation.status === 'paid')
    .flatMap((reservation) =>
      reservation.numbers.map((number) => ({ number, customerName: reservation.customerName })),
    )

  const winners: Winner[] = []
  const usedNames = new Set<string>()

  for (const entry of shuffle(entries)) {
    if (winners.length >= prizes) break
    const nameKey = entry.customerName.trim().toLowerCase()
    if (usedNames.has(nameKey)) continue
    usedNames.add(nameKey)
    winners.push({
      position: winners.length + 1,
      number: entry.number,
      customerName: entry.customerName,
    })
  }

  return winners
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `res_${Date.now()}_${Math.random().toString(16).slice(2)}`
}
