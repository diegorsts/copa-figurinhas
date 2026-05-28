import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from '../styles/Auth.module.css'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.9z"/>
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19.1 12 24 12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.4 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4-4.2 5.2l.1-.1 6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.7-.4-3.9z"/>
  </svg>
)

export default function LoginPage() {
  const { loginWithEmail, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleEmail(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(email, password)
      navigate('/album')
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    try {
      await loginWithGoogle()
      navigate('/album')
    } catch {
      setError('Falha ao entrar com Google.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.hero}>⚽</div>
        <h1 className={styles.title}>Copa 2026</h1>
        <p className={styles.sub}>Controle seu álbum de figurinhas</p>

        <form onSubmit={handleEmail} className={styles.form}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.btnPrimary}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <div className={styles.divider}><span>ou</span></div>

        <button onClick={handleGoogle} className={styles.btnGoogle}>
          <GoogleIcon /> Entrar com Google
        </button>

        <p className={styles.footer}>
          Não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
