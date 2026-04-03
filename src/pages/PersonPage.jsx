import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { personsApi } from '../api'
import { useAuth } from '../hooks/useAuth'

const Field = ({ label, value }) =>
  value ? (
    <div>
      <dt className="text-xs font-medium text-stone-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-0.5 text-sm text-stone-800">{value}</dd>
    </div>
  ) : null

const STATUS_CLASS = { verified: 'badge-verified', pending: 'badge-pending', rejected: 'badge-rejected' }

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

  const handleDelete = async () => {
    if (!confirm('Удалить запись?')) return
    await personsApi.delete(id)
    navigate('/')
  }

  if (loading) return <div className="text-center py-20 text-stone-400">{t('common.loading')}</div>
  if (!person) return (
    <div className="text-center py-20">
      <p className="text-stone-500">{t('person.notFound')}</p>
      <Link to="/" className="btn-primary mt-4 inline-block">← Назад</Link>
    </div>
  )

  const canEdit = user && (user.role !== 'user' || user.id === person.created_by)
  const canDelete = user && ['moderator', 'admin'].includes(user.role)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-block">← Архив</Link>

      <div className="card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{person.full_name}</h1>
            <p className="text-stone-500 text-sm mt-1">
              {[person.birth_year, person.death_year].filter(Boolean).join('–')}
              {person.region && ` · ${person.region}`}
            </p>
          </div>
          <span className={STATUS_CLASS[person.status] || 'badge'}>
            {t(`status.${person.status}`)}
          </span>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="mt-6 pt-6 border-t border-stone-100">
            <dt className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">{t('person.biography')}</dt>
            <dd className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">{person.biography}</dd>
          </div>
        )}

        {person.source && (
          <div className="mt-4 pt-4 border-t border-stone-100">
            <Field label={t('person.source')} value={person.source} />
          </div>
        )}

        {(canEdit || canDelete) && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-stone-100">
            {canEdit && (
              <Link to={`/persons/${id}/edit`} className="btn-outline">
                ✏️ {t('person.edit')}
              </Link>
            )}
            {canDelete && (
              <button onClick={handleDelete} className="btn-outline !text-red-600 !border-red-200 hover:!bg-red-50">
                🗑 {t('person.delete')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
