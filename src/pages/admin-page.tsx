import { useMemo, useState, type FormEvent } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'

import { ConfirmDialog } from '@/components/raffle/confirm-dialog'
import { WinnersList } from '@/components/raffle/winners-list'
import { Button } from '@/components/ui/button'
import { FormAlert } from '@/components/ui/form-alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RAFFLE, RAFFLE_CONTENT } from '@/content/raffle'
import { useRaffle } from '@/contexts/raffle-provider'
import { formatBRL, padNumber } from '@/lib/raffle'
import type { Reservation } from '@/types/raffle'

const ADMIN_SESSION_KEY = 'rifa-admin-session'

export function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === '1')

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
    setAuthed(false)
  }

  return authed ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin
      onSuccess={() => {
        sessionStorage.setItem(ADMIN_SESSION_KEY, '1')
        setAuthed(true)
      }}
    />
  )
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (email.trim() === RAFFLE.adminEmail && password === RAFFLE.adminPassword) {
      onSuccess()
      return
    }
    setError(true)
  }

  return (
    <main className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <div className="border-t border-border pt-8">
        <h1 className="text-section">{RAFFLE_CONTENT.admin.loginTitle}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {RAFFLE_CONTENT.admin.loginDescription}
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="admin-email">{RAFFLE_CONTENT.admin.email}</Label>
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError(false)
              }}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="admin-password">{RAFFLE_CONTENT.admin.password}</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError(false)
              }}
              required
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {RAFFLE_CONTENT.admin.loginError}
            </p>
          ) : null}

          <Button type="submit" variant="brand" size="xl">
            {RAFFLE_CONTENT.admin.login}
          </Button>
        </form>

        <p className="mt-4 text-xs text-muted-foreground">{RAFFLE_CONTENT.admin.demoHint}</p>

        <Link
          to="/"
          className="mt-6 inline-block text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {RAFFLE_CONTENT.admin.backToRaffle}
        </Link>
      </div>
    </main>
  )
}

