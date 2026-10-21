import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { errorMessage } from '../../api/client';
import { authApi } from '../../api/endpoints';
import { PASSWORD_HINT, newPasswordError, passwordProblem } from '../../api/password';
import logoImg from '../../assets/logo.png';
import loginBg from '../../assets/login-bg.jpg';

/** Target of the password-reset email link: {ADMIN_APP_URL}/set-password?token=... */
export const SetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [confirmMsg, setConfirmMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const problem = passwordProblem(password);
    setPasswordMsg(problem ?? '');
    setConfirmMsg(password === confirm ? '' : 'Passwords do not match.');
    if (problem || password !== confirm) return;

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      const fieldMsg = newPasswordError(err);
      if (fieldMsg) setPasswordMsg(fieldMsg);
      else setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      <img src={loginBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-bg)]/70 via-[var(--brand-bg)]/55 to-[var(--brand-bg)]/90" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10">
        <div className="bg-[var(--brand-bg)] p-8 text-center text-white border-b-2 border-[var(--brand-accent)]">
          <div className="w-16 h-16 bg-white p-1 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-white/10">
            <img src={logoImg} alt="Malabar Challengers Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white uppercase">Set a New Password</h1>
        </div>

        {!token ? (
          <div className="p-8 space-y-4 text-center">
            <p className="text-sm text-slate-700">This link is missing its reset code. Open the link from your email again, or request a new one.</p>
            <Link to="/login" className="text-sm font-semibold text-brand hover:underline">Back to sign in</Link>
          </div>
        ) : done ? (
          <div className="p-8 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">✓</div>
            <p className="text-sm text-slate-700">Your password has been changed. You can now sign in with it.</p>
            <Link to="/login" className="inline-block">
              <Button>Go to Sign In</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-5" noValidate>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {error}{' '}
                <Link to="/login" className="underline">Request a new link</Link>
              </div>
            )}
            <Input
              label="New Password"
              type="password"
              required
              autoFocus
              autoComplete="new-password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setPasswordMsg('');
              }}
              error={passwordMsg || undefined}
              helperText={PASSWORD_HINT}
              icon={<Lock className="w-4 h-4 text-slate-400" />}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={e => {
                setConfirm(e.target.value);
                setConfirmMsg('');
              }}
              error={confirmMsg || undefined}
              icon={<Lock className="w-4 h-4 text-slate-400" />}
            />
            <Button type="submit" isLoading={loading} className="w-full py-2.5 text-base font-bold">
              Save New Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
