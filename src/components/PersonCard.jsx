import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const STATUS_CLASS = {
  verified: 'badge-verified',
  pending: 'badge-pending',
  rejected: 'badge-rejected',
}

export default function PersonCard({ person }) {
  const { t } = useTranslation()
  const years = [person.birth_year, person.death_year].filter(Boolean).join('–')

  return (
    <Link
      to={`/persons/${person.id}`}
      className="card p-4 hover:shadow-md hover:border-primary-500/30 transition-all block"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-stone-800 truncate">{person.full_name}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-stone-500">
            {years && <span>{years}</span>}
            {person.region && <span>{person.region}</span>}
            {person.occupation && <span>{person.occupation}</span>}
          </div>
          {person.charge && (
            <p className="mt-2 text-xs text-stone-600 line-clamp-2">
              <span className="font-medium">Ст. </span>{person.charge}
            </p>
          )}
        </div>
        <span className={`${STATUS_CLASS[person.status] || 'badge'} shrink-0`}>
          {t(`status.${person.status}`)}
        </span>
      </div>
    </Link>
  )
}
