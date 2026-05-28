import { AuthProvider } from './contexts/AuthContext'
import AppRouter from './routes/AppRouter'
import './styles/global.css'

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
