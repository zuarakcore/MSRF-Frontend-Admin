import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Lock, Save, Key } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const SettingsPage: React.FC = () => {
  const { addToast } = useNotifications();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast({ type: 'error', title: 'Validation Error', message: 'Please fill out all password fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Password Mismatch', message: 'New password and confirm password do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      addToast({ type: 'error', title: 'Weak Password', message: 'New password must be at least 6 characters long.' });
      return;
    }

    setIsLoading(true);
    await new Promise(res => setTimeout(res, 600));
    setIsLoading(false);

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    addToast({
      type: 'success',
      title: 'Password Updated',
      message: 'Super Admin security credentials updated successfully.'
    });
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
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
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
