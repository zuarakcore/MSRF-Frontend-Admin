import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { errorMessage } from '../../api/client';
import { authApi } from '../../api/endpoints';
import logoImg from '../../assets/logo.png';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

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

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotError('');
    try {
      await authApi.forgotPassword(forgotEmail.trim());
      setForgotSent(true);
    } catch (err) {
      setForgotError(errorMessage(err));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Graphic Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative z-10 animate-in zoom-in-95 duration-300">
        {/* Header Branding */}
        <div className="bg-slate-950 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/10 p-1.5 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg border border-white/20">
            <img src={logoImg} alt="Malabar Challengers Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white uppercase">MALABAR CHALLENGERS</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Coaching & Management System</p>

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
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setForgotModal(true)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full py-2.5 text-base font-bold shadow-lg shadow-blue-500/20"
          >
            Sign In to Dashboard
          </Button>

        </form>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModal}
        onClose={() => {
          setForgotModal(false);
          setForgotSent(false);
          setForgotError('');
        }}
        title="Reset Password"
      >
        {forgotSent ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              ✓
            </div>
            <h4 className="text-sm font-bold text-slate-900">Password Reset Email Sent</h4>
            <p className="text-xs text-slate-600">
              If <b>{forgotEmail}</b> belongs to an account, a reset link has been sent to it.
            </p>
            <Button onClick={() => setForgotModal(false)} size="sm" className="mt-2">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Enter your registered email address and we will send you a reset link.
            </p>
            {forgotError && <p className="text-xs font-semibold text-rose-600">{forgotError}</p>}
            <Input
              label="Email Address"
              type="email"
              required
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              placeholder="e.g. admin@msrf.org"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setForgotModal(false)} size="sm">
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={forgotLoading}>
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <p className="text-center text-xs text-slate-400 mt-6 z-10">
        © 2026 Malabar Challengers Football Club. All rights reserved.
      </p>
    </div>
  );
};
