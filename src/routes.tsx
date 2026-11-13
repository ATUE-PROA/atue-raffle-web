import { Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/app-layout'
import { AdminRoute } from '@/pages/admin-route'
import { HomePage } from '@/pages/home-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { PaymentPage } from '@/pages/payment-page'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pagamento', element: <PaymentPage /> },
      {
        path: 'admin',
        element: (
          <Suspense
            fallback={
              <main className="mx-auto w-full max-w-6xl px-4 py-16 text-sm text-muted-foreground sm:px-6">
                Carregando painel…
              </main>
            }
          >
            <AdminRoute />
          </Suspense>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
