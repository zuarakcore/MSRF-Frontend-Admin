import React, { createContext, useCallback, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SystemNotification } from '../types';
import { notificationsApi } from '../api/endpoints';
import type { NotificationOut } from '../api/types';
import { useAuth } from './AuthContext';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface NotificationContextType {
  notifications: SystemNotification[];
  unreadCount: number;
  toasts: Toast[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const FEED_SIZE = 50;

const timeAgo = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const toNotification = (n: NotificationOut): SystemNotification => ({
  id: n.id,
  title: n.title,
  message: n.message,
  type: n.type,
  timestamp: timeAgo(n.createdAt),
  read: Boolean(n.readAt),
  link: n.link ?? undefined,
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { isAuthenticated, role } = useAuth();
  const queryClient = useQueryClient();
  // Notifications go to admins (payments, admissions, enquiries, applications).
  const enabled = isAuthenticated && role === 'SUPER_ADMIN';

  const feed = useQuery({
    queryKey: ['notifications', 'feed'],
    queryFn: () => notificationsApi.list({ page: 1, pageSize: FEED_SIZE }),
    enabled,
    refetchInterval: 60_000,
  });
  // The backend recommends polling the unread count every 60 s while the tab is visible.
  const unread = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationsApi.unreadCount,
    enabled,
    refetchInterval: 60_000,
  });

  const notifications = enabled ? (feed.data?.items ?? []).map(toNotification) : [];
  const unreadCount = enabled ? (unread.data?.count ?? 0) : 0;

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    [queryClient]
  );

  const markAsRead = (id: string) => {
    if (notifications.find(n => n.id === id)?.read) return;
    notificationsApi.markRead(id).then(refresh, refresh);
  };

  const markAllAsRead = () => {
    notificationsApi.markAllRead().then(refresh, refresh);
  };

  const addToast = ({ type, title, message }: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        markAsRead,
        markAllAsRead,
        addToast,
        removeToast
      }}
    >
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border text-sm transition-all duration-300 animate-in slide-in-from-right-5 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-50 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-50 border-rose-700'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-amber-50 border-amber-700'
                : 'bg-slate-900 text-slate-50 border-slate-700'
            }`}
          >
            <div className="flex-1">
              <p className="font-semibold">{toast.title}</p>
              {toast.message && <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-xs opacity-70 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
