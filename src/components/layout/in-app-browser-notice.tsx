import { useState } from 'react'
import { Check, Copy, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { RAFFLE_CONTENT } from '@/content/raffle'
import { detectInAppBrowser, fillInAppBrowserCopy } from '@/lib/in-app-browser'

const DISMISS_KEY = 'rifa-inapp-browser-dismissed'

function wasDismissed() {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Webviews costumam negar a permissão da área de transferência.
  }

  try {
    const field = document.createElement('textarea')
    field.value = text
    field.readOnly = true
    field.style.position = 'fixed'
    field.style.top = '0'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    const copied = document.execCommand('copy')
    document.body.removeChild(field)
    return copied
  } catch {
    return false
  }
}

export function InAppBrowserNotice() {
  const [info] = useState(detectInAppBrowser)
  const [dismissed, setDismissed] = useState(wasDismissed)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  if (!info || dismissed) return null

  const copy = RAFFLE_CONTENT.inAppBrowser

  function dismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // Modo privado pode bloquear o sessionStorage; o aviso só não persiste.
    }
    setDismissed(true)
  }

  async function handleCopy() {
    const copied = await copyText(window.location.href)
    setCopyState(copied ? 'copied' : 'failed')
  }

  return (
    <section
      aria-labelledby="in-app-browser-title"
      className="border-b border-blue-600/25 bg-blue-600/10 dark:border-blue-400/30 dark:bg-blue-400/10"
    >
      <div className="mx-auto flex w-full max-w-6xl gap-3 px-4 py-4 sm:px-6">
        <TriangleAlert
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-blue-700 dark:text-blue-300"
        />
        <div className="min-w-0 flex-1">
          <p
            id="in-app-browser-title"
            className="text-sm font-semibold text-blue-900 dark:text-blue-100"
          >
            {fillInAppBrowserCopy(copy.bannerTitle, info)}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-blue-900/80 dark:text-blue-100/80">
            {fillInAppBrowserCopy(copy.bannerDescription, info)}
          </p>

          <ol className="mt-3 grid gap-1.5 text-sm text-blue-950 dark:text-blue-50">
            {copy.steps[info.platform].map((step, index) => (
              <li key={step} className="flex gap-2">
                <span aria-hidden="true" className="font-semibold">
                  {index + 1}.
                </span>
                <span>{fillInAppBrowserCopy(step, info)}</span>
              </li>
            ))}
          </ol>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="brand" onClick={() => void handleCopy()}>
              {copyState === 'copied' ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copyState === 'copied' ? copy.copied : copy.copy}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={dismiss}>
              {copy.dismiss}
            </Button>
          </div>

          {copyState === 'failed' ? (
            <div className="mt-2">
              <p className="text-xs text-blue-900/80 dark:text-blue-100/80">{copy.copyFallback}</p>
              <p className="mt-1 text-xs break-all text-blue-900 select-all dark:text-blue-100">
                {window.location.href}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
