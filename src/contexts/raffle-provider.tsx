import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { RAFFLE } from '@/content/raffle'
import { buildOccupied, calculateTotal, createId, drawWinners, getStats } from '@/lib/raffle'
import type {
  CreateReservationResult,
  OccupiedNumber,
  RaffleState,
  Reservation,
  ReservationInput,
  Stats,
  Winner,
} from '@/types/raffle'

const STORAGE_KEY = 'rifa-state-v1'

const EMPTY_STATE: RaffleState = {
  reservations: [],
  closed: false,
  winners: [],
  lastReservationId: null,
}

function loadState(): RaffleState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as Partial<RaffleState>
    if (!Array.isArray(parsed.reservations)) return EMPTY_STATE
    return {
      reservations: parsed.reservations,
      closed: Boolean(parsed.closed),
      winners: Array.isArray(parsed.winners) ? parsed.winners : [],
      lastReservationId: parsed.lastReservationId ?? null,
    }
  } catch {
    return EMPTY_STATE
  }
}

interface RaffleContextValue {
  state: RaffleState
  occupied: Map<number, OccupiedNumber>
  stats: Stats
  lastReservation: Reservation | null
  createReservation: (input: ReservationInput) => CreateReservationResult
  confirmPayment: (id: string) => void
  cancelReservation: (id: string) => void
  closeRaffle: () => Winner[]
  reopenRaffle: () => void
  resetRaffle: () => void
}

const RaffleContext = createContext<RaffleContextValue | null>(null)

function persist(state: RaffleState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // shortcut: sem localStorage os dados valem só nesta sessão
  }
}

export function RaffleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RaffleState>(loadState)

  useEffect(() => {
    persist(state)
  }, [state])

  const occupied = useMemo(() => buildOccupied(state.reservations), [state.reservations])
  const stats = useMemo(
    () => getStats(state.reservations, RAFFLE.totalNumbers),
    [state.reservations],
  )

  const lastReservation = useMemo(
    () =>
      state.reservations.find((reservation) => reservation.id === state.lastReservationId) ?? null,
    [state.lastReservationId, state.reservations],
  )

  const createReservation = useCallback(
    (input: ReservationInput): CreateReservationResult => {
      const numbers = [...new Set(input.numbers)].sort((a, b) => a - b)

      if (state.closed) {
        return { ok: false, error: 'A rifa está encerrada.' }
      }
      if (numbers.length === 0) {
        return { ok: false, error: 'Selecione pelo menos um número.' }
      }

      const conflicts = numbers.filter((number) => occupied.has(number))
      if (conflicts.length > 0) {
        return {
          ok: false,
          error: `Números indisponíveis: ${conflicts.join(', ')}. Escolha outros.`,
        }
      }

      const reservation: Reservation = {
        id: createId(),
        customerName: input.customerName.trim(),
        customerPhone: input.customerPhone.trim(),
        indication: input.indication.trim(),
        numbers,
        totalAmount: calculateTotal(numbers.length),
        status: 'pending',
        createdAt: new Date().toISOString(),
        confirmedAt: null,
      }

      setState((current) => ({
        ...current,
        reservations: [reservation, ...current.reservations],
        lastReservationId: reservation.id,
      }))

      return { ok: true, reservation }
    },
    [occupied, state.closed],
  )

  const confirmPayment = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      reservations: current.reservations.map((reservation) =>
        reservation.id === id
          ? { ...reservation, status: 'paid', confirmedAt: new Date().toISOString() }
          : reservation,
      ),
    }))
  }, [])

  const cancelReservation = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      reservations: current.reservations.map((reservation) =>
        reservation.id === id ? { ...reservation, status: 'cancelled' } : reservation,
      ),
    }))
  }, [])

  const closeRaffle = useCallback((): Winner[] => {
    const winners = drawWinners(state.reservations)
    if (winners.length === 0) return []
    setState((current) => ({ ...current, closed: true, winners }))
    return winners
  }, [state.reservations])

  const reopenRaffle = useCallback(() => {
    setState((current) => ({ ...current, closed: false, winners: [] }))
  }, [])

  const resetRaffle = useCallback(() => {
    setState({ ...EMPTY_STATE })
  }, [])

  const value = useMemo<RaffleContextValue>(
    () => ({
      state,
      occupied,
      stats,
      lastReservation,
      createReservation,
      confirmPayment,
      cancelReservation,
      closeRaffle,
      reopenRaffle,
      resetRaffle,
    }),
    [
      cancelReservation,
      closeRaffle,
      confirmPayment,
      createReservation,
      lastReservation,
      occupied,
      reopenRaffle,
      resetRaffle,
      state,
      stats,
    ],
  )

  return <RaffleContext.Provider value={value}>{children}</RaffleContext.Provider>
}

export function useRaffle(): RaffleContextValue {
  const context = useContext(RaffleContext)
  if (!context) {
    throw new Error('useRaffle deve ser usado dentro de RaffleProvider')
  }
  return context
}
