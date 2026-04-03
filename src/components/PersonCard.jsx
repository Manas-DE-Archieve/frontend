import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const STATUS_CLASS = {
  verified: 'badge-verified',
  pending:  'badge-pending',
  rejected: 'badge-rejected',
}

export default function PersonCard({ person }) {
  const { t } = useTranslation()
  const years = [person.birth_year, person.death_year].filter(Boolean).join('–')

  return (
    <Link
      to={`/persons/${person.id}`}
      className="group card-hover p-5 block animate-fade-in"
    >
      <div className="flex items-start gap-4">
        {/* Left accent bar */}
        <div className="shrink-0 w-0.5 self-stretch bg-slate-200 rounded-full group-hover:bg-primary-400 transition-colors duration-200" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif font-semibold text-slate-800 group-hover:text-primary-700 transition-colors leading-snug">
              {person.full_name}
            </h3>
            <span className={`${STATUS_CLASS[person.status] || 'badge'} shrink-0 mt-0.5`}>
              {t(`status.${person.status}`)}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5 text-xs text-slate-400">
            {years && (
              <span className="flex items-center gap-1">
                <span className="text-primary-400 opacity-60">◆</span>
                {years}
              </span>
            )}
            {person.region && <span>{person.region}</span>}
            {person.occupation && <span className="italic">{person.occupation}</span>}
          </div>

          {person.charge && (
            <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              <span className="font-semibold text-slate-600 not-italic">Статья: </span>
              {person.charge}
            </p>
          )}
        </div>

        {/* Arrow */}
        <div className="shrink-0 mt-1 text-slate-300 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all duration-200 text-sm">
          →
        </div>
      </div>
    </Link>
  )
}
