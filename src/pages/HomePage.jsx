import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { personsApi } from '../api'
import PersonCard from '../components/PersonCard'
import SearchBar from '../components/SearchBar'
import MapVisualization from '../components/MapVisualization'
import Pagination from '../components/Pagination'
import FactsTab from '../components/FactsTab'
import StatsBar from '../components/StatsBar'

const PAGE_SIZE = 10

const PeopleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const BookIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

export default function HomePage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('people')
  const [persons, setPersons] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [params, setParams] = useState({})
  const [loading, setLoading] = useState(false)

  const load = useCallback(async (searchParams, p = 1) => {
    setLoading(true)
    try {
      const clean = Object.fromEntries(
        Object.entries(searchParams).filter(([, v]) => v !== '' && v != null)
      )
      const { data } = await personsApi.list({ ...clean, page: p, limit: PAGE_SIZE })
      setPersons(data.items)
      setTotal(data.total)
      setPage(p)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load({}, 1) }, [load])

  const handleSearch = (p) => { setParams(p); load(p, 1) }
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Hero */}
      <div style={{
        borderRadius: 24,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a3a5c 0%, #1e4d78 40%, #16639e 100%)',
        padding: '48px 48px',
        marginBottom: 32,
        position: 'relative',
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '40%', height: '100%',
          background: 'radial-gradient(ellipse at right, rgba(255,255,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }} />
        
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ height: 1, width: 32, background: 'rgba(255,255,255,0.3)' }} />
            <span style={{
              color: 'rgba(255,255,255,0.6)', fontSize: 11,
              fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
            }}>
              1918 — 1953
            </span>
            <div style={{ height: 1, width: 32, background: 'rgba(255,255,255,0.3)' }} />
          </div>

          <h1 style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: 42, fontWeight: 700,
            color: '#fff', margin: '0 0 12px',
            letterSpacing: 0.5, lineHeight: 1.2,
          }}>
            Архивдин Үнү
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.65)', fontSize: 15,
            maxWidth: 520, margin: '0 0 28px', lineHeight: 1.7,
          }}>
            {t('app.description')}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {total > 0 && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: 32, fontWeight: 700, color: '#fff', lineHeight: 1,
                }}>
                  {total.toLocaleString()}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                  {t('common.records')}
                </span>
              </div>
            )}
            <Link
              to="/chat"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', textDecoration: 'none',
                fontSize: 13, fontWeight: 600,
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <ChatIcon />
              {t('nav.chat')}
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'inline-flex', gap: 4,
        background: '#eef2f7', borderRadius: 12, padding: 4,
        marginBottom: 24,
      }}>
        {[
          { id: 'people', Icon: PeopleIcon, label: t('nav.home') },
          { id: 'facts',  Icon: BookIcon,   label: t('nav.history') },
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 9, border: 'none',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s',
              background: tab === tb.id ? '#fff' : 'transparent',
              color: tab === tb.id ? '#1a2332' : '#94a3b8',
              boxShadow: tab === tb.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <tb.Icon />
            {tb.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* People tab */}
        <div style={{ display: tab === 'people' ? 'block' : 'none' }}>
          <SearchBar onSearch={handleSearch} />
          <StatsBar />

          {!loading && persons.length > 0 && (
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '12px 0 8px 4px' }}>
              {t('common.total')}: <strong style={{ color: '#5a7590' }}>{total}</strong> {t('common.records')}
            </p>
          )}

          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} style={{ height: 82, borderRadius: 16, background: '#eef2f7' }} className="skeleton" />
              ))
            ) : persons.length === 0 ? (
              <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.4 }}>🕊</div>
                <p style={{ fontFamily: '"Playfair Display", serif', color: '#94a3b8', fontSize: 16, margin: '0 0 4px' }}>
                  {t('person.notFound')}
                </p>
                <p style={{ color: '#b8c8d8', fontSize: 12 }}>{t('person.notFoundSubtext')}</p>
              </div>
            ) : (
              persons.map(p => <PersonCard key={p.id} person={p} />)
            )}
          </div>

          {totalPages > 1 && (
            <div style={{ marginTop: 16 }}>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => load(params, p)} />
            </div>
          )}
        </div>

        {/* Facts tab */}
        <div style={{ display: tab === 'facts' ? 'block' : 'none' }}>
          <FactsTab />
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MapVisualization />
          <div className="card" style={{ padding: '20px 22px' }}>
            <p style={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600, fontSize: 14, color: '#1a2332',
              margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>📖</span>
              {t('about.title')}
            </p>
            <p style={{ color: '#7d95ab', fontSize: 13, lineHeight: 1.7, margin: '0 0 16px' }}>
              {t('about.description')}
            </p>
            <div style={{ borderTop: '1px solid #eef2f7', paddingTop: 14 }}>
              <Link
                to="/chat"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: 13, display: 'flex' }}
              >
                <ChatIcon />
                {t('chat.askButton')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}