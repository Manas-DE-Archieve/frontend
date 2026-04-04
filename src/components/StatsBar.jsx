import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function StatsBar() {
  const { t } = useTranslation()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/api/persons/stats/summary`)
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const items = [
    { emoji: '👥', color: '#3b9edb', label: t('stats.total'),         value: stats?.total },
    { emoji: '🕯️', color: '#e05c5c', label: t('stats.executed'),      value: stats?.executed },
    { emoji: '⚖️', color: '#4caf82', label: t('stats.rehabilitated'), value: stats?.rehabilitated },
    { emoji: '🗺️', color: '#c9a84c', label: t('stats.regions'),       value: stats?.regions },
  ]

  return (
    <div className="stats-bar">
      {items.map(({ emoji, color, label, value }) => (
        <div key={label} className="stat-item">
          <span className="stat-emoji">{emoji}</span>
          <span className="stat-value" style={{ color }}>
            {value != null ? value.toLocaleString() : <span style={{ opacity: 0.3 }}>—</span>}
          </span>
          <span className="stat-label">{label}</span>
        </div>
      ))}
    </div>
  )
}