type PendingAction =
  | { type: 'pay'; reservation: Reservation }
  | { type: 'cancel'; reservation: Reservation }
  | { type: 'draw' }
  | { type: 'reopen' }
  | { type: 'reset' }

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const {
    state,
    stats,
    confirmPayment,
    cancelReservation,
    closeRaffle,
    reopenRaffle,
    resetRaffle,
  } = useRaffle()
  const [query, setQuery] = useState('')
  const [action, setAction] = useState<PendingAction | null>(null)
  const [drawError, setDrawError] = useState<string | null>(null)

  const allPending = state.reservations.filter((reservation) => reservation.status === 'pending')
  const allPaid = state.reservations.filter((reservation) => reservation.status === 'paid')

  const pendingReservations = allPending.filter((reservation) => matchesQuery(reservation, query))
  const paidReservations = allPaid.filter((reservation) => matchesQuery(reservation, query))

  const revenueData = useMemo(() => buildRevenueData(state.reservations), [state.reservations])
  const indications = useMemo(() => buildIndications(state.reservations), [state.reservations])
  const topIndications = [...indications].sort((a, b) => b.refs - a.refs).slice(0, 10)
  const hasRevenue = revenueData.some((item) => item.value > 0)
  const progress = Math.min(100, Math.round((stats.paid / stats.total) * 100))

  function handleConfirm() {
    if (!action) return
    if (action.type === 'pay') confirmPayment(action.reservation.id)
    if (action.type === 'cancel') cancelReservation(action.reservation.id)
    if (action.type === 'reopen') reopenRaffle()
    if (action.type === 'reset') resetRaffle()
    if (action.type === 'draw') {
      const winners = closeRaffle()
      setDrawError(winners.length === 0 ? RAFFLE_CONTENT.admin.drawNoPaid : null)
    }
    setAction(null)
  }

  const confirmContent = getConfirmContent(action)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-eyebrow text-blue-600">Painel</p>
          <h1 className="text-display mt-2">{RAFFLE_CONTENT.admin.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {RAFFLE_CONTENT.admin.description}
          </p>
        </div>
        <Button type="button" variant="outline" onClick={onLogout}>
          {RAFFLE_CONTENT.admin.logout}
        </Button>
      </header>

      <p className="mt-4 text-sm">
        <Link
          to="/"
          className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {RAFFLE_CONTENT.admin.backToRaffle}
        </Link>
      </p>

      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5" aria-label="Indicadores">
        <MetricCard label={RAFFLE_CONTENT.admin.cards.pending} value={String(allPending.length)} />
        <MetricCard label={RAFFLE_CONTENT.admin.cards.paid} value={String(allPaid.length)} />
        <MetricCard label={RAFFLE_CONTENT.admin.cards.sold} value={String(stats.paid)} />
        <MetricCard label={RAFFLE_CONTENT.admin.cards.available} value={String(stats.available)} />
        <MetricCard label={RAFFLE_CONTENT.admin.cards.revenue} value={formatBRL(stats.revenue)} />
      </section>

      <section className="mt-6" aria-label={RAFFLE_CONTENT.admin.progress}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{RAFFLE_CONTENT.admin.progress}</span>
          <span className="font-medium tabular-nums">{progress}%</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="mt-10 grid gap-6 border-t border-border pt-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {RAFFLE_CONTENT.admin.revenueTitle}
          </h2>
          {hasRevenue ? (
            <div className="mt-4 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value: number) => `R$ ${value}`}
                    width={64}
                  />
                  <Tooltip
                    formatter={(value) => formatBRL(Number(value))}
                    contentStyle={{ borderRadius: 8, borderColor: 'var(--border)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={RAFFLE_CONTENT.admin.cards.revenue}
                    stroke="var(--atue-blue)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'var(--atue-blue)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">{RAFFLE_CONTENT.admin.emptyChart}</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {RAFFLE_CONTENT.admin.indicationsTitle}
          </h2>
          {indications.length > 0 ? (
            <>
              <div className="mt-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topIndications}
                    layout="vertical"
                    margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke="var(--border)" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={110}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value) => `${value} indicação(ões)`}
                      contentStyle={{ borderRadius: 8, borderColor: 'var(--border)' }}
                    />
                    <Bar
                      dataKey="refs"
                      name={RAFFLE_CONTENT.admin.indicationsTitle}
                      fill="var(--atue-blue)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <ul className="mt-4 divide-y divide-border border-t border-border">
                {indications.map((row, index) => (
                  <li
                    key={row.name}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <span className="min-w-0 truncate">
                      <span className="mr-2 text-muted-foreground">{index + 1}º</span>
                      {row.name}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {row.numbers} número{row.numbers > 1 ? 's' : ''} · {formatBRL(row.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              {RAFFLE_CONTENT.admin.noIndications}
            </p>
          )}
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-6" aria-labelledby="pending-title">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="pending-title" className="text-section">
              {RAFFLE_CONTENT.admin.pendingTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {RAFFLE_CONTENT.admin.pendingDescription}
            </p>
          </div>

          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={RAFFLE_CONTENT.admin.searchPlaceholder}
            aria-label={RAFFLE_CONTENT.admin.searchPlaceholder}
            className="sm:max-w-sm"
          />
        </div>

        <ul className="mt-4 grid gap-3">
          {pendingReservations.length === 0 ? (
            <li className="py-4 text-sm text-muted-foreground">{RAFFLE_CONTENT.admin.noPending}</li>
          ) : (
            pendingReservations.map((reservation) => (
              <li
                key={reservation.id}
                className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{reservation.customerName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {reservation.customerPhone}
                    {reservation.indication ? ` · ${reservation.indication}` : ''}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="text-muted-foreground">{RAFFLE_CONTENT.admin.numbers}: </span>
                    {reservation.numbers.map(padNumber).join(', ')}
                  </p>
                  <p className="mt-1 text-sm font-medium">{formatBRL(reservation.totalAmount)}</p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="brand"
                    size="sm"
                    onClick={() => setAction({ type: 'pay', reservation })}
                  >
                    {RAFFLE_CONTENT.admin.confirm}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setAction({ type: 'cancel', reservation })}
                  >
                    {RAFFLE_CONTENT.admin.cancel}
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-10 border-t border-border pt-6" aria-labelledby="paid-title">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="paid-title" className="text-section">
              {RAFFLE_CONTENT.admin.paidTitle}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {RAFFLE_CONTENT.admin.paidDescription}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => exportCsv(allPaid)}
            disabled={allPaid.length === 0}
          >
            {RAFFLE_CONTENT.admin.export}
          </Button>
        </div>

        <div className="mt-4">
          <PaidTable reservations={paidReservations} />
        </div>
      </section>

      <section className="mt-10 border-t border-border pt-6" aria-labelledby="draw-title">
        <h2 id="draw-title" className="text-section">
          {state.closed ? RAFFLE_CONTENT.admin.winnersTitle : RAFFLE_CONTENT.admin.drawTitle}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {RAFFLE_CONTENT.admin.drawDescription}
        </p>

        {state.closed ? (
          <div className="mt-4 flex flex-col gap-4">
            <WinnersList winners={state.winners} />
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              onClick={() => setAction({ type: 'reopen' })}
            >
              {RAFFLE_CONTENT.admin.reopen}
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <Button
              type="button"
              variant="brand"
              className="w-fit"
              disabled={stats.paid === 0}
              onClick={() => setAction({ type: 'draw' })}
            >
              {RAFFLE_CONTENT.admin.draw}
            </Button>
            {drawError ? (
              <FormAlert tone="error" title="Não foi possível sortear" description={drawError} />
            ) : null}
          </div>
        )}
      </section>

      <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Dados salvos neste navegador (demonstração local).
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setAction({ type: 'reset' })}
        >
          {RAFFLE_CONTENT.admin.reset}
        </Button>
      </div>

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) setAction(null)
        }}
        title={confirmContent.title}
        message={confirmContent.message}
        confirmLabel={confirmContent.confirmLabel}
        destructive={confirmContent.destructive}
        onConfirm={handleConfirm}
      />
    </main>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-eyebrow text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  )
}

interface ConfirmContent {
  title: string
  message: string
  confirmLabel: string
  destructive: boolean
}

function getConfirmContent(action: PendingAction | null): ConfirmContent {
  switch (action?.type) {
    case 'pay':
      return {
        title: RAFFLE_CONTENT.admin.confirmPaymentTitle,
        message: RAFFLE_CONTENT.admin.confirmPaymentMessage,
        confirmLabel: RAFFLE_CONTENT.admin.confirm,
        destructive: false,
      }
    case 'cancel':
      return {
        title: RAFFLE_CONTENT.admin.cancelReservationTitle,
        message: RAFFLE_CONTENT.admin.cancelReservationMessage,
        confirmLabel: RAFFLE_CONTENT.admin.cancel,
        destructive: true,
      }
    case 'reopen':
      return {
        title: RAFFLE_CONTENT.admin.reopenTitle,
        message: RAFFLE_CONTENT.admin.reopenMessage,
        confirmLabel: RAFFLE_CONTENT.admin.reopen,
        destructive: false,
      }
    case 'reset':
      return {
        title: RAFFLE_CONTENT.admin.resetTitle,
        message: RAFFLE_CONTENT.admin.resetMessage,
        confirmLabel: RAFFLE_CONTENT.admin.reset,
        destructive: true,
      }
    default:
      return {
        title: RAFFLE_CONTENT.admin.drawConfirmTitle,
        message: RAFFLE_CONTENT.admin.drawConfirmMessage,
        confirmLabel: RAFFLE_CONTENT.admin.draw,
        destructive: false,
      }
  }
}

function PaidTable({ reservations }: { reservations: Reservation[] }) {
  if (reservations.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">{RAFFLE_CONTENT.admin.noPaid}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Números</TableHead>
          <TableHead>Indicação</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((reservation) => (
          <TableRow key={reservation.id}>
            <TableCell className="font-medium">{reservation.customerName}</TableCell>
            <TableCell className="tabular-nums">
              {reservation.numbers.map(padNumber).join(', ')}
            </TableCell>
            <TableCell>{reservation.indication || '—'}</TableCell>
            <TableCell className="tabular-nums">{formatBRL(reservation.totalAmount)}</TableCell>
            <TableCell>
              {new Date(reservation.confirmedAt ?? reservation.createdAt).toLocaleDateString(
                'pt-BR',
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function matchesQuery(reservation: Reservation, query: string): boolean {
  const term = query.trim().toLowerCase()
  if (!term) return true
  const haystack = [
    reservation.customerName,
    reservation.customerPhone,
    reservation.indication,
    ...reservation.numbers.map(padNumber),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(term)
}

interface RevenuePoint {
  label: string
  value: number
}

function buildRevenueData(reservations: Reservation[]): RevenuePoint[] {
  const now = new Date()
  const points = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      value: 0,
    }
  })

  const byKey = new Map(points.map((point) => [point.key, point]))

  for (const reservation of reservations) {
    if (reservation.status !== 'paid') continue
    const date = new Date(reservation.confirmedAt ?? reservation.createdAt)
    const point = byKey.get(`${date.getFullYear()}-${date.getMonth()}`)
    if (point) point.value += reservation.totalAmount
  }

  return points.map(({ label, value }) => ({ label, value }))
}

interface IndicationRow {
  name: string
  refs: number
  numbers: number
  total: number
}

function buildIndications(reservations: Reservation[]): IndicationRow[] {
  const byName = new Map<string, IndicationRow>()

  for (const reservation of reservations) {
    if (reservation.status !== 'paid') continue
    const name = reservation.indication.trim()
    if (!name) continue

    const current = byName.get(name) ?? { name, refs: 0, numbers: 0, total: 0 }
    current.refs += 1
    current.numbers += reservation.numbers.length
    current.total += reservation.totalAmount
    byName.set(name, current)
  }

  return [...byName.values()].sort((a, b) => b.numbers - a.numbers)
}

function exportCsv(reservations: Reservation[]) {
  if (reservations.length === 0) return

  const escape = (value: string | number) => {
    const text = String(value)
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
  }

  const header = ['Nome', 'Telefone', 'Indicação', 'Números', 'Valor (R$)', 'Data']
  const rows = reservations.map((reservation) =>
    [
      escape(reservation.customerName),
      escape(reservation.customerPhone),
      escape(reservation.indication),
      escape(reservation.numbers.map(padNumber).join('; ')),
      escape(formatBRL(reservation.totalAmount).replace('R$', '').trim()),
      escape(
        new Date(reservation.confirmedAt ?? reservation.createdAt).toLocaleDateString('pt-BR'),
      ),
    ].join(','),
  )

  const csv = [header.join(','), ...rows].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `rifa-pagos-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
