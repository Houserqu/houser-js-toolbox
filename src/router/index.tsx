import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/Home'
import SqlToGorm from '@/pages/SqlToGorm'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          index: true,
          element: <Home />,
        },
        {
          path: 'sql-to-gorm',
          element: <SqlToGorm />,
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)

export default router
