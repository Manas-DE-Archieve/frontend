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
    <div className="home-page">
      {/* ── Hero ── */}
      <div className="hero-block">
        <div className="hero-glow" />
        <div className="hero-circle" />
        <div className="hero-content">
          <div className="hero-dates">
            <div className="hero-line" />
            <span>1918 — 1953</span>
            <div className="hero-line" />
          </div>
          <h1 className="hero-title">Архивдин Үнү</h1>
          <p className="hero-desc">{t('app.description')}</p>
          <div className="hero-footer">
            {total > 0 && (
              <div className="hero-count">
                <span className="hero-num">{total.toLocaleString()}</span>
                <span className="hero-records">{t('common.records')}</span>
              </div>
            )}
            <Link to="/chat" className="hero-chat-btn">
              <ChatIcon />
              {t('nav.chat')}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <StatsBar />

      {/* ── Tabs ── */}
      <div className="tabs-row">
        {[
          { id: 'people', Icon: PeopleIcon, label: t('nav.home') },
          { id: 'facts',  Icon: BookIcon,   label: t('nav.history') },
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            className={`tab-btn ${tab === tb.id ? 'tab-btn--active' : ''}`}
          >
            <tb.Icon />
            {tb.label}
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="home-grid">
        {/* People tab */}
        <div className={`home-main ${tab !== 'people' ? 'home-main--hidden' : ''}`}>
          <SearchBar onSearch={handleSearch} />

          {!loading && persons.length > 0 && (
            <p className="results-count">
              {t('common.total')}: <strong>{total}</strong> {t('common.records')}
            </p>
          )}

          <div className="persons-list">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="skeleton person-skeleton" />
              ))
            ) : persons.length === 0 ? (
              <div className="card empty-state">
                <div className="empty-icon">🕊</div>
                <p className="empty-title">{t('person.notFound')}</p>
                <p className="empty-sub">{t('person.notFoundSubtext')}</p>
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
        <div className={`home-main ${tab !== 'facts' ? 'home-main--hidden' : ''}`}>
          <FactsTab />
        </div>

        {/* Sidebar */}
        <div className="home-sidebar">
          <MapVisualization />
          <div className="card sidebar-about">
            <p className="sidebar-about-title">
              <span>📖</span>
              {t('about.title')}
            </p>
            <p className="sidebar-about-desc">{t('about.description')}</p>
            <div className="sidebar-about-footer">
              <Link to="/chat" className="btn-primary" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none', fontSize: 13, display: 'flex' }}>
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