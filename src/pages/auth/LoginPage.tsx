import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { UserRole } from '../../types';
import logoImg from '../../assets/logo.png';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@msrf.org');
  const [password, setPassword] = useState('msrf2026admin#');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('SUPER_ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'SUPER_ADMIN') {
      setEmail('admin@msrf.org');
      setPassword('msrf2026admin#');
    } else {
      setEmail('rajesh.varma@msrf.org');
      setPassword('coach2026pass#');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, selectedRole);
      setLoading(false);
      if (selectedRole === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard');
      } else {
        navigate('/coach/dashboard');
      }
    } catch (err) {
      setLoading(false);
      setError('Invalid login credentials. Please try again.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
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

          <div className="mt-4 inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => handleQuickFill('SUPER_ADMIN')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedRole === 'SUPER_ADMIN' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('COACH')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedRole === 'COACH' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Coach Portal
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Email or Username"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@msrf.org"
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

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 font-medium text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Remember session
            </label>
            <span className="text-slate-400 font-medium">Django JWT Ready</span>
          </div>

          <Button
            type="submit"
            isLoading={loading}
            className="w-full py-2.5 text-base font-bold shadow-lg shadow-blue-500/20"
          >
            Sign In to Dashboard
          </Button>

          {/* Quick Credential Pre-fill Hint */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-[11px] text-slate-500">
            <p className="font-semibold text-slate-700">Demo Testing Quick Fill:</p>
            <div className="mt-1 flex justify-center gap-3 text-blue-600 font-semibold">
              <button type="button" onClick={() => handleQuickFill('SUPER_ADMIN')} className="hover:underline">
                Fill Admin Credentials
              </button>
              <span>•</span>
              <button type="button" onClick={() => handleQuickFill('COACH')} className="hover:underline">
                Fill Coach Credentials
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModal}
        onClose={() => {
          setForgotModal(false);
          setForgotSent(false);
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
              Check <b>{forgotEmail}</b> for instructions to reset your MSRF Coaching System credentials.
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
              <Button type="submit" size="sm">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <p className="text-center text-xs text-slate-400 mt-6 z-10">
        © 2026 Malabar Sports & Recreation Foundation. All rights reserved.
      </p>
    </div>
  );
};
