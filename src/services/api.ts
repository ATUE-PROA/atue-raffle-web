import type {
  AdminData,
  Reservation,
  ReservationInput,
  RaffleSnapshot,
  Winner,
} from '@/types/raffle'

const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  adminKey?: string
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' }
  if (options.adminKey) headers['x-admin-key'] = options.adminKey

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0)
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(payload?.error ?? 'Não foi possível concluir a operação.', response.status)
  }

  return (await response.json()) as T
}

export function getRaffle() {
  return request<RaffleSnapshot>('/api/raffle')
}

export async function createReservation(input: ReservationInput) {
  const { reservation } = await request<{ reservation: Reservation }>('/api/reservations', {
    method: 'POST',
    body: input,
  })
  return reservation
}

export function getReservation(id: string) {
  return request<{ reservation: Reservation }>(`/api/reservations/${encodeURIComponent(id)}`)
}

export function getAdminData(adminKey: string) {
  return request<AdminData>('/api/admin/data', { adminKey })
}

export function confirmReservation(adminKey: string, id: string) {
  return request<{ ok: true }>(`/api/admin/reservations/${encodeURIComponent(id)}/confirm`, {
    method: 'POST',
    adminKey,
  })
}

export function cancelReservation(adminKey: string, id: string) {
  return request<{ ok: true }>(`/api/admin/reservations/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
    adminKey,
  })
}

export function closeRaffle(adminKey: string) {
  return request<{ winners: Winner[] }>('/api/admin/close', { method: 'POST', adminKey })
}

export function reopenRaffle(adminKey: string) {
  return request<{ ok: true }>('/api/admin/reopen', { method: 'POST', adminKey })
}

export function resetRaffle(adminKey: string) {
  return request<{ ok: true }>('/api/admin/reset', { method: 'POST', adminKey })
}
