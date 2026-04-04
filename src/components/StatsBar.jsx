import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const Icons = {
  total: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  executed: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6M12 22v-4M4.93 4.93l4.24 4.24M19.07 19.07l-2.83-2.83M2 12h6M22 12h-4M4.93 19.07l4.24-4.24M19.07 4.93l-2.83 2.83"/>
    </svg>
  ),
  rehabilitated: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  regions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/>
      <line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  ),
}

const COLORS = {
  total:         '#3b9edb',
  executed:      '#e05c5c',
  rehabilitated: '#4caf82',
  regions:       '#c9a84c',
}

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
    { key: 'total',         label: t('stats.total') },
    { key: 'executed',      label: t('stats.executed') },
    { key: 'rehabilitated', label: t('stats.rehabilitated') },
    { key: 'regions',       label: t('stats.regions') },
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 10,
      margin: '0 0 20px',
    }}>
      {items.map(({ key, label }) => (
        <div key={key} style={{
          background: '#fff',
          border: '1px solid #e8eef4',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <span style={{ color: COLORS[key], opacity: 0.85 }}>{Icons[key]}</span>
          <span style={{
            fontSize: 26, fontWeight: 700,
            fontFamily: '"Playfair Display", serif',
            color: COLORS[key], lineHeight: 1,
          }}>
            {stats?.[key] != null
              ? stats[key].toLocaleString()
              : <span style={{ fontSize: 18, opacity: 0.25 }}>—</span>
            }
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            color: '#94a3b8',
          }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}