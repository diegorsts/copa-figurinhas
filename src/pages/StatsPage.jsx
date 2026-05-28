import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { subscribeStickers } from '../services/stickersService'
import { ALBUM_GROUPS } from '../services/stickersData'
import styles from '../styles/Stats.module.css'

const STICKERS_PER_TEAM = 20

function getKey(prefix, i, zeroPad) {
  const num = zeroPad ? String(i).padStart(2, '0') : i
  return `${prefix}${num}`
}

export default function StatsPage() {
  const { user } = useAuth()
  const [stickers, setStickers] = useState({})

  useEffect(() => {
    if (!user) return
    return subscribeStickers(user.uid, setStickers)
  }, [user])

  let totalAll = 0, totalHave = 0, totalRepeated = 0

  const groupStats = ALBUM_GROUPS.map((group) => {
    let gAll = 0, gHave = 0
    group.teams.forEach((team) => {
      const range = group.customRange?.[team.prefix]
      const start = range?.start ?? 1
      const end = range?.end ?? STICKERS_PER_TEAM
      const zeroPad = range?.zeroPad ?? false
      for (let i = start; i <= end; i++) {
        const key = getKey(team.prefix, i, zeroPad)
        const count = stickers[key] || 0
        gAll++; totalAll++
        if (count >= 1) { gHave++; totalHave++ }
        totalRepeated += Math.max(0, count - 1)
      }
    })
    return { name: group.name, have: gHave, total: gAll, pct: Math.round((gHave / gAll) * 100) }
  })

  const totalMissing = totalAll - totalHave
  const pct = Math.round((totalHave / totalAll) * 100)

  return (
    <div className={styles.page}>
      <div className={styles.summary}>
        <div className={styles.bigRing}>
          <svg viewBox="0 0 100 100" className={styles.ring}>
            <circle cx="50" cy="50" r="40" className={styles.ringBg} />
            <circle cx="50" cy="50" r="40" className={styles.ringFill}
              strokeDasharray={`${(totalHave / totalAll) * 251.2} 251.2`}
              strokeDashoffset="62.8"
            />
          </svg>
          <div className={styles.ringLabel}>
            <span className={styles.ringPct}>{pct}%</span>
            <span className={styles.ringSub}>completo</span>
          </div>
        </div>
        <div className={styles.cards}>
          <div className={styles.card}>
            <span className={styles.cardNum}>{totalHave}</span>
            <span className={styles.cardLabel}>Tenho</span>
          </div>
          <div className={styles.card}>
            <span className={styles.cardNum} style={{ color: '#d44' }}>{totalMissing}</span>
            <span className={styles.cardLabel}>Faltam</span>
          </div>
          <div className={styles.card}>
            <span className={styles.cardNum} style={{ color: '#e6a000' }}>{totalRepeated}</span>
            <span className={styles.cardLabel}>Repetidas</span>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Por grupo</h2>
      <div className={styles.groupList}>
        {groupStats.map((g) => (
          <div key={g.name} className={styles.groupRow}>
            <div className={styles.groupInfo}>
              <span className={styles.groupName}>{g.name}</span>
              <span className={styles.groupCount}>{g.have}/{g.total}</span>
            </div>
            <div className={styles.bar}>
              <div className={`${styles.barFill} ${g.pct === 100 ? styles.done : ''}`}
                style={{ width: `${g.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
