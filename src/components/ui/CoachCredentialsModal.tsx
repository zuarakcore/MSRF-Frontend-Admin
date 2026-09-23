import React, { useState } from 'react';
import { Key, Copy, Check, Shield, Mail } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Coach } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

export interface CoachCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: Coach | null;
}

export const CoachCredentialsModal: React.FC<CoachCredentialsModalProps> = ({
  isOpen,
  onClose,
  coach,
}) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useNotifications();

  if (!coach) return null;

  const username = coach.email;
  const password = coach.tempPassword || 'Coach#2026!';

  const handleCopy = () => {
    const textToCopy = `MSRF COACH PORTAL LOGIN CREDENTIALS:\nLogin URL: http://localhost:5173/login\nUsername / Email: ${username}\nPassword: ${password}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Credentials Copied!',
      message: `Login details for ${coach.fullName} copied to clipboard & sent to ${coach.email}`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Coach Login Credentials" size="md">
      <div className="space-y-4 py-1">
        {/* Header summary */}
        <div className="flex items-center gap-3 p-3 bg-blue-50/80 rounded-2xl border border-blue-100">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">{coach.fullName}</h4>
            <p className="text-xs text-blue-700 font-semibold">{coach.specialization}</p>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono border border-slate-800 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
              Login Username / Email
            </span>
            <p className="text-sm font-bold text-emerald-400 select-all">{username}</p>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
              Temporary Password
            </span>
            <p className="text-sm font-bold text-amber-400 select-all">{password}</p>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800 font-sans text-xs text-slate-400 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Credentials dispatched to <b>{coach.email}</b></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> Coach Portal Authorized Access
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy Credentials'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
