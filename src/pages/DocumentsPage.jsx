import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { documentsApi, factsApi } from '../api';
import FileUploader from '../components/FileUploader';
import { useAuth } from '../hooks/useAuth';
import Pagination from '../components/Pagination';
import DocumentViewerModal from '../components/DocumentViewerModal';

const PAGE_SIZE = 10;
const TYPE_ICON = { pdf: '📕', md: '📝', txt: '📄' };
const STATUS_STYLES = {
  pending: { label: 'Ожидает', class: 'badge-pending' },
  processing: { label: 'В обработке', class: 'badge-pending animate-pulse' },
  processed: { label: 'Обработан', class: 'badge-verified' },
  failed_extraction: { label: 'Ошибка ИИ', class: 'badge-rejected' },
};

const LockBanner = ({ onOpenLogin }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 cursor-pointer select-none"
    onClick={onOpenLogin}
  >
    <span className="text-xl">🔒</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-amber-800">Только для зарегистрированных</p>
      <p className="text-xs text-amber-600 mt-0.5">Войдите или создайте аккаунт, чтобы загружать документы</p>
    </div>
    <button
      onClick={onOpenLogin}
      className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
    >
      Войти
    </button>
  </div>
);

export default function DocumentsPage({ onOpenLogin }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [scope, setScope] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [genMsg, setGenMsg] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async (p = 1, currentScope = 'all', currentSearch = '') => {
    setLoading(true);
    try {
      const params = { page: p, limit: PAGE_SIZE };
      if (currentScope === 'my') params.scope = 'my';
      if (currentSearch.trim()) params.q = currentSearch.trim();
      const { data } = await documentsApi.list(params);
      setDocs(data.items ?? []);
      setTotal(data.total ?? 0);
      setPage(p);
    } catch (err) {
      if (err.response?.status === 401) setScope('all');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1, scope, search);
  }, [load, scope, search]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm(t('documents.delete') + '?')) return;
    await documentsApi.delete(id);
    load(page, scope);
  };

  const handleViewDoc = async (id) => {
    setViewingDoc({ id });
    try {
      const { data } = await documentsApi.get(id);
      setViewingDoc(data);
    } catch (error) {
      console.error('Failed to fetch document content', error);
      setViewingDoc(null);
    }
  };

  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      handleViewDoc(viewId);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleUploaded = () => {
    if (scope === 'my') load(1, 'my', search);
    else { setScope('my'); }
  };

  const handleGenerateFacts = async () => {
    setGenerating(true);
    setGenMsg('');
    try {
      await factsApi.generate();
      setGenMsg('✓ Генерация запущена');
    } catch {
      setGenMsg('Ошибка запуска');
    } finally {
      setGenerating(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      {viewingDoc && <DocumentViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary-800">{t('documents.title')}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Загружайте документы, и система автоматически создаст карточки.
            </p>
          </div>
          {user && ['moderator', 'super_admin'].includes(user.role) && (
            <div className="shrink-0 text-right">
              <button
                onClick={handleGenerateFacts}
                disabled={generating}
                className="btn-outline !text-xs !py-2 !px-3 flex items-center gap-1.5"
              >
                {generating
                  ? <span className="w-3 h-3 border border-slate-400 border-t-transparent rounded-full animate-spin" />
                  : '✨'}
                Сгенерировать факты
              </button>
              {genMsg && <p className="text-[11px] mt-1 text-slate-500">{genMsg}</p>}
            </div>
          )}
        </div>

        {/* Upload block — always visible */}
        <div className="card p-5 space-y-3">
          <p className="field-label">Загрузить документ</p>

          {/* Lock banner for guests */}
          {!user && <LockBanner onOpenLogin={onOpenLogin} />}

          {/* Uploader: visible always, disabled for guests */}
          <div className={!user ? 'pointer-events-none' : ''}>
            <FileUploader
              onUploaded={handleUploaded}
              disabled={!user}
              onDisabledClick={onOpenLogin}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); load(1, scope, searchInput); } }}
            placeholder="Поиск по названию или содержимому..."
            className="input pl-9 pr-10 w-full"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(''); setSearch(''); load(1, scope, ''); }}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            >✕</button>
          )}
        </div>
        {search && (
          <p className="text-xs text-slate-400 -mt-2">
            Результаты по запросу: <span className="font-medium text-slate-600">«{search}»</span>
          </p>
        )}

        {/* Document list */}
        <div>
          <div className="flex border-b border-slate-200 mb-4">
            <button
              onClick={() => setScope('all')}
              className={`px-4 py-2 text-sm font-medium ${scope === 'all' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-slate-500'}`}
            >
              Все документы
            </button>

            {/* "My documents" tab — visible but locked for guests */}
            <button
              onClick={() => user ? setScope('my') : onOpenLogin?.()}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                user
                  ? scope === 'my'
                    ? 'border-b-2 border-primary-500 text-primary-600'
                    : 'text-slate-500 hover:text-slate-700'
                  : 'text-slate-300 cursor-pointer hover:text-slate-400'
              }`}
            >
              {!user && <span className="text-xs">🔒</span>}
              Мои документы
            </button>
          </div>

          <div className="space-y-2">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="card p-4 h-16 skeleton" />)
            ) : docs.length === 0 ? (
              <div className="card p-14 text-center">
                <p className="text-3xl mb-3 opacity-40">🗂</p>
                <p className="font-serif text-slate-500">{t('documents.empty')}</p>
              </div>
            ) : (
              docs.map(doc => {
                const statusInfo = STATUS_STYLES[doc.status] || { label: doc.status, class: 'badge' };
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleViewDoc(doc.id)}
                    className="card-hover p-4 flex items-center gap-4 cursor-pointer"
                  >
                    <div className="text-2xl shrink-0">{TYPE_ICON[doc.file_type] || '📄'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-800 truncate">{doc.filename}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(doc.uploaded_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <span className={`${statusInfo.class} shrink-0`}>{statusInfo.label}</span>
                    {user && (user.role !== 'user' || user.id === doc.uploaded_by) && (
                      <button
                        onClick={(e) => handleDelete(e, doc.id)}
                        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => load(p, scope, search)}
            />
          )}
        </div>
      </div>
    </>
  );
}