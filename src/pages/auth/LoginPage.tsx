import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { errorMessage } from '../../api/client';
import logoImg from '../../assets/logo.png';
import loginBg from '../../assets/login-bg.jpg';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to={role === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/coach/dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const signedInRole = await login(email.trim(), password);
      navigate(signedInRole === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/coach/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Invalid login credentials. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-bg)] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background: the website's floodlit stadium, darkened, with a brand-green glow */}
      <img src={loginBg} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--brand-bg)]/70 via-[var(--brand-bg)]/55 to-[var(--brand-bg)]/90" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--brand-accent), transparent 65%)' }}
      />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
        {/* Header Branding */}
        <div className="bg-[var(--brand-bg)] p-8 text-center text-white relative border-b-2 border-[var(--brand-accent)]">
          <div className="w-16 h-16 bg-white p-1 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-white/10">
            <img src={logoImg} alt="Malabar Challengers Logo" className="w-full h-full object-contain rounded-full" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white uppercase">MALABAR CHALLENGERS</h1>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent)] mt-1">Coaching & Management System</p>

        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="username"
            icon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                placeholder="••••••••"
              />
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full py-2.5 text-base font-bold shadow-lg shadow-brand/25"
          >
            Sign In to Dashboard
          </Button>

        </form>
      </div>

      <p className="text-center text-xs text-neutral-400 mt-6 z-10 relative">
        © 2026 Malabar Challengers Football Club. All rights reserved.
      </p>
      <p className="text-center text-[11px] text-neutral-500 mt-1 z-10 relative">
        Crafted by Zuarak
      </p>
    </div>
  );
};
