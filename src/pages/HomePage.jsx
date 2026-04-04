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
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

      {/* Hero */}
      <div style={{
        borderRadius: 20, overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a3a5c 0%, #1e4d78 40%, #16639e 100%)',
        padding: 'clamp(24px, 5vw, 48px) clamp(20px, 5vw, 48px)',
        marginBottom: 20, position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '40%', height: '100%', background: 'radial-gradient(ellipse at right, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ height: 1, width: 28, background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' }}>1918 — 1953</span>
            <div style={{ height: 1, width: 28, background: 'rgba(255,255,255,0.3)' }} />
          </div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: 700, color: '#fff', margin: '0 0 10px', lineHeight: 1.2 }}>
            Архивдин Үнү
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(13px, 2vw, 15px)', maxWidth: 500, margin: '0 0 22px', lineHeight: 1.7 }}>
            {t('app.description')}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            {total > 0 && (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{total.toLocaleString()}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{t('common.records')}</span>
              </div>
            )}
            <Link to="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              {t('nav.chat')}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Tabs */}
      <div style={{ display: 'inline-flex', gap: 4, background: '#eef2f7', borderRadius: 12, padding: 4, marginBottom: 20, width: '100%', boxSizing: 'border-box' }}>
        {[
          { id: 'people', label: t('nav.home') },
          { id: 'facts',  label: t('nav.history') },
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            style={{
              flex: 1, padding: '8px 16px', borderRadius: 9, border: 'none',
              fontSize: 13.5, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: tab === tb.id ? '#fff' : 'transparent',
              color: tab === tb.id ? '#1a2332' : '#94a3b8',
              boxShadow: tab === tb.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) clamp(260px, 28%, 340px)', gap: 20 }}>

        {/* Main col */}
        <div>
          {/* People tab */}
          <div style={{ display: tab === 'people' ? 'block' : 'none' }}>
            <SearchBar onSearch={handleSearch} />
            {!loading && persons.length > 0 && (
              <p style={{ color: '#94a3b8', fontSize: 12, margin: '10px 0 4px 4px' }}>
                {t('common.total')}: <strong style={{ color: '#5a7590' }}>{total}</strong> {t('common.records')}
              </p>
            )}
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {loading ? (
                [...Array(5)].map((_, i) => <div key={i} style={{ height: 82, borderRadius: 16, background: '#eef2f7' }} className="skeleton" />)
              ) : persons.length === 0 ? (
                <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 38, marginBottom: 10, opacity: 0.4 }}>🕊</div>
                  <p style={{ fontFamily: '"Playfair Display", serif', color: '#94a3b8', fontSize: 16, margin: '0 0 4px' }}>{t('person.notFound')}</p>
                  <p style={{ color: '#b8c8d8', fontSize: 12, margin: 0 }}>{t('person.notFoundSubtext')}</p>
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
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MapVisualization />
          <div className="card" style={{ padding: '18px 20px' }}>
            <p style={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, fontSize: 14, color: '#1a2332', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📖</span>{t('about.title')}
            </p>
            <p style={{ color: '#7d95ab', fontSize: 13, lineHeight: 1.7, margin: '0 0 14px' }}>
              {t('about.description')}
            </p>
            <div style={{ borderTop: '1px solid #eef2f7', paddingTop: 12 }}>
              <Link to="/chat" className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: 13, display: 'flex' }}>
                {t('chat.askButton')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: sidebar goes below on small screens */}
      <style>{`
        @media (max-width: 700px) {
          .home-page-grid { grid-template-columns: 1fr !important; }
          .home-page-sidebar { order: 3; }
        }
      `}</style>
    </div>
  )
}