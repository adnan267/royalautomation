import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert, Spinner } from '@/components/ui/Feedback';

export default function Login() {
  const { user, login, checking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!checking && user) return <Navigate to={location.state?.from || '/admin'} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-navy px-4 py-12">
      <title>Admin Sign In | The Royal Automation</title>
      <meta name="robots" content="noindex,nofollow" />
      <div className="absolute inset-0 bg-blueprint" />
      <div className="absolute -right-32 -top-32 size-96 rounded-full bg-brand/30 blur-3xl" />
      <div className="absolute -bottom-40 -left-20 size-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl sm:p-10">
          <img src="/brand/logo.jpg" alt="The Royal Automation" className="mx-auto h-20 w-auto" />
          <h1 className="mt-6 text-center font-display text-3xl font-extrabold uppercase text-navy">Admin Sign In</h1>
          <p className="mt-1 text-center text-sm text-muted">Manage website content, quotes and inquiries.</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            {error && <Alert>{error}</Alert>}
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" type="email" autoComplete="username" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" className="input pr-11" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted hover:text-navy" aria-label={show ? 'Hide password' : 'Show password'}>
                  {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-blue w-full" disabled={busy}>{busy ? <Spinner /> : <LogIn className="size-5" />} Sign In</button>
          </form>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted"><Lock className="size-3.5" /> Secure area — authorised staff only</p>
        </div>
        <p className="mt-6 text-center text-sm text-white/70"><a href="/" className="hover:text-white">← Back to website</a></p>
      </div>
    </div>
  );
}
