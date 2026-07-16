import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { DesignPage } from '@/pages/DesignPage'
import { HomePage } from '@/pages/HomePage'

export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'design', element: <DesignPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
