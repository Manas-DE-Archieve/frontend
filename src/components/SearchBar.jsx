import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const REGIONS = [
  'Чуйская область', 'Иссык-Кульская область', 'Нарынская область',
  'Джалал-Абадская область', 'Ошская область', 'Баткенская область', 'Таласская область',
]

export default function SearchBar({ onSearch }) {
  const { t } = useTranslation()
  const [q, setQ]             = useState('')
  const [region, setRegion]   = useState('')
  const [charge, setCharge]   = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo]   = useState('')
  const [status, setStatus]   = useState('')
  const [open, setOpen]       = useState(false)

  const submit = (e) => {
    e?.preventDefault()
    onSearch({ q, region, charge, year_from: yearFrom, year_to: yearTo, status })
  }

  const clear = () => {
    setQ(''); setRegion(''); setCharge(''); setYearFrom(''); setYearTo(''); setStatus('')
    onSearch({})
  }

  const hasFilters = region || charge || yearFrom || yearTo || status

  return (
    <form onSubmit={submit} className="space-y-2">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            ⌕
          </span>
          <input
            className="input pl-9"
            placeholder={t('search.placeholder')}
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary px-4">
          {t('search.search') || 'Поиск'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`btn-outline px-4 gap-1.5 ${hasFilters ? 'border-primary-400 text-primary-700' : ''}`}
        >
          <span className="text-xs">{t('search.filters')}</span>
          {hasFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 inline-block" />
          )}
          <span className="text-slate-400 text-[10px]">{open ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Advanced filters */}
      {open && (
        <div className="card p-5 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="field-label mb-1.5 block">{t('search.region')}</label>
              <select className="input" value={region} onChange={e => setRegion(e.target.value)}>
                <option value="">{t('search.allRegions')}</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label mb-1.5 block">{t('search.charge')}</label>
              <input
                className="input"
                placeholder={t('search.chargePlaceholder')}
                value={charge}
                onChange={e => setCharge(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label mb-1.5 block">{t('search.status')}</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">{t('status.all')}</option>
                <option value="pending">{t('status.pending')}</option>
                <option value="verified">{t('status.verified')}</option>
                <option value="rejected">{t('status.rejected')}</option>
              </select>
            </div>
            <div>
              <label className="field-label mb-1.5 block">{t('search.yearFrom')}</label>
              <input
                className="input"
                type="number"
                min="1900"
                max="1960"
                placeholder="1918"
                value={yearFrom}
                onChange={e => setYearFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="field-label mb-1.5 block">{t('search.yearTo')}</label>
              <input
                className="input"
                type="number"
                min="1900"
                max="1960"
                placeholder="1953"
                value={yearTo}
                onChange={e => setYearTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={clear}
                className="btn-ghost w-full justify-center text-xs text-slate-400"
              >
                {t('search.clear')}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
