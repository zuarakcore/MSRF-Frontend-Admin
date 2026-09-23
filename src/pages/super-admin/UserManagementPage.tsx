import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { INITIAL_USERS } from '../../mock-data/msrf-data';
import { UserProfile, UserRole } from '../../types';
import { UserCog, UserPlus, Key, Shield } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'COACH' as UserRole });

  const { addToast } = useNotifications();

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      status: 'Active',
      lastLogin: 'Never',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    setUsers([...users, newUser]);
    setModal(false);
    addToast({ type: 'success', title: 'User Account Created', message: `${newUser.name} registered.` });
  };

  return (
    <LayoutShell
      title="System User Accounts & Login Access"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Users' }]}
      actions={
        <Button size="sm" onClick={() => setModal(true)} icon={<UserPlus className="w-4 h-4" />}>
          Create System Account
        </Button>
      }
    >
      <Card header={<h3 className="font-bold text-slate-900 text-sm">System Users Directory</h3>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Last Login</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{u.email}</td>
                  <td className="py-3 px-3 font-bold text-blue-600">{u.role}</td>
                  <td className="py-3 px-3 text-slate-500">{u.lastLogin}</td>
                  <td className="py-3 px-3 text-slate-500">{u.createdAt}</td>
                  <td className="py-3 px-3"><Badge variant={u.status === 'Active' ? 'active' : 'inactive'}>{u.status}</Badge></td>
                  <td className="py-3 px-3 text-right">
                    <Button size="sm" variant="outline" icon={<Key className="w-3.5 h-3.5" />} onClick={() => addToast({ type: 'info', title: 'Reset Sent', message: `Password reset email sent to ${u.email}` })}>
                      Reset Pass
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modal} onClose={() => setModal(false)} title="Create System Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input label="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Email Address" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
          <Select
            label="Assigned System Role"
            options={[
              { label: 'Super Admin', value: 'SUPER_ADMIN' },
              { label: 'Coach Portal', value: 'COACH' }
            ]}
            value={formData.role}
            onChange={e => setFormData({ ...formData, role: e.target.value as any })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </LayoutShell>
  );
};
