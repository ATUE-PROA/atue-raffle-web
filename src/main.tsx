import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { RaffleProvider } from '@/contexts/raffle-provider'
import { router } from '@/routes'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemento #root não encontrado em index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    <RaffleProvider>
      <RouterProvider router={router} />
    </RaffleProvider>
  </StrictMode>,
)
