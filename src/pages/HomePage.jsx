// frontend/src/pages/HomePage.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { personsApi } from '../api';
import PersonCard from '../components/PersonCard';
import SearchBar from '../components/SearchBar';
import MapVisualization from '../components/MapVisualization';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;

export default function HomePage() {
  const { t } = useTranslation();
  const [persons, setPersons] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [params, setParams] = useState({});
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (searchParams, p = 1) => {
    setLoading(true);
    try {
      const clean = Object.fromEntries(Object.entries(searchParams).filter(([, v]) => v !== '' && v != null));
      const { data } = await personsApi.list({ ...clean, page: p, limit: PAGE_SIZE });
      setPersons(data.items);
      setTotal(data.total);
      setPage(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load({}, 1) }, [load]);

  const handleSearch = (p) => { setParams(p); load(p, 1); };
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">
      <div className="relative rounded-2xl overflow-hidden bg-primary-800 px-8 py-10 shadow-card-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-primary-800 to-primary-700/90 pointer-events-none" />
        <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-px bg-primary-300/60" />
            <span className="text-primary-200 text-[10px] font-semibold tracking-[0.25em] uppercase">1918–1953</span>
            <div className="w-6 h-px bg-primary-300/60" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-white leading-tight mb-2">
            {t('app.title')}
          </h1>
          <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
            {t('app.description')}
          </p>
          {total > 0 && (
            <div className="mt-4 flex items-center gap-1.5 text-sm">
              <span className="text-primary-300 font-semibold font-serif text-lg">{total.toLocaleString()}</span>
              <span className="text-slate-400">{t('common.records')}</span>
            </div>
          )}
        </div>
      </div>
      <SearchBar onSearch={handleSearch} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {!loading && persons.length > 0 && (
            <p className="text-xs text-slate-400 px-1">
              {t('common.total')}: <strong className="text-slate-600">{total}</strong> {t('common.records')}
            </p>
          )}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="card p-5">
                  <div className="flex gap-4">
                    <div className="w-0.5 h-12 skeleton" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 skeleton w-2/3 rounded" />
                      <div className="h-3 skeleton w-1/3 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : persons.length === 0 ? (
            <div className="card p-14 text-center">
              <p className="text-4xl mb-3 opacity-40">🕊</p>
              <p className="font-serif text-slate-500">{t('person.notFound')}</p>
              <p className="text-xs text-slate-400 mt-1">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <div className="space-y-2">
              {persons.map(p => <PersonCard key={p.id} person={p} />)}
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => load(params, p)}
            />
          )}
        </div>
        <div className="space-y-4">
          <MapVisualization />
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-px bg-primary-300/50" />
              <p className="font-serif font-semibold text-slate-800 text-sm">О проекте</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              «Архивдин Үнү» — цифровой мемориал жертв политических репрессий 1918–1953 гг.
              на территории современного Кыргызстана.
            </p>
            <div className="divider-navy" />
            <Link to="/chat" className="btn-primary w-full justify-center !text-xs">
              Спросить ИИ-архивариуса
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}