import { useTranslation } from 'react-i18next'

// Approximate center coordinates for KG regions
const REGIONS_GEO = [
  { name: 'Чуйская область',        lat: 42.87, lng: 74.59, count: 0 },
  { name: 'Иссык-Кульская область', lat: 42.45, lng: 77.40, count: 0 },
  { name: 'Нарынская область',      lat: 41.43, lng: 75.99, count: 0 },
  { name: 'Джалал-Абадская область',lat: 40.93, lng: 72.98, count: 0 },
  { name: 'Ошская область',         lat: 40.51, lng: 72.80, count: 0 },
  { name: 'Баткенская область',     lat: 39.96, lng: 70.82, count: 0 },
  { name: 'Таласская область',      lat: 42.52, lng: 72.24, count: 0 },
]

// SVG viewport: KG bounding box approx lng 69–81, lat 39–43
const LNG_MIN = 69, LNG_MAX = 81, LAT_MIN = 39, LAT_MAX = 44
const W = 500, H = 200

function project(lat, lng) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * W
  const y = H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * H
  return { x, y }
}

export default function MapVisualization({ persons = [] }) {
  const { t } = useTranslation()

  // Count persons per region
  const counts = {}
  persons.forEach(p => { if (p.region) counts[p.region] = (counts[p.region] || 0) + 1 })
  const maxCount = Math.max(1, ...Object.values(counts))

  const regions = REGIONS_GEO.map(r => ({ ...r, count: counts[r.name] || 0 }))

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-stone-700 mb-3">{t('map.title')}</h3>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-sky-50 border border-sky-100">
        {/* Grid lines */}
        {[40, 41, 42, 43].map(lat => {
          const { y } = project(lat, LNG_MIN)
          return <line key={lat} x1="0" y1={y} x2={W} y2={y} stroke="#e0f2fe" strokeWidth="0.5" />
        })}
        {[70,72,74,76,78,80].map(lng => {
          const { x } = project(LAT_MIN, lng)
          return <line key={lng} x1={x} y1="0" x2={x} y2={H} stroke="#e0f2fe" strokeWidth="0.5" />
        })}

        {/* Region bubbles */}
        {regions.map(r => {
          const { x, y } = project(r.lat, r.lng)
          const radius = r.count > 0 ? 8 + (r.count / maxCount) * 18 : 6
          return (
            <g key={r.name}>
              <circle
                cx={x} cy={y} r={radius}
                fill={r.count > 0 ? '#8b1a1a' : '#d1d5db'}
                fillOpacity={r.count > 0 ? 0.75 : 0.4}
                stroke="white" strokeWidth="1.5"
              />
              {r.count > 0 && (
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fill="white" fontWeight="bold">
                  {r.count}
                </text>
              )}
              <title>{r.name}: {r.count} {t('map.persons')}</title>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {regions.filter(r => r.count > 0).sort((a,b) => b.count - a.count).map(r => (
          <span key={r.name} className="text-xs text-stone-500">
            {r.name.replace(' область', '')}: <strong className="text-primary-500">{r.count}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}
