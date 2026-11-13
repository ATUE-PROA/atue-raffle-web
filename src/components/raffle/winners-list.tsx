import { Trophy } from 'lucide-react'

import { RAFFLE_CONTENT } from '@/content/raffle'
import { padNumber, shortName } from '@/lib/raffle'
import type { Winner } from '@/types/raffle'

export function WinnersList({ winners }: { winners: Winner[] }) {
  if (winners.length === 0) {
    return <p className="py-6 text-sm text-muted-foreground">{RAFFLE_CONTENT.closed.noWinners}</p>
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {winners.map((winner) => (
        <li key={winner.position} className="rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-eyebrow text-muted-foreground">{winner.position}º prêmio</span>
            <Trophy aria-hidden="true" className="size-4 text-blue-600" />
          </div>
          <p className="mt-3 font-heading text-3xl leading-none tracking-tight">
            {padNumber(winner.number)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{shortName(winner.customerName)}</p>
        </li>
      ))}
    </ul>
  )
}
