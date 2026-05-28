import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from '../styles/Layout.module.css'

const BookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const ChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
const SwapIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)
const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isAlbum = location.pathname === '/album'

  return (
    <div className={styles.shell}>
      <header className={`${styles.header} ${isAlbum ? styles.headerAlbum : ''}`}>
        <div className={styles.headerTop}>
          <span className={styles.logo}>⚽ Copa 2026</span>
          <button className={styles.logoutBtn} onClick={logout} title="Sair">
            <LogoutIcon />
            <span>{user?.displayName?.split(' ')[0] ?? 'Sair'}</span>
          </button>
        </div>
        {isAlbum && (
          <div id="album-sticky-slot" className={styles.stickySlot} />
        )}
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.bottomNav}>
        <NavLink to="/album" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <BookIcon /><span>Álbum</span>
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <ChartIcon /><span>Progresso</span>
        </NavLink>
        <NavLink to="/trade" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
          <SwapIcon /><span>Trocas</span>
        </NavLink>
      </nav>
    </div>
  )
}
