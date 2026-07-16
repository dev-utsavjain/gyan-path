import { useEffect, useState, useCallback, type FormEvent, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, LogOut, RefreshCw, ShieldCheck, IndianRupee, AlertCircle, Video, X, CheckCircle2, Mail, Phone, MessageSquare, CreditCard, BookOpen, Settings as SettingsIcon, Plus, Pencil, Trash2, Save } from 'lucide-react';
import {
  adminLogin,
  adminLogout,
  isAdminAuthed,
  fetchPayments,
  fetchStats,
  sendMeetLink,
  fetchContacts,
  markContactHandled,
  type Payment,
  type PaymentStats,
  type ContactMessage,
} from '../api/admin';
import {
  fetchAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  type Course,
  type CourseCategory,
  type CourseInput,
} from '../api/courses';
import { fetchSettings, updateSettings, type Settings } from '../api/settings';
import { ApiError } from '../api/client';

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  basic: 'Basic Plan',
  additional_support: 'Additional Support',
  premium: 'Premium',
  upcoming: 'Upcoming (Coming Soon)',
};
const CATEGORY_ORDER: CourseCategory[] = ['basic', 'additional_support', 'premium', 'upcoming'];

const SETTINGS_GROUPS: { title: string; fields: { key: string; label: string; type: 'text' | 'textarea' | 'number' }[] }[] = [
  {
    title: 'Contact Information',
    fields: [
      { key: 'contact_phone', label: 'Phone (display)', type: 'text' },
      { key: 'contact_phone_raw', label: 'Phone (digits only, for tel/WhatsApp)', type: 'text' },
      { key: 'contact_email', label: 'Email', type: 'text' },
      { key: 'contact_address', label: 'Office address', type: 'textarea' },
    ],
  },
  {
    title: 'Hero & Marketing Text',
    fields: [
      { key: 'hero_title', label: 'Hero headline', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero subtitle', type: 'textarea' },
      { key: 'footer_tagline', label: 'Footer tagline', type: 'textarea' },
    ],
  },
  {
    title: 'Plans & Prices',
    fields: [
      { key: 'plan_basic_name', label: 'Basic plan name', type: 'text' },
      { key: 'plan_basic_price', label: 'Basic plan price (₹)', type: 'number' },
      { key: 'plan_basic_blurb', label: 'Basic plan blurb', type: 'textarea' },
      { key: 'plan_additional_name', label: 'Additional support name', type: 'text' },
      { key: 'plan_additional_price', label: 'Additional support price (₹)', type: 'number' },
      { key: 'plan_additional_blurb', label: 'Additional support blurb', type: 'textarea' },
      { key: 'plan_upcoming_price', label: 'Upcoming price (₹, blurred)', type: 'number' },
      { key: 'plan_upcoming_blurb', label: 'Upcoming blurb', type: 'textarea' },
    ],
  },
];

const STATUS_FILTERS = ['all', 'paid', 'pending', 'failed'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];
type Tab = 'payments' | 'messages' | 'courses' | 'settings';

function statusBadge(status: Payment['status']) {
  const map: Record<Payment['status'], string> = {
    paid: 'bg-green-100 text-green-700 border-green-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
  };
  return `inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${map[status]}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(username, password);
      onSuccess();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center mb-3">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold text-blue-900">Admin Login</h1>
          <p className="text-sm text-gray-500">GyaanPath Digital dashboard</p>
        </div>
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-4"
          placeholder="admin"
          required
        />
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-6"
          placeholder="••••••••"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl py-3 transition-colors flex items-center justify-center"
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-2xl font-extrabold mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function SendMeetModal({ payment, onClose, onSent }: { payment: Payment; onClose: () => void; onSent: () => void }) {
  const [meetLink, setMeetLink] = useState(payment.meet_link || '');
  const [message, setMessage] = useState('');
  const [when, setWhen] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await sendMeetLink(payment.id, { meet_link: meetLink.trim(), message: message.trim(), when: when.trim() });
      onSent();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden my-auto">
        <div className="flex justify-between items-start p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2"><Video size={18} /> Send class link</h3>
            <p className="text-sm text-gray-500">To {payment.student_name || 'student'} &lt;{payment.email || 'no email'}&gt; · {payment.course_name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {!payment.email && (
            <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              This student has no email on record — the link can't be sent.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Google Meet link *</label>
            <input
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              type="url"
              placeholder="https://meet.google.com/abc-defg-hij"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">When (optional)</label>
            <input
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              type="text"
              placeholder="e.g. Mon–Fri, 6:00 PM IST starting 20 Jun"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Add any instructions for the student…"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            />
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            type="submit"
            disabled={sending || !payment.email}
            className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold flex items-center gap-2"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Video size={16} />}
            Send email
          </button>
        </div>
      </form>
    </div>
  );
}

function PaymentsTab({ onAuthError, showToast }: { onAuthError: () => void; showToast: (m: string) => void }) {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetFor, setMeetFor] = useState<Payment | null>(null);

  const load = useCallback(async (status: StatusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const [s, p] = await Promise.all([
        fetchStats(),
        fetchPayments(status === 'all' ? undefined : status),
      ]);
      setStats(s);
      setPayments(p.payments || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError();
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Could not load data');
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  return (
    <>
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={() => load(filter)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Orders" value={String(stats.total_orders)} accent="text-blue-900" />
          <StatCard label="Paid" value={String(stats.paid_orders)} accent="text-green-600" />
          <StatCard label="Pending" value={String(stats.pending_orders)} accent="text-amber-600" />
          <StatCard label="Failed" value={String(stats.failed_orders)} accent="text-red-600" />
          <StatCard label="Revenue (₹)" value={`₹${stats.revenue.toLocaleString('en-IN')}`} accent="text-orange-600" />
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors border ${
              filter === s
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Student</th>
                <th className="text-left font-semibold px-4 py-3">Contact</th>
                <th className="text-left font-semibold px-4 py-3">Course</th>
                <th className="text-right font-semibold px-4 py-3">Amount</th>
                <th className="text-left font-semibold px-4 py-3">Status</th>
                <th className="text-left font-semibold px-4 py-3">Date</th>
                <th className="text-right font-semibold px-4 py-3">Class link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">No payments found.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{p.student_name || '—'}</div>
                      <div className="text-xs text-gray-400">S/o {p.father_name || '—'} · Age {p.age || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <div>{p.mobile || '—'}</div>
                      <div className="text-xs text-gray-400">{p.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{p.course_name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                      <IndianRupee size={12} className="inline -mt-0.5" />{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3"><span className={statusBadge(p.status)}>{p.status}</span></td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setMeetFor(p)}
                        title={p.meet_email_sent_at ? 'Re-send class link' : 'Send class link'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-colors text-xs font-semibold"
                      >
                        {p.meet_email_sent_at ? <CheckCircle2 size={14} className="text-green-600" /> : <Video size={14} />}
                        {p.meet_email_sent_at ? 'Sent' : 'Send link'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meetFor && (
        <SendMeetModal
          payment={meetFor}
          onClose={() => setMeetFor(null)}
          onSent={() => {
            const to = meetFor.email;
            setMeetFor(null);
            showToast(`Class link emailed to ${to}`);
            load(filter);
          }}
        />
      )}
    </>
  );
}

function MessagesTab({ onAuthError, showToast }: { onAuthError: () => void; showToast: (m: string) => void }) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchContacts();
      setMessages(res.messages || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError();
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Could not load messages');
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleHandled = async (m: ContactMessage) => {
    setUpdating(m.id);
    try {
      await markContactHandled(m.id, !m.handled);
      setMessages((list) => list.map((x) => (x.id === m.id ? { ...x, handled: !x.handled } : x)));
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not update message');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">{messages.length} message{messages.length === 1 ? '' : 's'}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && messages.length === 0 ? (
        <div className="py-16 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto" /></div>
      ) : messages.length === 0 ? (
        <div className="py-16 text-center text-gray-400 bg-white rounded-xl border border-gray-100">No messages yet.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {messages.map((m) => (
            <div key={m.id} className={`bg-white rounded-xl shadow-sm border p-5 ${m.handled ? 'border-gray-100 opacity-75' : 'border-orange-200'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{m.name}</h3>
                  <p className="text-xs text-gray-400">{formatDate(m.created_at)}</p>
                </div>
                <button
                  onClick={() => toggleHandled(m)}
                  disabled={updating === m.id}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    m.handled
                      ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  {updating === m.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {m.handled ? 'Handled' : 'Mark handled'}
                </button>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-3">
                {m.email && (
                  <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 hover:text-blue-600">
                    <Mail size={14} /> {m.email}
                  </a>
                )}
                {m.phone && (
                  <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1.5 hover:text-blue-600">
                    <Phone size={14} /> {m.phone}
                  </a>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-3">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

const EMPTY_COURSE: CourseInput = {
  title: '',
  description: '',
  image_url: '',
  category: 'basic',
  price: 0,
  features: [],
  status: 'active',
  sort_order: 0,
};

function CourseFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Course | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [form, setForm] = useState<CourseInput>(initial ? { ...initial } : EMPTY_COURSE);
  const [featuresText, setFeaturesText] = useState((initial?.features || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CourseInput>(key: K, value: CourseInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    const payload: CourseInput = {
      ...form,
      title: form.title.trim(),
      price: Number(form.price) || 0,
      features: featuresText.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      if (initial) {
        await updateCourse(initial.id, payload);
        onSaved('Course updated');
      } else {
        await createCourse(payload);
        onSaved('Course created');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save course');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-auto">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold text-blue-900">{initial ? 'Edit course' : 'Add course'}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className={input} value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} className={`${input} resize-none`} value={form.description} onChange={(e) => set('description', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input className={input} value={form.image_url} onChange={(e) => set('image_url', e.target.value)} placeholder="https://…" />
            {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-24 rounded-lg object-cover border border-gray-100" />}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select className={input} value={form.category} onChange={(e) => set('category', e.target.value as CourseCategory)}>
                {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input type="number" min="0" className={input} value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className={input} value={form.status} onChange={(e) => set('status', e.target.value as Course['status'])}>
                <option value="active">Active (visible)</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort order</label>
              <input type="number" className={input} value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line — used by Premium courses)</label>
            <textarea rows={4} className={`${input} resize-none`} value={featuresText} onChange={(e) => setFeaturesText(e.target.value)} placeholder={'HTML, CSS & JavaScript\nResponsive design\n…'} />
          </div>
        </div>
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
          </button>
        </div>
      </form>
    </div>
  );
}

function CoursesTab({ onAuthError, showToast }: { onAuthError: () => void; showToast: (m: string) => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Course | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCourses(await fetchAllCourses());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError();
        return;
      }
      setError(err instanceof ApiError ? err.message : 'Could not load courses');
    } finally {
      setLoading(false);
    }
  }, [onAuthError]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (c: Course) => {
    if (!window.confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
    setDeletingId(c.id);
    try {
      await deleteCourse(c.id);
      setCourses((list) => list.filter((x) => x.id !== c.id));
      showToast('Course deleted');
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Could not delete course');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-gray-500">{courses.length} course{courses.length === 1 ? '' : 's'}</p>
        <div className="flex items-center gap-3">
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors">
            <Plus size={16} /> Add course
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span>
        </div>
      )}

      {loading && courses.length === 0 ? (
        <div className="py-16 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto" /></div>
      ) : (
        CATEGORY_ORDER.map((cat) => {
          const list = courses.filter((c) => c.category === cat);
          if (list.length === 0) return null;
          return (
            <div key={cat} className="mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">{CATEGORY_LABELS[cat]} · {list.length}</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {list.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 p-4">
                    <img src={c.image_url} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-100 shrink-0" />
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 truncate">{c.title}</h4>
                        {c.status === 'hidden' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Hidden</span>}
                        {c.price > 0 && <span className="text-xs text-gray-500 whitespace-nowrap">₹{c.price}</span>}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setEditing(c)} title="Edit" className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 transition-colors"><Pencil size={15} /></button>
                      <button onClick={() => remove(c)} disabled={deletingId === c.id} title="Delete" className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors">
                        {deletingId === c.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {(adding || editing) && (
        <CourseFormModal
          initial={editing}
          onClose={() => { setAdding(false); setEditing(null); }}
          onSaved={(msg) => { setAdding(false); setEditing(null); showToast(msg); load(); }}
        />
      )}
    </>
  );
}

function SettingsTab({ onAuthError, showToast }: { onAuthError: () => void; showToast: (m: string) => void }) {
  const [values, setValues] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setValues(await fetchSettings());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(values);
      showToast('Settings saved');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onAuthError();
        return;
      }
      showToast(err instanceof ApiError ? err.message : 'Could not save settings');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all';

  if (loading) return <div className="py-16 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto" /></div>;

  return (
    <form onSubmit={save} className="space-y-8 max-w-3xl">
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          <AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span>
        </div>
      )}
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">{group.title}</h3>
          <div className="space-y-4">
            {group.fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea rows={2} className={`${input} resize-none`} value={values[f.key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                ) : (
                  <input type={f.type === 'number' ? 'number' : 'text'} className={input} value={values[f.key] ?? ''} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="sticky bottom-0 bg-gray-50 py-4">
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold transition-colors">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save settings
        </button>
      </div>
    </form>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('payments');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 4000);
  };

  const tabBtn = (id: Tab, label: string, icon: ReactNode) => (
    <button
      onClick={() => setTab(id)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
        tab === id ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
      }`}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-900">Admin Dashboard</h1>
          <p className="text-gray-500">Enrollments, payments, and contact messages.</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-900 text-white hover:bg-blue-800 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tabBtn('payments', 'Payments', <CreditCard size={16} />)}
        {tabBtn('messages', 'Messages', <MessageSquare size={16} />)}
        {tabBtn('courses', 'Courses', <BookOpen size={16} />)}
        {tabBtn('settings', 'Settings', <SettingsIcon size={16} />)}
      </div>

      {tab === 'payments' && <PaymentsTab onAuthError={onLogout} showToast={showToast} />}
      {tab === 'messages' && <MessagesTab onAuthError={onLogout} showToast={showToast} />}
      {tab === 'courses' && <CoursesTab onAuthError={onLogout} showToast={showToast} />}
      {tab === 'settings' && <SettingsTab onAuthError={onLogout} showToast={showToast} />}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(isAdminAuthed());

  const handleLogout = () => {
    adminLogout();
    setAuthed(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Admin | GyaanPath Digital</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      {authed ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginForm onSuccess={() => setAuthed(true)} />
      )}
    </div>
  );
}
