import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Loader2, RefreshCw, Plus, Pencil, Trash2, Save, X, AlertCircle, UserCheck, UserX } from 'lucide-react';
import {
  fetchAllCoordinators,
  createCoordinator,
  updateCoordinator,
  deleteCoordinator,
  type Coordinator,
} from '../../api/coordinators';
import { ApiError } from '../../api/client';

const input =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all';

interface TabProps {
  onAuthError: () => void;
  showToast: (m: string) => void;
}

// Coordinator management is deliberately just two fields — the name shown to
// students and the code their purchase is attributed to.
export default function CoordinatorsTab({ onAuthError, showToast }: TabProps) {
  const [list, setList] = useState<Coordinator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setList(await fetchAllCoordinators());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError();
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Could not load coordinators');
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createCoordinator({ name: newName.trim(), code: newCode.trim().toUpperCase(), active: true });
      setNewName('');
      setNewCode('');
      setAdding(false);
      showToast('Coordinator added');
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add coordinator');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: Coordinator) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditCode(c.code);
  };

  const saveEdit = async (c: Coordinator) => {
    setBusyId(c.id);
    try {
      await updateCoordinator(c.id, { name: editName.trim(), code: editCode.trim().toUpperCase(), active: c.active });
      setEditingId(null);
      showToast('Coordinator updated');
      load();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update coordinator');
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (c: Coordinator) => {
    setBusyId(c.id);
    try {
      await updateCoordinator(c.id, { name: c.name, code: c.code, active: !c.active });
      setList((rows) => rows.map((r) => (r.id === c.id ? { ...r, active: !r.active } : r)));
      showToast(c.active ? 'Coordinator deactivated' : 'Coordinator activated');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update coordinator');
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (c: Coordinator) => {
    if (!window.confirm(`Delete "${c.name} — ${c.code}"? Past purchases keep this coordinator's details.`)) return;
    setBusyId(c.id);
    try {
      await deleteCoordinator(c.id);
      setList((rows) => rows.filter((r) => r.id !== c.id));
      showToast('Coordinator deleted');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not delete coordinator');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-gray-500">
          {list.length} coordinator{list.length === 1 ? '' : 's'} · {list.filter((c) => c.active).length} active in the
          enrollment form
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors"
          >
            <Plus size={16} /> Add coordinator
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {adding && (
        <form onSubmit={add} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator / employee name *</label>
              <input className={input} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Rahul Sharma" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coordinator code *</label>
              <input
                className={`${input} uppercase`}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="GD001"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Must be unique. Saved in capitals.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setAdding(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
            </button>
          </div>
        </form>
      )}

      {loading && list.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Loader2 size={24} className="animate-spin mx-auto" />
        </div>
      ) : list.length === 0 ? (
        <div className="py-16 text-center text-gray-400 bg-white rounded-xl border border-gray-100">
          No coordinators yet. Add one and it appears in the student enrollment form.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {list.map((c) => (
            <div key={c.id} className="flex items-center gap-4 p-4 flex-wrap sm:flex-nowrap">
              {editingId === c.id ? (
                <>
                  <input className={`${input} flex-grow`} value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <input className={`${input} uppercase sm:w-40`} value={editCode} onChange={(e) => setEditCode(e.target.value)} />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => saveEdit(c)}
                      disabled={busyId === c.id}
                      title="Save"
                      className="p-2 rounded-lg border border-gray-200 text-green-600 hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      {busyId === c.id ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      title="Cancel"
                      className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900 truncate">{c.name}</h4>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                        {c.code}
                      </span>
                      {!c.active && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(c)}
                      disabled={busyId === c.id}
                      title={c.active ? 'Hide from the enrollment form' : 'Show in the enrollment form'}
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                    >
                      {busyId === c.id ? <Loader2 size={15} className="animate-spin" /> : c.active ? <UserCheck size={15} /> : <UserX size={15} />}
                    </button>
                    <button
                      onClick={() => startEdit(c)}
                      title="Edit"
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => remove(c)}
                      disabled={busyId === c.id}
                      title="Delete"
                      className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
