import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { RAFFLE } from '@/content/raffle'
import {
  createReservation as createReservationRequest,
  getRaffle,
  getReservation,
} from '@/services/api'
import type {
  CreateReservationResult,
  OccupiedNumber,
  RaffleSnapshot,
  Reservation,
  ReservationInput,
  Stats,
  Winner,
} from '@/types/raffle'

const LAST_RESERVATION_KEY = 'rifa-last-reservation'
const POLL_MS = 15000

const EMPTY_STATS: Stats = {
  total: RAFFLE.totalNumbers,
  available: RAFFLE.totalNumbers,
  pending: 0,
  paid: 0,
  revenue: 0,
}

interface RaffleContextValue {
  closed: boolean
  winners: Winner[]
  occupied: Map<number, OccupiedNumber>
  stats: Stats
  loading: boolean
  error: string | null
  lastReservation: Reservation | null
  loadingReservation: boolean
  refresh: () => Promise<void>
  createReservation: (input: ReservationInput) => Promise<CreateReservationResult>
}

const RaffleContext = createContext<RaffleContextValue | null>(null)

export function RaffleProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<RaffleSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastReservation, setLastReservation] = useState<Reservation | null>(null)
  const [loadingReservation, setLoadingReservation] = useState(() =>
    Boolean(localStorage.getItem(LAST_RESERVATION_KEY)),
  )
  const lastId = useRef<string | null>(localStorage.getItem(LAST_RESERVATION_KEY))

  const refresh = useCallback(async () => {
    try {
      const data = await getRaffle()
      setSnapshot(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a rifa.')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshLastReservation = useCallback(async () => {
    const id = lastId.current
    if (!id) {
      setLoadingReservation(false)
      return
    }
    try {
      const { reservation } = await getReservation(id)
      setLastReservation(reservation)
    } catch {
      // Reserva removida no reset da demonstração.
    } finally {
      setLoadingReservation(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial + polling
    void refresh()
    void refreshLastReservation()
    const timer = setInterval(() => {
      void refresh()
      void refreshLastReservation()
    }, POLL_MS)
    return () => clearInterval(timer)
  }, [refresh, refreshLastReservation])

  const createReservation = useCallback(
    async (input: ReservationInput): Promise<CreateReservationResult> => {
      try {
        const reservation = await createReservationRequest(input)
        lastId.current = reservation.id
        localStorage.setItem(LAST_RESERVATION_KEY, reservation.id)
        setLastReservation(reservation)
        setLoadingReservation(false)
        await refresh()
        return { ok: true, reservation }
      } catch (err) {
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Não foi possível reservar.',
        }
      }
    },
    [refresh],
  )

  const occupied = useMemo(
    () => new Map((snapshot?.occupied ?? []).map((entry) => [entry.number, entry])),
    [snapshot],
  )

  const value = useMemo<RaffleContextValue>(
    () => ({
      closed: snapshot?.closed ?? false,
      winners: snapshot?.winners ?? [],
      occupied,
      stats: snapshot?.stats ?? EMPTY_STATS,
      loading,
      error,
      lastReservation,
      loadingReservation,
      refresh,
      createReservation,
    }),
    [
      createReservation,
      error,
      lastReservation,
      loading,
      loadingReservation,
      occupied,
      refresh,
      snapshot,
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
