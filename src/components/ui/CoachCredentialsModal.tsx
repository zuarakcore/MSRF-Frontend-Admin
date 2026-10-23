import React, { useState } from 'react';
import { Key, Copy, Check, Shield, Send, Info } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Coach } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { useCoachPasswordReset } from './useCoachPasswordReset';

export interface CoachCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coach: Coach | null;
}

/**
 * Coach login details, including the current sign-in password the API returns for admins.
 * Coaches added before passwords were stored have none until the admin re-sends the invite.
 */
export const CoachCredentialsModal: React.FC<CoachCredentialsModalProps> = ({
  isOpen,
  onClose,
  coach,
}) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useNotifications();
  const { sendLink, pending, canSendLink } = useCoachPasswordReset();

  if (!coach) return null;

  const loginUrl = `${window.location.origin}/login`;

  const handleCopy = () => {
    const password = coach.tempPassword ? `\nPassword: ${coach.tempPassword}` : '';
    navigator.clipboard.writeText(`MSRF COACH PORTAL LOGIN:\nLogin URL: ${loginUrl}\nUsername / Email: ${coach.email}${password}`);
    setCopied(true);
    addToast({ type: 'success', title: 'Login Details Copied', message: `Login details for ${coach.fullName} copied.` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Coach Login & Password" size="md">
      <div className="space-y-4 py-1">
        <div className="flex items-center gap-3 p-3 bg-blue-50/80 rounded-2xl border border-blue-100">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">{coach.fullName}</h4>
            <p className="text-xs text-blue-700 font-semibold">{coach.specialization || 'No categories assigned'}</p>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono border border-slate-800 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
              Login Username / Email
            </span>
            <p className="text-sm font-bold text-emerald-400 select-all break-all">{coach.email}</p>
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
              Password
            </span>
            {coach.tempPassword ? (
              <p className="text-sm font-bold text-emerald-400 select-all break-all">{coach.tempPassword}</p>
            ) : (
              <p className="text-sm text-slate-300 font-sans">Not available — use Resend Invite to issue one</p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>
            Keep this password private. Share it only with the coach.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-600" /> Coach Portal Access
          </span>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied!' : 'Copy Login Details'}
            </Button>
            {canSendLink(coach) && (
              <Button
                type="button"
                size="sm"
                isLoading={pending}
                onClick={() => sendLink(coach)}
                icon={<Send className="w-4 h-4" />}
              >
                Resend Invite Link
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
