import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { personsApi } from '../api'
import DuplicateWarning from '../components/DuplicateWarning'

const REGIONS = [
  'Чуйская область', 'Иссык-Кульская область', 'Нарынская область',
  'Джалал-Абадская область', 'Ошская область', 'Баткенская область', 'Таласская область',
]

const EMPTY = {
  full_name: '', birth_year: '', death_year: '', region: '', district: '',
  occupation: '', charge: '', arrest_date: '', sentence: '', sentence_date: '',
  rehabilitation_date: '', biography: '', source: '',
}

export default function PersonFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isEdit = Boolean(id)

  const [form, setForm]             = useState(EMPTY)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [duplicates, setDuplicates] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isEdit) {
      personsApi.get(id).then(({ data }) => {
        setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) })
      })
    }
  }, [id, isEdit])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleAutoExtract = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setExtracting(true)
    setError('')
    try {
      const { data } = await personsApi.extractFromDocument(file)
      setForm(prev => ({ ...prev, ...data, source: file.name }))
    } catch (err) {
      setError('Ошибка распознавания документа')
    } finally {
      setExtracting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const submit = async (force = false) => {
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, force }
      Object.keys(payload).forEach(k => { if (payload[k] === '') payload[k] = null })

      let res
      if (isEdit) {
        res = await personsApi.update(id, payload)
      } else {
        res = await personsApi.create(payload)
      }

      if (res.data.duplicates_found) {
        setDuplicates(res.data.similar_persons)
        setLoading(false)
        return
      }
      navigate(`/persons/${res.data.id}`)
    } catch (e) {
      setError(e.response?.data?.detail || t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const F = ({ name, label, type = 'text', rows, required }) => (
    <div>
      <label className="field-label block mb-1.5">
        {label}{required && <span className="text-primary-500 ml-0.5">*</span>}
      </label>
      {rows ? (
        <textarea className="input" rows={rows} value={form[name]} onChange={set(name)} />
      ) : (
        <input className="input" type={type} value={form[name]} onChange={set(name)} />
      )}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {duplicates && (
        <DuplicateWarning
          persons={duplicates}
          onConfirm={() => { setDuplicates(null); submit(true) }}
          onCancel={() => setDuplicates(null)}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-600 mb-4 transition-colors"
          >
            ← Назад
          </button>
          <h1 className="font-serif text-2xl font-bold text-primary-800">
            {isEdit ? t('person.edit') : t('person.add')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">Все поля, кроме имени, необязательны</p>
        </div>

        {/* AI Auto-extract Button (Only visible when creating new) */}
        {!isEdit && (
          <div className="shrink-0">
            <input type="file" ref={fileInputRef} onChange={handleAutoExtract} className="hidden" accept=".pdf,.txt,.md,image/*" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={extracting}
              className="btn-outline !bg-indigo-50 !text-indigo-700 !border-indigo-200 hover:!bg-indigo-600 hover:!text-white transition-colors"
            >
              {extracting ? '⏳ Читаю документ…' : '🪄 Заполнить из скана'}
            </button>
          </div>
        )}
      </div>

      <div className="card p-7 shadow-card-lg space-y-6">
        {/* Identity section */}
        <div>
          <p className="field-label mb-4 pb-2 border-b border-slate-100">Основная информация</p>
          <div className="space-y-4">
            <F name="full_name" label={t('person.name')} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F name="birth_year" label={t('person.birthYear')} type="number" />
              <F name="death_year" label={t('person.deathYear')} type="number" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label block mb-1.5">{t('person.region')}</label>
                <select className="input" value={form.region} onChange={set('region')}>
                  <option value="">— Выберите регион</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <F name="district" label={t('person.district')} />
            </div>
            <F name="occupation" label={t('person.occupation')} />
          </div>
        </div>

        {/* Repression details */}
        <div>
          <p className="field-label mb-4 pb-2 border-b border-slate-100">Уголовное дело</p>
          <div className="space-y-4">
            <F name="charge" label={t('person.charge')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F name="arrest_date"   label={t('person.arrestDate')}   type="date" />
              <F name="sentence_date" label={t('person.sentenceDate')} type="date" />
            </div>
            <F name="sentence" label={t('person.sentence')} />
            <F name="rehabilitation_date" label={t('person.rehabilitationDate')} type="date" />
          </div>
        </div>

        {/* Biography & source */}
        <div>
          <p className="field-label mb-4 pb-2 border-b border-slate-100">Биография и источники</p>
          <div className="space-y-4">
            <F name="biography" label={t('person.biography')} rows={5} />
            <F name="source" label={t('person.source')} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
            <span className="shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-outline flex-1 justify-center"
          >
            {t('person.cancel')}
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={loading || !form.full_name}
            className="btn-primary flex-1 justify-center"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {t('common.loading')}
              </span>
            ) : t('person.save')}
          </button>
        </div>
      </div>
    </div>
  )
}