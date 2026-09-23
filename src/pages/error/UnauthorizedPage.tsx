import React from 'react';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
  const { role, switchRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-slate-800/80 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-md">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">403 - Access Restricted</h1>
          <p className="text-sm text-slate-400 mt-2">
            You do not have authorization to view this module. Current active role is{' '}
            <span className="font-bold text-blue-400">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Coach'}</span>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/80 text-xs text-slate-300 text-left space-y-2">
          <p className="font-semibold text-slate-200">Role Restriction Rules:</p>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>Coaches can only access assigned trainees & daily attendance.</li>
            <li>Financial ledgers, payments, CMS, and settings require Super Admin access.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(role === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/coach/dashboard')}
            icon={<ArrowLeft className="w-4 h-4" />}
            className="w-full sm:w-auto bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
          >
            Back to Dashboard
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              switchRole('SUPER_ADMIN');
              navigate('/super-admin/dashboard');
            }}
            icon={<RefreshCw className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Switch to Super Admin
          </Button>
        </div>
      </div>
    </div>
  );
};
