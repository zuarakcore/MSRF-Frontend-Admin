import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Save, Key } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { authApi } from '../../api/endpoints';
import { useNavigate } from 'react-router-dom';
import { errorMessage } from '../../api/client';
import { PASSWORD_HINT, PASSWORD_MIN_LENGTH, newPasswordError, passwordProblem } from '../../api/password';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newPasswordMsg, setNewPasswordMsg] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewPasswordMsg('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Please fill out all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Password Mismatch', message: 'New password and confirm password do not match.' });
      return;
    }
    const problem = passwordProblem(newPassword, user?.email);
    if (problem) {
      setNewPasswordMsg(problem);
      return;
    }

    setIsLoading(true);
    try {
      // The backend signs out every session, this one included, so no new token comes back.
      await authApi.changePassword(currentPassword, newPassword);
    } catch (err) {
      const fieldMsg = newPasswordError(err);
      if (fieldMsg) {
        setNewPasswordMsg(fieldMsg);
        return;
      }
      addToast({ type: 'error', title: 'Password Not Changed', message: errorMessage(err) });
      return;
    } finally {
      setIsLoading(false);
    }

    addToast({
      type: 'success',
      title: 'Password Updated',
      message: 'Please sign in again with your new password.'
    });
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <LayoutShell
      title="Super Admin Security Settings"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Settings' }]}
    >
      <div className="max-w-xl">
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <Card
            header={
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" /> Change Super Admin Password
              </h3>
            }
          >
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                icon={<Lock className="w-4 h-4 text-slate-400" />}
              />
              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                  setNewPasswordMsg('');
                }}
                placeholder={`Enter new password (min. ${PASSWORD_MIN_LENGTH} chars)`}
                autoComplete="new-password"
                error={newPasswordMsg || undefined}
                helperText={PASSWORD_HINT}
                icon={<Lock className="w-4 h-4 text-slate-400" />}
              />

              <Input
                label="Confirm New Password"
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                icon={<Lock className="w-4 h-4 text-slate-400" />}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading} icon={<Save className="w-4 h-4" />}>
              Update Super Admin Password
            </Button>
          </div>
        </form>
      </div>
    </LayoutShell>
  );
};
