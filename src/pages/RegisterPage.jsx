import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from '../styles/Auth.module.css'

export default function RegisterPage() {
  const { registerWithEmail } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) return setError('Senha deve ter ao menos 6 caracteres.')
    setError('')
    setLoading(true)
    try {
      await registerWithEmail(name, email, password)
      navigate('/album')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Este e-mail já está cadastrado.')
      else setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.hero}>⚽</div>
        <h1 className={styles.title}>Criar conta</h1>
        <p className={styles.sub}>Seu álbum sincronizado em qualquer dispositivo</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
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
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.btnPrimary}>
            {loading ? 'Criando…' : 'Criar conta'}
          </button>
        </form>

        <p className={styles.footer}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
