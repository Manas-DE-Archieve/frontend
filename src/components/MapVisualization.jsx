import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'

// Координаты центров областей
const REGIONS_GEO = [
  { name: 'Чуйская область', lat: 42.87, lng: 74.59, count: 0 },
  { name: 'Иссык-Кульская область', lat: 42.45, lng: 77.40, count: 0 },
  { name: 'Нарынская область', lat: 41.43, lng: 75.99, count: 0 },
  { name: 'Джалал-Абадская область', lat: 40.93, lng: 72.98, count: 0 },
  { name: 'Ошская область', lat: 40.51, lng: 72.80, count: 0 },
  { name: 'Баткенская область', lat: 39.96, lng: 70.82, count: 0 },
  { name: 'Таласская область', lat: 42.52, lng: 72.24, count: 0 },
]

export default function MapVisualization({ persons = [] }) {
  const { t } = useTranslation()

  // Считаем количество людей по регионам
  const counts = {}
  persons.forEach(p => { if (p.region) counts[p.region] = (counts[p.region] || 0) + 1 })
  const maxCount = Math.max(1, ...Object.values(counts))

  const regions = REGIONS_GEO.map(r => ({ ...r, count: counts[r.name] || 0 }))

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-stone-700 mb-3">{t('map.title')}</h3>

      {/* Настоящая интерактивная карта */}
      <div className="w-full rounded-lg overflow-hidden border border-stone-200 z-0 relative">
        <MapContainer
          center={[41.2, 74.5]} // Центр Кыргызстана
          zoom={6}              // Приближение
          style={{ height: '240px', width: '100%', zIndex: 1 }}
          scrollWheelZoom={false} // Отключаем зум колесиком, чтобы страница не дергалась
        >
          {/* Слой с картой (OpenStreetMap) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Рисуем круги для регионов */}
          {regions.filter(r => r.count > 0).map(r => {
            // Вычисляем размер круга в зависимости от количества людей
            const radius = 10 + (r.count / maxCount) * 15
            return (
              <CircleMarker
                key={r.name}
                center={[r.lat, r.lng]}
                pathOptions={{
                  color: '#8b1a1a',      // Темно-красный цвет границы
                  fillColor: '#8b1a1a',  // Темно-красный цвет заливки
                  fillOpacity: 0.7,
                  weight: 2
                }}
                radius={radius}
              >
                {/* Всплывающая подсказка при наведении */}
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <span className="font-semibold">{r.name}</span>
                  <br />
                  {r.count} {t('map.persons')}
                </Tooltip>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>

      {/* Легенда (текст под картой) */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {regions.filter(r => r.count > 0).sort((a, b) => b.count - a.count).map(r => (
          <span key={r.name} className="text-xs text-stone-500">
            {r.name.replace(' область', '')}: <strong className="text-primary-500">{r.count}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}