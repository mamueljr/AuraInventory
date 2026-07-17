import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { HomePage } from '@/pages/HomePage'
import { InventoryPage } from '@/pages/InventoryPage'

// Rutas secundarias con code splitting: no cargan hasta que se visitan.
const lazyPage = (loader: () => Promise<Record<string, React.ComponentType>>, name: string) => {
  return async () => ({ Component: (await loader())[name] })
}

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        {
          path: 'dashboard',
          lazy: lazyPage(() => import('@/pages/DashboardPage'), 'DashboardPage'),
        },
        { path: 'items', element: <InventoryPage /> },
        { path: 'items/new', lazy: lazyPage(() => import('@/pages/ItemFormPage'), 'ItemFormPage') },
        {
          path: 'items/:id',
          lazy: lazyPage(() => import('@/pages/ItemDetailPage'), 'ItemDetailPage'),
        },
        {
          path: 'items/:id/edit',
          lazy: lazyPage(() => import('@/pages/ItemFormPage'), 'ItemFormPage'),
        },
        { path: 'map', lazy: lazyPage(() => import('@/pages/MapPage'), 'MapPage') },
        {
          path: 'organize',
          lazy: lazyPage(() => import('@/pages/OrganizePage'), 'OrganizePage'),
        },
        {
          path: 'settings',
          lazy: lazyPage(() => import('@/pages/SettingsPage'), 'SettingsPage'),
        },
        { path: 'design', lazy: lazyPage(() => import('@/pages/DesignPage'), 'DesignPage') },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
