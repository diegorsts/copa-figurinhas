import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscribeStickers, saveStickers } from '../services/stickersService'
import { ALBUM_GROUPS, isShiny, isTeamPhoto } from '../services/stickersData'
import styles from '../styles/Album.module.css'

const STICKERS_PER_TEAM = 20

function getColor(count) {
  if (count === 0) return ''
  if (count === 1) return styles.have
  if (count === 2) return styles.repeated1
  if (count === 3) return styles.repeated2
  return styles.repeated3
}

function getKey(prefix, i, zeroPad) {
  const num = zeroPad ? String(i).padStart(2, '0') : i
  return `${prefix}${num}`
}

function matchesFilter(count, filter, key) {
  if (filter === 'all') return true
  if (filter === 'have') return count >= 1
  if (filter === 'missing') return count === 0
  if (filter === 'repeated') return count >= 2
  if (filter === 'shiny') return isShiny(key) && count >= 1
  if (filter === 'teamphoto') return isTeamPhoto(key) && count >= 1
  if (filter === 'fwc') return key.startsWith('FWC') && count >= 1
  if (filter === 'cc') return key.startsWith('CC') && count >= 1
  return true
}

const FILTER_OPTIONS_ROW1 = [
  { key: 'all', label: 'Todas' },
  { key: 'have', label: 'Tenho' },
  { key: 'missing', label: 'Faltam' },
  { key: 'repeated', label: 'Repetidas' },
]

const FILTER_OPTIONS_ROW2 = [
  { key: 'shiny', label: '✨ Brilh.', cls: 'shinyBtn' },
  { key: 'teamphoto', label: '📸 Time', cls: 'photoBtn' },
  { key: 'fwc', label: '🏆 FWC', cls: 'fwcBtn' },
  { key: 'cc', label: '🥤 Coca-Cola', cls: 'ccBtn' },
]

