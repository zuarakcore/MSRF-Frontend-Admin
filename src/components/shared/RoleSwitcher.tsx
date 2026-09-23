import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, UserCheck, RefreshCw } from 'lucide-react';
import { UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

export const RoleSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { role, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    if (newRole === 'SUPER_ADMIN') {
      navigate('/super-admin/dashboard');
    } else {
      navigate('/coach/dashboard');
    }
  };

  return (
    <div className={`flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 ${compact ? 'text-xs' : ''}`}>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 flex items-center gap-1">
        <RefreshCw className="w-3 h-3 text-slate-400" /> Role:
      </span>
      <button
        onClick={() => handleSwitch('SUPER_ADMIN')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
          role === 'SUPER_ADMIN'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Super Admin</span>
      </button>
      <button
        onClick={() => handleSwitch('COACH')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all ${
          role === 'COACH'
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        <span>Coach</span>
      </button>
    </div>
  );
};
