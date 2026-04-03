import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { personsApi } from '../api'
import PersonCard from '../components/PersonCard'
import SearchBar from '../components/SearchBar'
import MapVisualization from '../components/MapVisualization'
import Pagination from '../components/Pagination'
import { useAuth } from '../hooks/useAuth'

const PAGE_SIZE = 20

export default function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()
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
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(params, 1) }, [load])

  const handleSearch = (p) => {
    setParams(p)
    load(p, 1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{t('app.title')}</h1>
          <p className="text-sm text-stone-500">{t('app.description')}</p>
        </div>
        {user && (
          <Link to="/persons/new" className="btn-primary">
            + {t('person.add')}
          </Link>
        )}
      </div>

      <SearchBar onSearch={handleSearch} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Results */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs text-stone-500">
            {t('common.total')}: <strong>{total}</strong> {t('common.records')}
          </p>

          {loading ? (
            <div className="text-center py-12 text-stone-400">{t('common.loading')}</div>
          ) : persons.length === 0 ? (
            <div className="card p-12 text-center text-stone-400">
              <p className="text-3xl mb-2">📭</p>
              <p>{t('person.notFound')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {persons.map(p => <PersonCard key={p.id} person={p} />)}
            </div>
          )}

          {/* Pagination Component */}
          <Pagination
            page={page}
            total={total}
            limit={PAGE_SIZE}
            onPageChange={(p) => load(params, p)}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <MapVisualization persons={persons} />
          <div className="card p-4 text-sm text-stone-600 space-y-2">
            <p className="font-semibold text-stone-700">О проекте</p>
            <p className="text-xs leading-relaxed">
              «Архивдин Үнү» — цифровой мемориал жертв политических репрессий 1918–1953 гг.
              на территории современного Кыргызстана.
            </p>
            <Link to="/chat" className="btn-primary w-full justify-center !text-xs">
              💬 {t('nav.chat')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}