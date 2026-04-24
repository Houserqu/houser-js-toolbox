import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import Home from '@/pages/Home'
import SqlToGorm from '@/pages/SqlToGorm'
import RandomString from '@/pages/RandomString'
import TypeConverter from '@/pages/TypeConverter'

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
        {
          path: 'random-string',
          element: <RandomString />,
        },
        {
          path: 'type-converter',
          element: <TypeConverter />,
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)

export default router
