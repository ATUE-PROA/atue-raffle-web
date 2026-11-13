import { useState } from 'react'
import { Minus, Plus, Search, Shuffle, Ticket, Trophy } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { NumberGrid } from '@/components/raffle/number-grid'
import { ReservationDialog } from '@/components/raffle/reservation-dialog'
import { WinnersList } from '@/components/raffle/winners-list'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RAFFLE, RAFFLE_CONTENT } from '@/content/raffle'
import { useRaffle } from '@/contexts/raffle-provider'
import { calculateTotal, formatBRL, padNumber, shuffle } from '@/lib/raffle'
import { cn } from '@/lib/utils'

const QUICK_QUANTITIES = RAFFLE_CONTENT.picker.quick

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-eyebrow text-muted-foreground">{label}</p>
      <p className={cn('mt-1 text-2xl font-semibold tracking-tight', highlight && 'text-blue-600')}>
        {value.toLocaleString('pt-BR')}
      </p>
    </div>
  )
}

function RaffleArt() {
  const [failed, setFailed] = useState(false)

  return (
    <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-xl border border-border bg-muted/30 shadow-soft lg:mx-0">
      {failed ? (
        <div className="flex aspect-square flex-col items-center justify-center gap-3 p-6 text-center">
          <img src="/atue-icon.svg" alt="" aria-hidden="true" className="size-14" />
          <p className="text-sm font-medium">{RAFFLE_CONTENT.hero.artPlaceholder}</p>
          <p className="max-w-[16rem] text-xs text-muted-foreground">
            {RAFFLE_CONTENT.hero.artHint}
          </p>
        </div>
      ) : (
        <img
          src="/rifa-art.webp"
          alt={RAFFLE_CONTENT.hero.artAlt}
          onError={() => setFailed(true)}
          className="aspect-square w-full object-cover"
        />
      )}
    </div>
  )
}

