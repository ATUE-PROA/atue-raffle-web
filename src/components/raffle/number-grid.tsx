import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { RAFFLE, RAFFLE_CONTENT } from '@/content/raffle'
import { padNumber } from '@/lib/raffle'
import { cn } from '@/lib/utils'
import type { OccupiedNumber } from '@/types/raffle'

interface NumberGridProps {
  occupied: Map<number, OccupiedNumber>
  selected: readonly number[]
  closed: boolean
  search: string
  visibleCount: number
  onToggle: (number: number) => void
  onLoadMore: () => void
}

export function NumberGrid({
  occupied,
  selected,
  closed,
  search,
  visibleCount,
  onToggle,
  onLoadMore,
}: NumberGridProps) {
  const selectedSet = new Set(selected)
  const term = search.trim()
  const items: ReactNode[] = []
  let rendered = 0
  let totalMatches = 0

  for (let index = 0; index < RAFFLE.totalNumbers; index += 1) {
    const number = index + 1
    const padded = padNumber(number)
    if (term && !padded.includes(term)) continue

    totalMatches += 1
    if (!term && rendered >= visibleCount) continue

    const entry = occupied.get(number)
    const isSelected = selectedSet.has(number)
    rendered += 1

    const isBlocked = Boolean(entry) || closed

    items.push(
      <button
        key={number}
        type="button"
        disabled={isBlocked}
        aria-pressed={isSelected}
        aria-label={
          entry
            ? `Número ${padded}, ${entry.status === 'paid' ? 'pago' : 'reservado'}`
            : `Número ${padded}${isSelected ? ', selecionado' : ', disponível'}`
        }
        onClick={() => onToggle(number)}
        className={cn(
          'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border text-xs leading-none font-medium transition-colors',
          'focus-visible:ring-2 focus-visible:ring-blue-600/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:outline-none',
          entry?.status === 'paid' && 'border-border bg-muted/60 text-muted-foreground',
          entry?.status === 'pending' && 'border-border bg-muted text-muted-foreground',
          !entry &&
            !closed &&
            (isSelected
              ? 'border-blue-600 bg-blue-600 text-white'
              : 'border-border bg-background text-foreground hover:border-blue-600 hover:text-blue-600'),
          !entry &&
            closed &&
            'cursor-not-allowed border-border bg-background text-muted-foreground opacity-50',
        )}
      >
        <span>{padded}</span>
        {entry?.status === 'paid' ? (
          <span className="max-w-full truncate px-0.5 text-[0.6rem] text-muted-foreground">
            {entry.customerName.split(' ')[0]}
          </span>
        ) : null}
      </button>,
    )
  }

  const hasMore = !term && visibleCount < RAFFLE.totalNumbers

  return (
    <div className="mt-4">
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 sm:gap-2 md:grid-cols-10">
        {items}
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {RAFFLE_CONTENT.picker.empty}
        </p>
      ) : null}

      {hasMore && totalMatches > rendered ? (
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="outline" onClick={onLoadMore}>
            {RAFFLE_CONTENT.picker.loadMore}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
