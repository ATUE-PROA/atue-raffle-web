import { useId, useState, type FormEvent } from 'react'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FormAlert } from '@/components/ui/form-alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RAFFLE_CONTENT } from '@/content/raffle'
import { useRaffle } from '@/contexts/raffle-provider'
import { calculateTotal, formatBRL, maskPhone, padNumber, phoneDigits } from '@/lib/raffle'

interface ReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  numbers: number[]
  onSuccess: () => void
}

export function ReservationDialog({
  open,
  onOpenChange,
  numbers,
  onSuccess,
}: ReservationDialogProps) {
  const { createReservation } = useRaffle()
  const [step, setStep] = useState<'form' | 'review'>('form')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [indication, setIndication] = useState('')
  const [error, setError] = useState<string | null>(null)

  const nameId = useId()
  const phoneId = useId()
  const indicationId = useId()
  const total = calculateTotal(numbers.length)
  const copy = RAFFLE_CONTENT.form

  function handleOpenChange(next: boolean) {
    if (!next) {
      setStep('form')
      setName('')
      setPhone('')
      setIndication('')
      setError(null)
    }
    onOpenChange(next)
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!name.trim()) {
      setError(copy.errors.name)
      return
    }
    if (phoneDigits(phone).length < 10) {
      setError(copy.errors.phone)
      return
    }
    setError(null)
    setStep('review')
  }

  function handleConfirm() {
    const result = createReservation({
      customerName: name,
      customerPhone: phone,
      indication,
      numbers,
    })

    if (!result.ok) {
      setError(result.error)
      setStep('form')
      return
    }

    handleOpenChange(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{step === 'form' ? copy.title : copy.reviewTitle}</DialogTitle>
          <DialogDescription>
            {step === 'form' ? copy.description : copy.reviewDescription}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <form className="grid gap-4" onSubmit={handleReview}>
            <div className="grid gap-2">
              <Label htmlFor={nameId}>{copy.name}</Label>
              <Input
                id={nameId}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={copy.namePlaceholder}
                autoComplete="name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={phoneId}>{copy.phone}</Label>
              <Input
                id={phoneId}
                value={phone}
                onChange={(event) => setPhone(maskPhone(event.target.value))}
                placeholder={copy.phonePlaceholder}
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={indicationId}>{copy.indication}</Label>
              <Input
                id={indicationId}
                value={indication}
                onChange={(event) => setIndication(event.target.value)}
                placeholder={copy.indicationPlaceholder}
              />
            </div>

            {numbers.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {numbers.length} bilhete(s) · {formatBRL(total)}
              </p>
            ) : null}

            {error ? (
              <FormAlert tone="error" title="Não foi possível continuar" description={error} />
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                {copy.cancel}
              </Button>
              <Button type="submit" variant="brand" disabled={numbers.length === 0}>
                {copy.submit}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid gap-4">
            <dl className="grid gap-3 rounded-lg border border-border p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">{copy.name}</dt>
                <dd className="text-right font-medium">{name}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">{copy.phone}</dt>
                <dd className="text-right font-medium">{phone}</dd>
              </div>
              {indication.trim() ? (
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">{copy.indication}</dt>
                  <dd className="text-right font-medium">{indication}</dd>
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">{copy.numbers}</dt>
                <dd className="max-w-[60%] text-right font-medium">
                  {numbers.map(padNumber).join(', ')}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-border pt-3">
                <dt className="text-muted-foreground">{copy.total}</dt>
                <dd className="text-right text-base font-semibold">{formatBRL(total)}</dd>
              </div>
            </dl>

            {error ? (
              <FormAlert tone="error" title="Não foi possível reservar" description={error} />
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('form')}>
                <ArrowLeft aria-hidden="true" />
                {copy.back}
              </Button>
              <Button type="button" variant="brand" onClick={handleConfirm}>
                {copy.submit}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
