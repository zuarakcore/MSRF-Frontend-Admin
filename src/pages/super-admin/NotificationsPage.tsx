import React from 'react';
import { LayoutShell } from '../../components/layout/LayoutShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, CreditCard, UserPlus, CalendarCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <LayoutShell
      title="System Notifications & Alerts Feed"
      breadcrumb={[{ label: 'Super Admin' }, { label: 'Notifications' }]}
      actions={
        <Button size="sm" variant="outline" onClick={markAllAsRead} icon={<CheckCheck className="w-4 h-4" />}>
          Mark All as Read
        </Button>
      }
    >
      <Card header={<h3 className="font-bold text-slate-900 text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-blue-600" /> Notifications Feed</h3>}>
        <div className="divide-y divide-slate-100">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/40 font-semibold' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                  {n.type === 'PAYMENT' ? <CreditCard className="w-5 h-5" /> : n.type === 'ADMISSION' ? <UserPlus className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                </div>
              </div>
              {!n.read && (
                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </LayoutShell>
  );
};
