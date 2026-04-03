import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON } from 'react-leaflet'

const REGIONS_GEO = [
  { name: 'Чуйская область', lat: 42.87, lng: 74.59, count: 0 },
  { name: 'Иссык-Кульская область', lat: 42.45, lng: 77.40, count: 0 },
  { name: 'Нарынская область', lat: 41.43, lng: 75.99, count: 0 },
  { name: 'Джалал-Абадская область', lat: 40.93, lng: 72.98, count: 0 },
  { name: 'Ошская область', lat: 40.51, lng: 72.80, count: 0 },
  { name: 'Баткенская область', lat: 39.96, lng: 70.82, count: 0 },
  { name: 'Таласская область', lat: 42.52, lng: 72.24, count: 0 },
]

const KG_BOUNDS = [
  [39.0, 69.0],
  [43.5, 80.5]
]

export default function MapVisualization({ persons = [] }) {
  const { t } = useTranslation()
  const [kgBorder, setKgBorder] = useState(null)
  const [regionsBorder, setRegionsBorder] = useState(null)

  // Загружаем контуры границ при загрузке страницы
  useEffect(() => {
    // 1. Внешняя граница страны (из публичного API)
    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/KGZ.geo.json')
      .then(res => res.json())
      .then(data => setKgBorder(data))
      .catch(err => console.error('Ошибка загрузки границ КР:', err))

    // 2. Границы областей (из глобальной базы geoBoundaries - официальный и надежный источник)
    fetch('https://raw.githubusercontent.com/wmgeolab/geoBoundaries/main/releaseData/gbOpen/KGZ/ADM1/geoBoundaries-KGZ-ADM1_simplified.geojson')
      .then(res => res.json())
      .then(data => setRegionsBorder(data))
      .catch(err => console.error('Ошибка загрузки границ областей:', err))
  }, [])

  const counts = {}
  persons.forEach(p => { if (p.region) counts[p.region] = (counts[p.region] || 0) + 1 })
  const maxCount = Math.max(1, ...Object.values(counts))

  const regions = REGIONS_GEO.map(r => ({ ...r, count: counts[r.name] || 0 }))

  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold text-stone-700 mb-3">{t('map.title')}</h3>

      <div className="w-full rounded-lg overflow-hidden border border-stone-200 z-0 relative shadow-inner">
        <MapContainer
          center={[41.2, 74.5]}
          zoom={5}         // Сделали стартовый зум чуть дальше, чтобы сразу видеть соседей
          minZoom={3}      // Разрешили отдалять карту вплоть до материков
          style={{ height: '260px', width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
          wheelPxPerZoomLevel={120}
          zoomSnap={0.5}
          zoomDelta={0.5}
        >
          {/* Базовая карта */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* СЛОЙ 1: Внутренние границы областей (пунктир) */}
          {regionsBorder && (
            <GeoJSON
              data={regionsBorder}
              style={{
                color: '#57534e',   // Серый цвет
                weight: 1.5,        // Тонкая линия
                opacity: 0.8,
                dashArray: '5, 5',  // Делаем линию пунктирной!
                fillOpacity: 0      // Внутри области прозрачные
              }}
            />
          )}

          {/* СЛОЙ 2: Внешняя граница страны (жирная, поверх областей) */}
          {kgBorder && (
            <GeoJSON
              data={kgBorder}
              style={{
                color: '#1c1917',   // Темно-серый/почти черный
                weight: 3.5,        // Жирная линия
                opacity: 0.9,
                fillColor: '#000',
                fillOpacity: 0.03   // Слегка затеняем всю страну
              }}
            />
          )}

          {/* СЛОЙ 3: Наши данные (красные круги) */}
          {regions.filter(r => r.count > 0).map(r => {
            const radius = 10 + (r.count / maxCount) * 16
            return (
              <CircleMarker
                key={r.name}
                center={[r.lat, r.lng]}
                pathOptions={{
                  color: '#ffffff',      // Белая рамка
                  fillColor: '#dc2626',  // Красный цвет
                  fillOpacity: 0.85,
                  weight: 2
                }}
                radius={radius}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.95} className="!rounded-md !border-none !shadow-md !text-stone-800">
                  <div className="text-center">
                    <span className="font-bold block mb-0.5 text-sm">{r.name}</span>
                    <span className="text-xs text-stone-500">
                      Репрессировано: <strong className="text-red-700">{r.count}</strong>
                    </span>
                  </div>
                </Tooltip>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {regions.filter(r => r.count > 0).sort((a, b) => b.count - a.count).map(r => (
          <span key={r.name} className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
            {r.name.replace(' область', '')}: <strong className="text-red-700">{r.count}</strong>
          </span>
        ))}
      </div>
    </div>
  )
}