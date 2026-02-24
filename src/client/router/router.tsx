import { createBrowserRouter, Outlet } from 'react-router-dom'
import { MainContent } from '@/components/main-content'
import { AppLayout } from '@/layouts/app'
import RootLayout from '@/layouts/root'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RootLayout>
        <Outlet />
      </RootLayout>
    ),
    children: [
      {
        index: true,
        element: (
          <AppLayout>
            <MainContent />
          </AppLayout>
        ),
      },
      {
        path: '*',
        element: (
          <div className="flex h-full items-center justify-center p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="mt-2 text-muted-foreground">Page not found</p>
            </div>
          </div>
        ),
      },
    ],
  },
])
