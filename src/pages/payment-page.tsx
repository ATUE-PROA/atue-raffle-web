import { useState } from 'react'
import { Check, Copy, Ticket } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { RAFFLE, RAFFLE_CONTENT } from '@/content/raffle'
import { useRaffle } from '@/contexts/raffle-provider'
import { formatBRL, padNumber } from '@/lib/raffle'

export function PaymentPage() {
  const { lastReservation } = useRaffle()
  const [copied, setCopied] = useState(false)

  if (!lastReservation) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
        <div className="border-t border-border pt-8">
          <Ticket aria-hidden="true" className="size-6 text-muted-foreground" />
          <h1 className="text-section mt-4">{RAFFLE_CONTENT.payment.emptyTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {RAFFLE_CONTENT.payment.emptyDescription}
          </p>
          <Button asChild variant="brand" className="mt-6">
            <Link to="/">{RAFFLE_CONTENT.payment.back}</Link>
          </Button>
        </div>
      </main>
    )
  }

  const isPaid = lastReservation.status === 'paid'

  async function copyPixKey() {
    try {
      await navigator.clipboard.writeText(RAFFLE.pixKey)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <section className="border-t border-border pt-6" aria-labelledby="payment-title">
          <p className="text-eyebrow text-blue-600">{RAFFLE_CONTENT.payment.pixTitle}</p>
          <h1 id="payment-title" className="text-section mt-2">
            {RAFFLE_CONTENT.payment.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {RAFFLE_CONTENT.payment.description}
          </p>

          <div className="mt-6 rounded-lg border border-border p-5 shadow-soft">
            <p className="text-eyebrow text-muted-foreground">{RAFFLE_CONTENT.payment.numbers}</p>
            <p className="mt-2 font-heading text-3xl leading-none tracking-tight tabular-nums">
              {lastReservation.numbers.map(padNumber).join(' · ')}
            </p>

            <div className="mt-5 flex items-end justify-between gap-4 border-t border-border pt-4">
              <div>
                <p className="text-eyebrow text-muted-foreground">{RAFFLE_CONTENT.payment.total}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {formatBRL(lastReservation.totalAmount)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span
                  aria-hidden="true"
                  className={
                    isPaid
                      ? 'size-1.5 rounded-full bg-green-600'
                      : 'size-1.5 rounded-full bg-blue-600'
                  }
                />
                {isPaid ? 'Pagamento confirmado' : RAFFLE_CONTENT.payment.status}
              </span>
            </div>

            <dl className="mt-5 grid gap-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{RAFFLE_CONTENT.form.name}</dt>
                <dd className="text-right font-medium">{lastReservation.customerName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{RAFFLE_CONTENT.form.phone}</dt>
                <dd className="text-right font-medium">{lastReservation.customerPhone}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="border-t border-border pt-6" aria-labelledby="pix-title">
          <h2 id="pix-title" className="text-lg font-semibold tracking-tight">
            {RAFFLE_CONTENT.payment.pixTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {RAFFLE_CONTENT.payment.deadline}
          </p>

          <div className="mt-4">
            <p className="text-eyebrow text-muted-foreground">
              {RAFFLE_CONTENT.payment.pixKeyLabel}
            </p>
            <code className="mt-2 block rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm break-all">
              {RAFFLE.pixKey}
            </code>
            <p className="mt-1 text-xs text-muted-foreground">{RAFFLE.pixHolder}</p>
            <Button type="button" variant="outline" className="mt-3 w-full" onClick={copyPixKey}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? RAFFLE_CONTENT.payment.copied : RAFFLE_CONTENT.payment.copy}
            </Button>
          </div>

          <ol className="mt-6 grid gap-2 text-sm text-muted-foreground">
            {RAFFLE_CONTENT.payment.steps.map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="font-medium text-foreground">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <Button asChild variant="ghost" className="mt-6">
            <Link to="/">{RAFFLE_CONTENT.payment.back}</Link>
          </Button>
        </section>
      </div>
    </main>
  )
}