export function HomePage() {
  const { occupied, stats, closed, winners, loading, error, refresh } = useRaffle()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'auto' | 'manual'>('auto')
  const [selected, setSelected] = useState<number[]>([])
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState(100)
  const [quantity, setQuantity] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const total = calculateTotal(selected.length)

  function toggleNumber(number: number) {
    setNotice(null)
    setSelected((current) =>
      current.includes(number)
        ? current.filter((item) => item !== number)
        : [...current, number].sort((a, b) => a - b),
    )
  }

  function pickRandom(count: number) {
    const free: number[] = []
    const chosen = new Set(selected)
    for (let number = 1; number <= RAFFLE.totalNumbers; number += 1) {
      if (!occupied.has(number) && !chosen.has(number)) free.push(number)
    }

    if (free.length === 0) {
      setNotice('Nenhum número livre disponível.')
      return
    }

    const result = shuffle(free).slice(0, Math.min(count, free.length))
    setSelected((current) => [...current, ...result].sort((a, b) => a - b))
    setNotice(
      result.length < count
        ? `Só havia ${result.length} número(s) livre(s).`
        : `${result.length} número(s) adicionado(s).`,
    )
  }

  function addRandom() {
    pickRandom(Math.max(1, Math.min(quantity, RAFFLE.totalNumbers)))
  }

  return (
    <main aria-busy={loading} className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {error ? (
        <p role="alert" className="mb-6 text-sm text-destructive">
          {error}{' '}
          <button
            type="button"
            onClick={() => void refresh()}
            className="font-medium underline underline-offset-4"
          >
            Tentar novamente
          </button>
        </p>
      ) : null}
      <section className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
        <div>
          <p className="text-eyebrow text-blue-600">{RAFFLE_CONTENT.hero.eyebrow}</p>
          <h1 className="text-display mt-3">{RAFFLE_CONTENT.hero.title}</h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            {RAFFLE_CONTENT.hero.description}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            {RAFFLE_CONTENT.priceTags.map((tag) => (
              <p key={tag.label} className="text-sm">
                <span className="text-muted-foreground">{tag.label}</span>{' '}
                <span
                  className={cn('font-semibold', tag.promo ? 'text-blue-600' : 'text-foreground')}
                >
                  {tag.detail}
                </span>
              </p>
            ))}
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
              <Trophy aria-hidden="true" className="size-3.5" />
              {RAFFLE_CONTENT.hero.prize}
            </p>
          </div>
        </div>

        <RaffleArt />
      </section>

      {closed ? (
        <section className="mt-12 border-t border-border pt-8" aria-labelledby="closed-title">
          <div className="flex items-center gap-3">
            <Ticket aria-hidden="true" className="size-5 text-blue-600" />
            <div>
              <h2 id="closed-title" className="text-section">
                {RAFFLE_CONTENT.closed.title}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {RAFFLE_CONTENT.closed.description}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <WinnersList winners={winners} />
          </div>
        </section>
      ) : (
        <>
          <section
            className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-border py-5 sm:grid-cols-4"
            aria-label="Resumo da rifa"
          >
            <StatCard label={RAFFLE_CONTENT.stats.total} value={stats.total} />
            <StatCard label={RAFFLE_CONTENT.stats.available} value={stats.available} highlight />
            <StatCard label={RAFFLE_CONTENT.stats.pending} value={stats.pending} />
            <StatCard label={RAFFLE_CONTENT.stats.paid} value={stats.paid} />
          </section>

          <section className="mt-12 border-t border-border pt-6" aria-labelledby="picker-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="picker-title" className="text-section">
                  {RAFFLE_CONTENT.picker.title}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {RAFFLE_CONTENT.picker.description}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMode((current) => (current === 'auto' ? 'manual' : 'auto'))
                  setNotice(null)
                }}
              >
                <Shuffle aria-hidden="true" />
                {mode === 'auto' ? RAFFLE_CONTENT.picker.auto : RAFFLE_CONTENT.picker.manual}
              </Button>
            </div>

            {notice ? (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                {notice}
              </p>
            ) : null}

            {mode === 'auto' ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {RAFFLE_CONTENT.picker.autoTitle}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {QUICK_QUANTITIES.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => pickRandom(amount)}
                      >
                        + {amount} bilhetes
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="auto-quantity">{RAFFLE_CONTENT.picker.quantity}</Label>
                    <div className="flex items-center rounded-md border border-input">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-r-none"
                        aria-label="Diminuir quantidade"
                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      >
                        <Minus aria-hidden="true" />
                      </Button>
                      <input
                        id="auto-quantity"
                        type="number"
                        min={1}
                        max={RAFFLE.totalNumbers}
                        value={quantity}
                        onChange={(event) =>
                          setQuantity(
                            Math.max(
                              1,
                              Math.min(RAFFLE.totalNumbers, Number(event.target.value) || 1),
                            ),
                          )
                        }
                        className="h-9 w-16 border-0 bg-transparent text-center text-sm outline-none"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-l-none"
                        aria-label="Aumentar quantidade"
                        onClick={() =>
                          setQuantity((current) => Math.min(RAFFLE.totalNumbers, current + 1))
                        }
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                    </div>
                  </div>

                  <Button type="button" variant="brand" size="xl" onClick={addRandom}>
                    {RAFFLE_CONTENT.picker.add}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:max-w-xs">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={RAFFLE_CONTENT.picker.searchPlaceholder}
                      aria-label={RAFFLE_CONTENT.picker.search}
                      className="pl-9"
                    />
                  </div>

                  <ul className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <li className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full border border-border"
                      />
                      {RAFFLE_CONTENT.legend.available}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span aria-hidden="true" className="size-2 rounded-full bg-blue-600" />
                      {RAFFLE_CONTENT.legend.selected}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-muted-foreground/50"
                      />
                      {RAFFLE_CONTENT.legend.pending}
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span aria-hidden="true" className="size-2 rounded-full bg-foreground/50" />
                      {RAFFLE_CONTENT.legend.paid}
                    </li>
                  </ul>
                </div>

                <NumberGrid
                  occupied={occupied}
                  selected={selected}
                  closed={closed}
                  search={search}
                  visibleCount={visibleCount}
                  onToggle={toggleNumber}
                  onLoadMore={() => setVisibleCount((current) => current + 100)}
                />
              </div>
            )}
          </section>
        </>
      )}

      {selected.length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-xl font-semibold tracking-tight">{selected.length}</span>
              <span className="text-sm text-muted-foreground">
                {RAFFLE_CONTENT.selection.count}
              </span>
              <span className="text-sm">·</span>
              <span className="text-sm font-medium">{formatBRL(total)}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                ({selected.map(padNumber).join(', ')})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => setSelected([])}>
                {RAFFLE_CONTENT.selection.clear}
              </Button>
              <Button type="button" variant="brand" onClick={() => setDialogOpen(true)}>
                {RAFFLE_CONTENT.selection.continue}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={selected.length > 0 ? 'h-16' : undefined} />

      <ReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        numbers={selected}
        onSuccess={() => {
          setSelected([])
          navigate('/pagamento')
        }}
      />
    </main>
  )
}
