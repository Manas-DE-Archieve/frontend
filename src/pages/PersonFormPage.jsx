import { useState, useEffect } from 'react'
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

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [duplicates, setDuplicates] = useState(null)

  useEffect(() => {
    if (isEdit) {
      personsApi.get(id).then(({ data }) => {
        setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) })
      })
    }
  }, [id, isEdit])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (force = false) => {
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, force }
      // clean empties
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

  const F = ({ name, label, type = 'text', rows }) => (
    <div>
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      {rows ? (
        <textarea className="input" rows={rows} value={form[name]} onChange={set(name)} />
      ) : (
        <input className="input" type={type} value={form[name]} onChange={set(name)} />
      )}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {duplicates && (
        <DuplicateWarning
          persons={duplicates}
          onConfirm={() => { setDuplicates(null); submit(true) }}
          onCancel={() => setDuplicates(null)}
        />
      )}

      <h1 className="text-xl font-bold text-stone-800 mb-6">
        {isEdit ? t('person.edit') : t('person.add')}
      </h1>

      <div className="card p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">{t('person.name')} *</label>
          <input className="input" required value={form.full_name} onChange={set('full_name')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <F name="birth_year" label={t('person.birthYear')} type="number" />
          <F name="death_year" label={t('person.deathYear')} type="number" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">{t('person.region')}</label>
            <select className="input" value={form.region} onChange={set('region')}>
              <option value="">—</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <F name="district" label={t('person.district')} />
        </div>

        <F name="occupation" label={t('person.occupation')} />
        <F name="charge" label={t('person.charge')} />

        <div className="grid grid-cols-2 gap-4">
          <F name="arrest_date" label={t('person.arrestDate')} type="date" />
          <F name="sentence_date" label={t('person.sentenceDate')} type="date" />
        </div>

        <F name="sentence" label={t('person.sentence')} />
        <F name="rehabilitation_date" label={t('person.rehabilitationDate')} type="date" />
        <F name="biography" label={t('person.biography')} rows={5} />
        <F name="source" label={t('person.source')} />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline flex-1">
            {t('person.cancel')}
          </button>
          <button
            type="button"
            onClick={() => submit(false)}
            disabled={loading || !form.full_name}
            className="btn-primary flex-1"
          >
            {loading ? t('common.loading') : t('person.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
