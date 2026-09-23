import React, { useState } from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { INITIAL_PERMISSIONS } from '../../mock-data/msrf-data';
import { ShieldCheck, Check, X, Save } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export const RolesPermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState(INITIAL_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<'SUPER_ADMIN' | 'COACH'>('SUPER_ADMIN');

  const { addToast } = useNotifications();

  const currentRoleObj = permissions.find(p => p.role === selectedRole) || permissions[0];

  const togglePermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export') => {
    setPermissions(prev =>
      prev.map(p => {
        if (p.role === selectedRole) {
          return {
            ...p,
            groups: p.groups.map(g => {
              if (g.module === module) {
                return { ...g, [action]: !g[action] };
              }
              return g;
            })
          };
        }
        return p;
      })
    );
  };

  const handleSaveMatrix = () => {
    addToast({ type: 'success', title: 'Permission Matrix Saved', message: `Permissions updated for ${currentRoleObj.roleName}.` });
  };

  return (
    <LayoutShell
      title="Dynamic Access Control & Permission Matrix"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Roles & Permissions' }]}
      actions={
        <Button size="sm" onClick={handleSaveMatrix} icon={<Save className="w-4 h-4" />}>
          Save Permission Matrix
        </Button>
      }
    >
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={selectedRole === 'SUPER_ADMIN' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedRole('SUPER_ADMIN')}
        >
          Super Admin Permissions
        </Button>
        <Button
          variant={selectedRole === 'COACH' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedRole('COACH')}
        >
          Coach Portal Permissions
        </Button>
      </div>

      <Card header={<h3 className="font-bold text-slate-900 text-sm">{currentRoleObj.roleName} Matrix — {currentRoleObj.description}</h3>}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">System Module</th>
                <th className="py-3 px-3 text-center">View</th>
                <th className="py-3 px-3 text-center">Create</th>
                <th className="py-3 px-3 text-center">Edit</th>
                <th className="py-3 px-3 text-center">Delete</th>
                <th className="py-3 px-3 text-center">Export Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {currentRoleObj.groups.map(grp => (
                <tr key={grp.module} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">{grp.label}</td>
                  {(['view', 'create', 'edit', 'delete', 'export'] as const).map(action => (
                    <td key={action} className="py-3 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={grp[action]}
                        onChange={() => togglePermission(grp.module, action)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </LayoutShell>
  );
};
