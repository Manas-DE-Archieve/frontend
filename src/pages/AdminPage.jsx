// frontend/src/pages/AdminPage.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { personsApi, adminApi } from '../api';
import { useAuth } from '../hooks/useAuth';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 20;
const USERS_PAGE_SIZE = 10;

function UserManagementPanel() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const searchTimeoutRef = useRef(null);

  const loadUsers = useCallback(async (p = 1, q = '') => {
    setLoading(true);
    try {
      const { data } = await adminApi.listUsers({ page: p, limit: USERS_PAGE_SIZE, q });
      setUsers(data.items);
      setTotal(data.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(1, search);
  }, [loadUsers, search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert(t('admin.roleChangeFailed'));
      console.error(error);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
    }, 500);
  };

  const totalPages = Math.ceil(total / USERS_PAGE_SIZE);

  return (
    <div className="card p-6 mt-8">
      <h2 className="font-serif text-xl font-bold text-primary-800 mb-1">{t('admin.userManagement')}</h2>
      <p className="text-sm text-slate-400 mb-4">{t('admin.userManagementSubtitle')}</p>

      <input
        type="text"
        placeholder={t('admin.searchEmail')}
        onChange={handleSearchChange}
        className="input mb-4"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3">{t('admin.colUser')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.colRole')}</th>
              <th scope="col" className="px-6 py-3">{t('admin.colCreatedAt')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{user.email}</td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.id === currentUser.id || user.role === 'super_admin'}
                    className="input !py-1 !px-2 text-xs disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <option value="user">{t('admin.roleUser')}</option>
                    <option value="moderator">{t('admin.roleModerator')}</option>
                    {user.role === 'super_admin' && <option value="super_admin">Super Admin</option>}
                  </select>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => loadUsers(p, search)}
        />
      )}
    </div>
  );
}


export default function AdminPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await personsApi.list({ status: 'pending', page: p, limit: PAGE_SIZE });
      setPersons(data.items);
      setTotal(data.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1) }, [load]);

  const setStatus = async (id, status) => {
    await personsApi.setStatus(id, status);
    load(page);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (!user || !['moderator', 'super_admin'].includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-4xl mb-3 opacity-30">🔒</div>
        <p className="font-serif text-lg text-slate-400">{t('admin.accessDenied')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-primary-800">{t('admin.title')}</h1>
            <p className="text-sm text-slate-400 mt-1">
              {t('admin.pending')}: <strong className="text-slate-600">{total}</strong>
            </p>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold text-amber-700">{t('admin.awaitingCount', { count: total })}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3 mt-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 skeleton w-1/2 rounded mb-2" />
                <div className="h-3 skeleton w-1/3 rounded" />
              </div>
            ))}
          </div>
        ) : persons.length === 0 ? (
          <div className="card p-16 text-center mt-6">
            <p className="text-4xl mb-3 opacity-50">✓</p>
            <p className="font-serif text-slate-500">{t('admin.allChecked')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('admin.noPending')}</p>
          </div>
        ) : (
          <div className="space-y-3 mt-6">
            {persons.map(p => (
              <div key={p.id} className="card p-5 flex items-center gap-5 animate-fade-in">
                <div className="w-0.5 h-12 bg-amber-300 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/persons/${p.id}`}
                    className="font-serif font-semibold text-slate-800 hover:text-primary-700 transition-colors"
                  >
                    {p.full_name}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {[p.birth_year, p.region, p.charge].filter(Boolean).join(' · ')}
                  </p>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    {t('admin.addedOn')} {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setStatus(p.id, 'verified')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    ✓ {t('admin.verify')}
                  </button>
                  <button
                    onClick={() => setStatus(p.id, 'rejected')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                  >
                    ✗ {t('admin.reject')}
                  </button>
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={load}
              />
            )}
          </div>
        )}
      </div>

      {user?.role === 'super_admin' && <UserManagementPanel />}
    </div>
  );
}