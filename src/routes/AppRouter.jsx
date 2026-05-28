import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import AlbumPage from '../pages/AlbumPage'
import StatsPage from '../pages/StatsPage'
import TradePage from '../pages/TradePage'
import Layout from '../components/Layout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/album" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'album',
        element: <AlbumPage />,
      },
      {
        path: 'stats',
        element: <StatsPage />,
      },
      {
        path: 'trade',
        element: <TradePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/album" replace />,
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
