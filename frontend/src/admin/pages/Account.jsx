import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Feedback';
import { AField, PageTitle, useToast } from '../components/ui';

export default function Account() {
  const { user } = useAuth();
  const toast = useToast();
  const [v, setV] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (v.newPassword !== v.confirm) return setErrors({ confirm: 'Passwords do not match' });
    setBusy(true); setErrors({});
    try {
      await api.put('/auth/password', { currentPassword: v.currentPassword, newPassword: v.newPassword });
      toast('Password updated');
      setV({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setErrors(err.errors || {}); toast(err.message, 'error'); } finally { setBusy(false); }
  }

  return (
    <>
      <PageTitle title="My Account" description="Your administrator profile and password." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-xl font-bold uppercase text-navy">Profile</h2>
          <dl className="mt-4 space-y-3">
            <div><dt className="text-sm text-muted">Name</dt><dd className="font-semibold text-navy">{user?.name}</dd></div>
            <div><dt className="text-sm text-muted">Email</dt><dd className="font-semibold text-navy">{user?.email}</dd></div>
            <div><dt className="text-sm text-muted">Role</dt><dd className="font-semibold capitalize text-navy">{user?.role}</dd></div>
          </dl>
          <p className="mt-6 rounded-lg bg-surface p-4 text-sm text-muted">To add another administrator, run <code className="rounded bg-white px-1.5 py-0.5 text-navy">npm run create-admin</code> on the server (see README).</p>
        </section>
        <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
          <h2 className="font-display text-xl font-bold uppercase text-navy">Change Password</h2>
          <AField label="Current password" error={errors.currentPassword}><input type="password" autoComplete="current-password" className="input" value={v.currentPassword} onChange={(e) => setV({ ...v, currentPassword: e.target.value })} /></AField>
          <AField label="New password" hint="At least 10 characters, including a letter and a number." error={errors.newPassword}><input type="password" autoComplete="new-password" className="input" value={v.newPassword} onChange={(e) => setV({ ...v, newPassword: e.target.value })} /></AField>
          <AField label="Confirm new password" error={errors.confirm}><input type="password" autoComplete="new-password" className="input" value={v.confirm} onChange={(e) => setV({ ...v, confirm: e.target.value })} /></AField>
          <button type="submit" className="btn btn-blue btn-sm" disabled={busy || !v.currentPassword || !v.newPassword}>{busy ? <Spinner /> : <KeyRound className="size-4" />} Update Password</button>
        </form>
      </div>
    </>
  );
}
