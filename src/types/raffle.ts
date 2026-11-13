export type ReservationStatus = 'pending' | 'paid' | 'cancelled'

export interface Reservation {
  id: string
  customerName: string
  customerPhone: string
  indication: string
  numbers: number[]
  totalAmount: number
  status: ReservationStatus
  createdAt: string
  confirmedAt: string | null
}

export interface Winner {
  position: number
  number: number
  customerName: string
}

export interface RaffleState {
  reservations: Reservation[]
  closed: boolean
  winners: Winner[]
  lastReservationId: string | null
}

export interface OccupiedNumber {
  number: number
  status: Exclude<ReservationStatus, 'cancelled'>
  customerName: string
}

export interface Stats {
  total: number
  available: number
  pending: number
  paid: number
  revenue: number
}

export interface ReservationInput {
  customerName: string
  customerPhone: string
  indication: string
  numbers: number[]
}

export type CreateReservationResult =
  { ok: true; reservation: Reservation } | { ok: false; error: string }
