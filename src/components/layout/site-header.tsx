import { Link } from 'react-router-dom'

import { ThemeToggle } from '@/components/layout/theme-toggle'

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          aria-label="ATUE — início"
          className="inline-flex items-center rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600/60 focus-visible:outline-none"
        >
          <img
            src="/atue-logo.svg"
            alt=""
            width={3801}
            height={1418}
            className="h-8 w-auto dark:hidden"
          />
          <img
            src="/atue-logo-dark.svg"
            alt=""
            width={3801}
            height={1418}
            className="hidden h-8 w-auto dark:block"
          />
        </Link>

        <ThemeToggle />
      </div>
    </header>
  )
}
