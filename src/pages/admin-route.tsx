import { lazy } from 'react'

// O painel carrega Recharts; manter fora do bundle inicial.
export const AdminRoute = lazy(async () => {
  const module = await import('@/pages/admin-page')
  return { default: module.AdminPage }
})
