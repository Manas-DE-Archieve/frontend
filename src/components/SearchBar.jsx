import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const REGIONS = [
  'Чуйская область', 'Иссык-Кульская область', 'Нарынская область',
  'Джалал-Абадская область', 'Ошская область', 'Баткенская область', 'Таласская область',
]

export default function SearchBar({ onSearch }) {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [region, setRegion] = useState('')
  const [charge, setCharge] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [status, setStatus] = useState('')
  const [open, setOpen] = useState(false)

  const submit = (e) => {
    e?.preventDefault()
    onSearch({ q, region, charge, year_from: yearFrom, year_to: yearTo, status })
  }

  const clear = () => {
    setQ(''); setRegion(''); setCharge(''); setYearFrom(''); setYearTo(''); setStatus('')
    onSearch({})
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder={t('search.placeholder')}
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <button type="submit" className="btn-primary">{t('nav.home') === 'Архив' ? '🔍' : '🔍'}</button>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="btn-outline"
        >
          {t('search.filters')} {open ? '▲' : '▼'}
        </button>
      </div>

      {open && (
        <div className="card p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">{t('search.region')}</label>
            <select className="input" value={region} onChange={e => setRegion(e.target.value)}>
              <option value="">—</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">{t('search.charge')}</label>
            <input className="input" value={charge} onChange={e => setCharge(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">{t('search.status')}</label>
            <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">{t('status.all')}</option>
              <option value="pending">{t('status.pending')}</option>
              <option value="verified">{t('status.verified')}</option>
              <option value="rejected">{t('status.rejected')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">{t('search.yearFrom')}</label>
            <input className="input" type="number" min="1900" max="1960" value={yearFrom} onChange={e => setYearFrom(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">{t('search.yearTo')}</label>
            <input className="input" type="number" min="1900" max="1960" value={yearTo} onChange={e => setYearTo(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={clear} className="btn-outline w-full">{t('search.clear')}</button>
          </div>
        </div>
      )}
    </form>
  )
}
