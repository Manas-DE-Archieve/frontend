import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { personsApi } from '../api'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

const Field = ({ label, value }) =>
  value ? (
    <div>
      <dt style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 3 }}>
        {label}
      </dt>
      <dd style={{ fontSize: 14, color: '#1a2332', margin: 0 }}>{value}</dd>
    </div>
  ) : null

const STATUS_CONFIG = {
  verified: { bg: '#edfaf4', color: '#1a7f55', border: '#c0ebd5', dot: '#22c55e' },
  pending:  { bg: '#fffbeb', color: '#92600a', border: '#fde8a0', dot: '#f59e0b' },
  rejected: { bg: '#fff1f2', color: '#9f1239', border: '#fecdd3', dot: '#ef4444' },
}

export default function PersonModal({ personId, onClose }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    personsApi.get(personId)
      .then(({ data }) => setPerson(data))
      .catch(() => setPerson(null))
      .finally(() => setLoading(false))
  }, [personId])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const isModerator = user && ['moderator', 'super_admin'].includes(user.role)

  const handleSetStatus = async (newStatus) => {
    try {
      await personsApi.setStatus(personId, newStatus)
      setPerson(prev => ({ ...prev, status: newStatus }))
    } catch {
      alert(t('person.statusError'))
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('person.deleteConfirm'))) return
    try {
      await personsApi.delete(personId)
      onClose()
    } catch {
      alert(t('person.deleteError'))
    }
  }

  const sc = person ? (STATUS_CONFIG[person.status] || STATUS_CONFIG.pending) : null
  const years = person ? [person.birth_year, person.death_year].filter(Boolean).join('–') : ''

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(10, 25, 45, 0.55)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 600,
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.2s ease',
      }}>

        {/* Header */}
        <div style={{
          padding: '22px 24px 18px',
          borderBottom: '1px solid #f0f4f8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          flexShrink: 0,
        }}>
          {loading ? (
            <div style={{ height: 24, width: 200, borderRadius: 8, background: '#eef2f7' }} />
          ) : person ? (
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: 20, fontWeight: 700,
                color: '#1a2332', margin: '0 0 6px',
              }}>
                {person.full_name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {years && <span style={{ fontSize: 13, color: '#7d95ab' }}>{years}</span>}
                {person.region && <span style={{ fontSize: 13, color: '#7d95ab' }}>· {person.region}</span>}
                {sc && (
                  <span style={{
                    padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                    {t(`status.${person.status}`)}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: 14 }}>{t('person.notFoundRecord')}</p>
          )}

          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none',
              background: '#f0f4f8', color: '#7d95ab',
              cursor: 'pointer', fontSize: 16, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '20px 24px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 40, borderRadius: 8, background: '#eef2f7' }} />
              ))}
            </div>
          ) : person ? (
            <>
              <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px' }}>
                <Field label={t('person.occupation')}          value={person.occupation} />
                <Field label={t('person.charge')}              value={person.charge} />
                <Field label={t('person.arrestDate')}          value={person.arrest_date} />
                <Field label={t('person.sentence')}            value={person.sentence} />
                <Field label={t('person.sentenceDate')}        value={person.sentence_date} />
                <Field label={t('person.rehabilitationDate')}  value={person.rehabilitation_date} />
                <Field label={t('person.district')}            value={person.district} />
                <Field label={t('person.source')}              value={person.source} />
              </dl>

              {person.biography && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f0f4f8' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 8 }}>
                    {t('person.biography')}
                  </p>
                  <p style={{ fontSize: 14, color: '#334155', lineHeight: 1.75, whiteSpace: 'pre-wrap', fontFamily: '"Playfair Display", serif' }}>
                    {person.biography}
                  </p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        {!loading && person && (
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid #f0f4f8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
            background: '#fafbfc',
          }}>
            <Link
              to={`/persons/${person.id}`}
              style={{
                fontSize: 12, color: '#3b9edb', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              ↗ {t('person.personalFile')}
            </Link>

            {isModerator && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleSetStatus('verified')}
                  disabled={person.status === 'verified'}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: '1px solid #c0ebd5',
                    background: '#edfaf4', color: '#1a7f55', fontSize: 12, fontWeight: 600,
                    cursor: person.status === 'verified' ? 'not-allowed' : 'pointer',
                    opacity: person.status === 'verified' ? 0.5 : 1,
                  }}
                >
                  ✓ {t('admin.verify')}
                </button>
                <button
                  onClick={() => handleSetStatus('rejected')}
                  disabled={person.status === 'rejected'}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: '1px solid #fde8a0',
                    background: '#fffbeb', color: '#92600a', fontSize: 12, fontWeight: 600,
                    cursor: person.status === 'rejected' ? 'not-allowed' : 'pointer',
                    opacity: person.status === 'rejected' ? 0.5 : 1,
                  }}
                >
                  ✗ {t('admin.reject')}
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '5px 12px', borderRadius: 8, border: '1px solid #fecdd3',
                    background: '#fff1f2', color: '#9f1239', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  🗑
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @media (max-width: 640px) {
          .person-modal-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}