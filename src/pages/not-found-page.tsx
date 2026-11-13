import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <div className="border-t border-border pt-8">
        <p className="text-eyebrow text-muted-foreground">404</p>
        <h1 className="text-section mt-2">Página não encontrada</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço acessado não existe nesta aplicação.
        </p>
        <Button asChild variant="brand" className="mt-6">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </main>
  )
}
