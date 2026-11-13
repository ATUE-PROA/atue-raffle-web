import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from '@/components/layout/app-layout'
import { HomePage } from '@/pages/home-page'
import { NotFoundPage } from '@/pages/not-found-page'
import { PaymentPage } from '@/pages/payment-page'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pagamento', element: <PaymentPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
