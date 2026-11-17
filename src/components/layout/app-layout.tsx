import { Outlet } from 'react-router-dom'

import { InAppBrowserNotice } from '@/components/layout/in-app-browser-notice'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

export function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <InAppBrowserNotice />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