export default function AlbumPage() {
  const { user } = useAuth()
  const [stickers, setStickers] = useState({})
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [statsCollapsed, setStatsCollapsed] = useState(false)
  const [activeDetail, setActiveDetail] = useState(null) // 'have' | null
  const pendingRef = useRef({})
  const saveTimerRef = useRef(null)

  useEffect(() => {
    if (!user) return
    return subscribeStickers(user.uid, setStickers)
  }, [user])

  const scheduleSave = useCallback((updated) => {
    pendingRef.current = updated
    clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveStickers(user.uid, pendingRef.current)
        .catch((err) => console.error('Erro ao salvar:', err.code, err.message))
    }, 800)
  }, [user])

  function increment(key) {
    setStickers((prev) => {
      const updated = { ...prev, [key]: (prev[key] || 0) + 1 }
      scheduleSave(updated)
      return updated
    })
  }

  function decrement(key) {
    setStickers((prev) => {
      const cur = prev[key] || 0
      if (cur === 0) return prev
      const updated = { ...prev, [key]: cur - 1 }
      scheduleSave(updated)
      return updated
    })
  }

  let totalAll = 0, totalHave = 0, totalRepeated = 0
  let totalShiny = 0, totalShinyAll = 0
  let totalPhoto = 0, totalPhotoAll = 0
  let totalFWC = 0, totalFWCAll = 0
  let totalCC = 0, totalCCAll = 0
  let album1 = 0, album2 = 0, album3 = 0, totalTrade = 0
  let rep1 = 0, rep2 = 0, rep3plus = 0

  ALBUM_GROUPS.forEach((group) => {
    group.teams.forEach((team) => {
      const range = group.customRange?.[team.prefix]
      const start = range?.start ?? 1
      const end = range?.end ?? STICKERS_PER_TEAM
      const zeroPad = range?.zeroPad ?? false
      for (let i = start; i <= end; i++) {
        const key = getKey(team.prefix, i, zeroPad)
        const count = stickers[key] || 0
        totalAll++
        if (count >= 1) { totalHave++; album1++ }
        if (count >= 2) album2++
        if (count >= 3) album3++
        if (count > 3) totalTrade += count - 3
        totalRepeated += Math.max(0, count - 1)
        if (count === 2) rep1++
        if (count === 3) rep2++
        if (count >= 4) rep3plus++
        if (isShiny(key)) { totalShinyAll++; if (count >= 1) totalShiny++ }
        if (isTeamPhoto(key)) { totalPhotoAll++; if (count >= 1) totalPhoto++ }
        if (key.startsWith('FWC')) { totalFWCAll++; if (count >= 1) totalFWC++ }
        if (key.startsWith('CC')) { totalCCAll++; if (count >= 1) totalCC++ }
      }
    })
  })

  const totalMissing = totalAll - totalHave
  const pct = Math.round((totalHave / totalAll) * 100)

  const controls = (
    <>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.progressLabel}>
        <span>{totalHave} de {totalAll} · {pct}%</span>
        <button
          className={styles.collapseBtn}
          onClick={() => setStatsCollapsed((v) => !v)}
          aria-label={statsCollapsed ? 'Expandir estatísticas' : 'Recolher estatísticas'}
        >
          {statsCollapsed ? '▼' : '▲'}
        </button>
      </div>
      {!statsCollapsed && activeDetail === null && <div className={styles.statsRow1}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{totalAll}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div
          className={`${styles.statCard} ${styles.statCardClickable}`}
          onClick={() => setActiveDetail('have')}
        >
          <span className={styles.statNum} style={{ color: 'var(--green)' }}>{totalHave}</span>
          <span className={styles.statLabel}>Tenho</span>
        </div>
        <div
          className={`${styles.statCard} ${styles.statCardClickable}`}
          onClick={() => setActiveDetail('repeated')}
        >
          <span className={styles.statNum} style={{ color: '#e6a000' }}>{totalRepeated}</span>
          <span className={styles.statLabel}>Repetidas</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#d44' }}>{totalMissing}</span>
          <span className={styles.statLabel}>Faltam</span>
        </div>
      </div>}

      {!statsCollapsed && activeDetail === 'repeated' && (
        <div className={styles.detailPanel}>
          <button className={styles.collapseBtn} style={{ position: 'static', marginBottom: '6px' }} onClick={() => setActiveDetail(null)}>← Voltar</button>
          <div className={styles.detailGrid3}>
            <div className={styles.detailCard} style={{ borderColor: '#64b5f6', background: '#e3f2fd' }}>
              <span className={styles.detailDot} style={{ background: '#64b5f6' }} />
              <span className={styles.detailNum} style={{ color: '#0d47a1' }}>{rep1}</span>
              <span className={styles.detailLabel}>1 repetida</span>
            </div>
            <div className={styles.detailCard} style={{ borderColor: '#ffc107', background: '#fff8e1' }}>
              <span className={styles.detailDot} style={{ background: '#ffc107' }} />
              <span className={styles.detailNum} style={{ color: '#6d4c00' }}>{rep2}</span>
              <span className={styles.detailLabel}>2 repetidas</span>
            </div>
            <div className={styles.detailCard} style={{ borderColor: '#e53935', background: '#fce8e8' }}>
              <span className={styles.detailDot} style={{ background: '#e53935' }} />
              <span className={styles.detailNum} style={{ color: '#7f0000' }}>{rep3plus}</span>
              <span className={styles.detailLabel}>3+ repetidas</span>
            </div>
          </div>
          <div className={styles.detailGrid3} style={{ marginTop: '6px' }}>
            <div className={styles.detailCard} style={{ borderColor: '#64b5f6', background: '#e3f2fd' }}>
              <span className={styles.detailDot} style={{ background: '#64b5f6' }} />
              <span className={styles.detailNum} style={{ color: '#0d47a1' }}>{album2}</span>
              <span className={styles.detailLabel}>2º Album</span>
            </div>
            <div className={styles.detailCard} style={{ borderColor: '#ffc107', background: '#fff8e1' }}>
              <span className={styles.detailDot} style={{ background: '#ffc107' }} />
              <span className={styles.detailNum} style={{ color: '#6d4c00' }}>{album3}</span>
              <span className={styles.detailLabel}>3º Album</span>
            </div>
            <div className={styles.detailCard} style={{ borderColor: '#e53935', background: '#fce8e8' }}>
              <span className={styles.detailDot} style={{ background: '#e53935' }} />
              <span className={styles.detailNum} style={{ color: '#7f0000' }}>{totalTrade}</span>
              <span className={styles.detailLabel}>Para troca</span>
            </div>
          </div>
        </div>
      )}

      {!statsCollapsed && activeDetail === 'have' && (
        <div className={styles.detailPanel}>
          <button className={styles.collapseBtn} style={{ position: 'static', marginBottom: '6px' }} onClick={() => setActiveDetail(null)}>← Voltar</button>
          <div className={styles.detailGrid}>
            <div className={styles.detailCard} style={{ borderColor: '#8bc34a', background: '#e8f5e2' }}>
              <span className={styles.detailDot} style={{ background: '#8bc34a' }} />
              <span className={styles.detailNum} style={{ color: '#33691e' }}>{album1}</span>
              <span className={styles.detailLabel}>1º Album</span>
            </div>
            <div className={styles.detailCard} style={{ borderColor: '#64b5f6', background: '#e3f2fd' }}>
              <span className={styles.detailDot} style={{ background: '#64b5f6' }} />
              <span className={styles.detailNum} style={{ color: '#0d47a1' }}>{album2}</span>
              <span className={styles.detailLabel}>2º Album</span>
            </div>
            <div className={styles.detailCard} style={{ borderColor: '#ffc107', background: '#fff8e1' }}>
              <span className={styles.detailDot} style={{ background: '#ffc107' }} />
              <span className={styles.detailNum} style={{ color: '#6d4c00' }}>{album3}</span>
              <span className={styles.detailLabel}>3º Album</span>
            </div>
            <div className={styles.detailCard} style={{ borderColor: '#e53935', background: '#fce8e8' }}>
              <span className={styles.detailDot} style={{ background: '#e53935' }} />
              <span className={styles.detailNum} style={{ color: '#7f0000' }}>{totalTrade}</span>
              <span className={styles.detailLabel}>Para troca</span>
            </div>
          </div>
        </div>
      )}
      {!statsCollapsed && activeDetail === null && <div className={styles.statsRow2}>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#a855f7' }}>
            {totalShiny}<span className={styles.statTotal}>/{totalShinyAll}</span>
          </span>
          <span className={styles.statLabel}>✨ Brilh.</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#0ea5e9' }}>
            {totalPhoto}<span className={styles.statTotal}>/{totalPhotoAll}</span>
          </span>
          <span className={styles.statLabel}>📸 Time</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#f59e0b' }}>
            {totalFWC}<span className={styles.statTotal}>/{totalFWCAll}</span>
          </span>
          <span className={styles.statLabel}>🏆 FWC</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum} style={{ color: '#ef4444' }}>
            {totalCC}<span className={styles.statTotal}>/{totalCCAll}</span>
          </span>
          <span className={styles.statLabel}>🥤 CC</span>
        </div>
      </div>}
      <div className={styles.searchRow}>
        <input
          className={styles.search}
          type="text"
          placeholder="Buscar (ex: BRA1, FWC00…)"
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
        />
      </div>
      <div className={styles.filterRow}>
        {FILTER_OPTIONS_ROW1.map((f) => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className={styles.filterRow}>
        {FILTER_OPTIONS_ROW2.map((f) => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${styles[f.cls]} ${filter === f.key ? styles.active : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
    </>
  )

  const slot = document.getElementById('album-sticky-slot')

  return (
    <>
      {slot && createPortal(controls, slot)}
      <div className={styles.groups}>
        {ALBUM_GROUPS.map((group) => {
          const groupHasItems = group.teams.some((team) => {
            const range = group.customRange?.[team.prefix]
            const start = range?.start ?? 1
            const end = range?.end ?? STICKERS_PER_TEAM
            const zeroPad = range?.zeroPad ?? false
            for (let i = start; i <= end; i++) {
              const key = getKey(team.prefix, i, zeroPad)
              const count = stickers[key] || 0
              if (matchesFilter(count, filter, key) && (!search || key.includes(search))) return true
            }
            return false
          })
          if (!groupHasItems) return null

          return (
            <div key={group.name} className={styles.group}>
              <h2 className={styles.groupTitle}>{group.name}</h2>
              {group.teams.map((team) => {
                const range = group.customRange?.[team.prefix]
                const start = range?.start ?? 1
                const end = range?.end ?? STICKERS_PER_TEAM
                const zeroPad = range?.zeroPad ?? false
                const items = []
                for (let i = start; i <= end; i++) {
                  const key = getKey(team.prefix, i, zeroPad)
                  const count = stickers[key] || 0
                  if (!matchesFilter(count, filter, key)) continue
                  if (search && !key.includes(search)) continue
                  items.push({ key, count })
                }
                if (items.length === 0) return null
                // Calcula contadores do time
                let teamHave = 0, teamMissing = 0, teamRepeated = 0
                for (let i = start; i <= end; i++) {
                  const k = getKey(team.prefix, i, zeroPad)
                  const c = stickers[k] || 0
                  if (c >= 1) teamHave++
                  else teamMissing++
                  teamRepeated += Math.max(0, c - 1)
                }

                return (
                  <div key={team.prefix} className={styles.teamBlock}>
                    <div className={styles.teamName}>
                      <span className={styles.teamPrefix}>{team.prefix}</span>
                      <span className={styles.teamFullName}>{team.name}</span>
                      <div className={styles.teamCounters}>
                        <span className={styles.tcHave}>{teamHave}</span>
                        <span className={styles.tcMissing}>{teamMissing}</span>
                        {teamRepeated > 0 && <span className={styles.tcRepeated}>{teamRepeated}</span>}
                      </div>
                    </div>
                    <div className={styles.grid}>
                      {items.map(({ key, count }) => (
                        <StickerCell
                          key={key}
                          label={key}
                          count={count}
                          shiny={isShiny(key)}
                          teamPhoto={isTeamPhoto(key)}
                          onIncrement={() => increment(key)}
                          onDecrement={() => decrement(key)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </>
  )
}

function StickerCell({ label, count, shiny, teamPhoto, onIncrement, onDecrement }) {
  const extras = count - 1
  return (
    <div className={`${styles.sticker} ${getColor(count)} ${shiny ? styles.shiny : ''} ${teamPhoto ? styles.teamPhoto : ''}`}>
      <div className={styles.stickerMain} onClick={onIncrement}>
        {shiny && <span className={styles.stickerIcon}>✨</span>}
        {teamPhoto && <span className={styles.stickerIcon}>📸</span>}
        <span className={styles.stickerLabel}>{label}</span>
        {count >= 2 && <span className={styles.counter}>+{extras}</span>}
      </div>
      {count >= 1 && (
        <button
          className={styles.removeBtn}
          onClick={(e) => { e.stopPropagation(); onDecrement() }}
          aria-label="Remover"
        >×</button>
      )}
    </div>
  )
}
