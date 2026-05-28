import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { subscribeStickers } from '../services/stickersService'
import { ALBUM_GROUPS } from '../services/stickersData'
import styles from '../styles/Trade.module.css'

const STICKERS_PER_TEAM = 20

function getKey(prefix, i, zeroPad) {
  const num = zeroPad ? String(i).padStart(2, '0') : i
  return `${prefix}${num}`
}

export default function TradePage() {
  const { user } = useAuth()
  const [stickers, setStickers] = useState({})
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeStickers(user.uid, setStickers)
  }, [user])

  const repeated = []
  const missing = []

  ALBUM_GROUPS.forEach((group) => {
    group.teams.forEach((team) => {
      const range = group.customRange?.[team.prefix]
      const start = range?.start ?? 1
      const end = range?.end ?? STICKERS_PER_TEAM
      const zeroPad = range?.zeroPad ?? false
      for (let i = start; i <= end; i++) {
        const key = getKey(team.prefix, i, zeroPad)
        const count = stickers[key] || 0
        if (count >= 2) repeated.push({ key, group: group.name, extras: count - 1 })
        if (count === 0) missing.push({ key, group: group.name })
      }
    })
  })

  const totalRepeatedCount = repeated.reduce((acc, s) => acc + s.extras, 0)

  function copyToClipboard() {
    const repeatedList = repeated.map((s) => s.extras > 1 ? `${s.key}(×${s.extras})` : s.key).join(', ')
    const missingList = missing.map((s) => s.key).join(', ')
    const text = `⚽ Copa 2026\n\nRepetidas (${totalRepeatedCount}): ${repeatedList || 'nenhuma'}\n\nFaltam (${missing.length}): ${missingList || 'nenhuma'}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div className={styles.info}>
          <strong>{totalRepeatedCount}</strong> repetidas · <strong>{missing.length}</strong> faltando
        </div>
        <button className={styles.copyBtn} onClick={copyToClipboard}>
          {copied ? '✓ Copiado!' : 'Copiar lista'}
        </button>
      </div>
      <Section title={`Repetidas (${totalRepeatedCount})`} items={repeated} color="amber" showExtras />
      <Section title={`Faltando (${missing.length})`} items={missing} color="red" />
    </div>
  )
}

function Section({ title, items, color, showExtras }) {
  if (items.length === 0) return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <p className={styles.empty}>Nenhuma figurinha aqui</p>
    </div>
  )
  const byGroup = {}
  items.forEach(({ key, group, extras }) => {
    if (!byGroup[group]) byGroup[group] = []
    byGroup[group].push({ key, extras })
  })
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {Object.entries(byGroup).map(([group, keys]) => (
        <div key={group} className={styles.groupBlock}>
          <span className={styles.groupName}>{group}</span>
          <div className={styles.pills}>
            {keys.map(({ key, extras }) => (
              <span key={key} className={`${styles.pill} ${styles[color]}`}>
                {key}{showExtras && extras > 1 ? ` ×${extras}` : ''}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
