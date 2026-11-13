import { RAFFLE_CONTENT } from '@/content/raffle'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>{RAFFLE_CONTENT.brand}</p>
        <p>{RAFFLE_CONTENT.footerNote}</p>
      </div>
    </footer>
  )
}
