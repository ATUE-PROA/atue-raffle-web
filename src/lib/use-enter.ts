import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)'

/**
 * Entrada em cascata dos elementos marcados com `data-enter` dentro do container.
 * Só transform/opacity, desligada em prefers-reduced-motion, com safety para
 * nunca deixar conteúdo invisível.
 */
export function useEnter(ref: RefObject<HTMLElement | null>, stagger = 0.07) {
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) return

    const targets = Array.from(node.querySelectorAll<HTMLElement>('[data-enter]'))
    if (targets.length === 0) return

    const media = gsap.matchMedia()

    media.add(MOTION_QUERY, () => {
      gsap.from(targets, {
        y: 18,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.out',
        stagger,
        scrollTrigger: { trigger: node, start: 'top 92%', once: true },
      })
    })

    const safety = window.setTimeout(() => {
      gsap.set(targets, { opacity: 1, y: 0 })
    }, 1600)

    return () => {
      window.clearTimeout(safety)
      media.revert()
    }
  }, [ref, stagger])
}
