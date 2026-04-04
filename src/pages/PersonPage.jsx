import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { personsApi } from '../api'
import { useAuth } from '../hooks/useAuth'

const Field = ({ label, value }) =>
  value ? (
    <div>
      <dt className="field-label">{label}</dt>
      <dd className="field-value">{value}</dd>
    </div>
  ) : null

const STATUS_CLASS = {
  verified: 'badge-verified',
  pending: 'badge-pending',
  rejected: 'badge-rejected'
}

export default function PersonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    personsApi.get(id)
      .then(({ data }) => setPerson(data))
      .catch(() => setPerson(null))
      .finally(() => setLoading(false))
  }, [id])

  const handleSetStatus = async (newStatus) => {
    try {
      await personsApi.setStatus(id, newStatus)
      setPerson(prev => ({ ...prev, status: newStatus }))
    } catch (error) {
      alert(t('person.statusError'))
    }
  }

  const handleDelete = async () => {
    if (!confirm(t('person.deleteConfirm'))) return
    try {
      await personsApi.delete(id)
      navigate('/')
    } catch (error) {
      alert(t('person.deleteError'))
    }
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="card p-8 space-y-4 animate-pulse">
        <div className="h-8 skeleton w-2/3 rounded" />
        <div className="h-4 skeleton w-1/3 rounded" />
        <div className="h-px bg-slate-100 my-4" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-10 skeleton rounded" />)}
        </div>
      </div>
    </div>
  )

  if (!person) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="font-serif text-xl text-slate-400 mb-2">{t('person.notFoundRecord')}</p>
      <p className="text-sm text-slate-400 mb-6">{t('person.notFound')}</p>
      <Link to="/" className="btn-primary inline-flex">{t('person.backToArchive')}</Link>
    </div>
  )

  const isModerator = user && ['moderator', 'super_admin'].includes(user.role)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-600 mb-6 transition-colors"
      >
        ← {t('nav.home')}
      </Link>

      <div className="card overflow-hidden shadow-card-lg">
        {/* Header band */}
        <div className="bg-primary-800 px-7 py-7 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 to-primary-700/80 pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-px bg-primary-300/50" />
                <span className="text-primary-200 text-[10px] tracking-[0.2em] uppercase font-medium">{t('person.personalFile')}</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                {person.full_name}
              </h1>
              <p className="text-slate-300 text-sm mt-1.5">
                {[person.birth_year, person.death_year].filter(Boolean).join('–')}
                {person.region && <span className="mx-1.5 text-slate-500">·</span>}
                {person.region && <span>{person.region}</span>}
              </p>
            </div>
            <span className={`${STATUS_CLASS[person.status] || 'badge'} shrink-0 mt-1`}>
              {t(`status.${person.status}`)}
            </span>
          </div>
        </div>

        {/* Панель модератора */}
        {isModerator && (
          <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700">
                🛡️
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">{t('person.recordControl')}</p>
                <p className="text-[10px] text-slate-500">{t('person.setStatus')}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSetStatus('verified')}
                disabled={person.status === 'verified'}
                className="btn-outline !py-1.5 !px-3 !text-xs !bg-emerald-50 !border-emerald-200 !text-emerald-700 hover:!bg-emerald-600 hover:!text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ {t('admin.verify')}
              </button>
              <button
                onClick={() => handleSetStatus('rejected')}
                disabled={person.status === 'rejected'}
                className="btn-outline !py-1.5 !px-3 !text-xs !bg-amber-50 !border-amber-200 !text-amber-700 hover:!bg-amber-500 hover:!text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✗ {t('admin.reject')}
              </button>
              <button
                onClick={handleDelete}
                className="btn-outline !py-1.5 !px-3 !text-xs !bg-red-50 !border-red-200 !text-red-700 hover:!bg-red-600 hover:!text-white"
              >
                🗑 {t('person.delete')}
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-7">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <Field label={t('person.region')} value={person.region} />
            <Field label={t('person.district')} value={person.district} />
            <Field label={t('person.occupation')} value={person.occupation} />
            <Field label={t('person.charge')} value={person.charge} />
            <Field label={t('person.arrestDate')} value={person.arrest_date} />
            <Field label={t('person.sentence')} value={person.sentence} />
            <Field label={t('person.sentenceDate')} value={person.sentence_date} />
            <Field label={t('person.rehabilitationDate')} value={person.rehabilitation_date} />
          </dl>

          {person.biography && (
            <div className="mt-7 pt-7 border-t border-slate-100">
              <p className="field-label mb-3">{t('person.biography')}</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-serif">
                {person.biography}
              </p>
            </div>
          )}

          {person.source && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <Field label={t('person.source')} value={person.source} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}