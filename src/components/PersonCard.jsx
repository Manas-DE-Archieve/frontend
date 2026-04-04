import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const STATUS_CONFIG = {
  verified: { bg: '#edfaf4', color: '#1a7f55', border: '#c0ebd5', label: 'verified', dot: '#22c55e' },
  pending:  { bg: '#fffbeb', color: '#92600a', border: '#fde8a0', label: 'pending',  dot: '#f59e0b' },
  rejected: { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3', label: 'rejected', dot: '#ef4444' },
}

const CalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const BriefcaseIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
)
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

export default function PersonCard({ person }) {
  const { t } = useTranslation()
  const years = [person.birth_year, person.death_year].filter(Boolean).join('–')
  const sc = STATUS_CONFIG[person.status] || STATUS_CONFIG.pending

  return (
    <Link
      to={`/persons/${person.id}`}
      className="animate-fade-in"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <div
        className="card-hover"
        style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}
      >
        {/* Avatar placeholder */}
        <div style={{
          width: 46, height: 46, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, #e8f4fd, #d0e8f8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, border: '1px solid #c8dff0',
        }}>
          🧑‍💼
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <h3 style={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
              fontSize: 15,
              color: '#1a2332',
              margin: 0,
              lineHeight: 1.4,
            }}>
              {person.full_name}
            </h3>
            <div style={{
              padding: '3px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
              background: sc.bg,
              color: sc.color,
              border: `1px solid ${sc.border}`,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
              {t(`status.${person.status}`)}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: '#7d95ab' }}>
            {years && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CalIcon />{years}
              </span>
            )}
            {person.region && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <PinIcon />{person.region}
              </span>
            )}
            {person.occupation && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <BriefcaseIcon />{person.occupation}
              </span>
            )}
          </div>

          {person.charge && (
            <p style={{
              marginTop: 6, fontSize: 12, color: '#7d95ab',
              overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
            }}>
              <span style={{ fontWeight: 600, color: '#5a7590' }}>{t('facts.chargeLabel')} </span>
              {person.charge}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div style={{ color: '#c5d5e5', flexShrink: 0, transition: 'all 0.2s' }}>
          <ArrowIcon />
        </div>
      </div>
    </Link>
  )
}