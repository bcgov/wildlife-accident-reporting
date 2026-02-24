import type { ReactNode } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '18rem',
          '--header-height': '3rem',
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
