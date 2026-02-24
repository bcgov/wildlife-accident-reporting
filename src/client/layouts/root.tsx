import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/sonner'

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="h-screen bg-background">
      {children}
      <Toaster />
    </div>
  )
}
