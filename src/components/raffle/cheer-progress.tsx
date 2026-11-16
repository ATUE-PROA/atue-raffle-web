import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

import { Progress } from '@/components/ui/progress'

interface CheerProgressProps {
  value: number
  label: string
}

export function CheerProgress({ value, label }: CheerProgressProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const sheenRef = useRef<HTMLDivElement>(null)
  const previousRef = useRef(0)

  useLayoutEffect(() => {
    const indicator = rootRef.current?.querySelector<HTMLElement>(
      '[data-slot="progress-indicator"]',
    )
    const sheen = sheenRef.current
    if (!indicator || !sheen) return

    gsap.killTweensOf([indicator, sheen])
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      gsap.set(indicator, { width: `${value}%` })
      gsap.set(sheen, { autoAlpha: 0 })
    } else if (value === 0) {
      // Sem números pagos: brilho percorre a barra em loop.
      gsap.set(indicator, { width: 0 })
      gsap.set(sheen, { autoAlpha: 1 })
      gsap.fromTo(
        sheen,
        { xPercent: -120 },
        { xPercent: 320, duration: 1.6, ease: 'none', repeat: -1 },
      )
    } else {
      gsap.set(sheen, { autoAlpha: 0 })
      gsap.fromTo(
        indicator,
        { width: `${previousRef.current}%` },
        { width: `${value}%`, duration: 0.9, ease: 'power2.out' },
      )
    }

    previousRef.current = value

    return () => {
      gsap.killTweensOf([indicator, sheen])
    }
  }, [value])

  return (
    <Progress ref={rootRef} value={value} aria-label={label} className="mt-2 h-2.5">
      <div
        ref={sheenRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-blue-600/0 via-blue-600/70 to-blue-600/0"
      />
    </Progress>
  )
}
