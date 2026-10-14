import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import logoImg from '../../assets/logo.png';
import { avatarFor } from '../../api/photos';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserPlus,
  CalendarCheck,
  CreditCard,
  CheckCircle2,
  FileText,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Award,
  Layers,
  Briefcase,
  Image as ImageIcon,
  MessageSquare,
  FileCheck,
  Tag,
  MapPin
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  const superAdminNav = [
    { title: 'MAIN MENU', items: [
      { label: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
      { label: 'Students', path: '/super-admin/students', icon: Users },
      { label: 'Coaches', path: '/super-admin/coaches', icon: UserCheck },
      { label: 'Program Types', path: '/super-admin/program-types', icon: Layers },
      { label: 'Training Centers', path: '/super-admin/training-centers', icon: MapPin },
    ]},
    { title: 'ACADEMICS & FINANCE', items: [
      { label: 'Attendance', path: '/super-admin/attendance', icon: CalendarCheck },
      { label: 'Fee Management', path: '/super-admin/fees', icon: CreditCard },
      { label: 'Payment Verification', path: '/super-admin/payments', icon: CheckCircle2 },
      { label: 'Reports Center', path: '/super-admin/reports', icon: BarChart3 },
    ]},
    { title: 'WEBSITE DYNAMIC CONTENT', items: [
      { label: 'Categories', path: '/super-admin/website/categories', icon: Tag },
      { label: 'Programmes', path: '/super-admin/website/programmes', icon: Layers },
      { label: 'Team', path: '/super-admin/website/team', icon: Users },
      { label: 'Gallery', path: '/super-admin/website/gallery', icon: ImageIcon },
      { label: 'Careers', path: '/super-admin/website/careers', icon: Briefcase },
      { label: 'Job Applications', path: '/super-admin/website/job-applications', icon: FileCheck },
      { label: 'Contact Enquiries', path: '/super-admin/website/enquiries', icon: MessageSquare },
    ]},
    { title: 'SYSTEM', items: [
      { label: 'Notifications', path: '/super-admin/notifications', icon: Bell },
      { label: 'Settings', path: '/super-admin/settings', icon: Settings },
    ]}
  ];

  const coachNav = [
    { title: 'COACH PORTAL', items: [
      { label: 'My Dashboard', path: '/coach/dashboard', icon: LayoutDashboard },
      { label: 'Daily Attendance', path: '/coach/attendance', icon: CalendarCheck },
      { label: 'Performance Ratings', path: '/coach/performance', icon: Award },
    ]}
  ];

  const activeRef = React.useRef<HTMLAnchorElement | null>(null);

  React.useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }, [location.pathname]);

  const navGroups = role === 'SUPER_ADMIN' ? superAdminNav : coachNav;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--brand-bg)] text-neutral-300">
      {/* Brand */}
      <div className={cn('h-16 px-4 flex items-center shrink-0 border-b border-white/[0.08]', collapsed ? 'justify-center' : 'justify-between')}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-white p-0.5 flex items-center justify-center shrink-0 ring-1 ring-white/10">
            <img src={logoImg} alt="Malabar Challengers" className="w-full h-full object-contain rounded-full" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-extrabold tracking-tight text-white leading-tight truncate">Malabar Challengers</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-accent)] truncate">
                {role === 'SUPER_ADMIN' ? 'Admin Portal' : 'Coach Portal'}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-full text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex mx-auto mt-3 p-1.5 rounded-full text-neutral-500 hover:text-white hover:bg-white/[0.06] transition-colors"
          title="Expand sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {!collapsed ? (
              <p className="px-3 mb-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-[0.18em]">{group.title}</p>
            ) : (
              idx > 0 && <div className="mx-3 mb-3 border-t border-white/[0.08]" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                return (
                  <NavLink
                    key={item.path}
                    ref={isActive ? activeRef : undefined}
                    to={item.path}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isMobileOpen) onCloseMobile();
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-full text-[13px] font-medium transition-colors',
                      collapsed ? 'justify-center h-10 w-10 mx-auto' : 'px-3.5 py-2',
                      isActive
                        ? 'bg-[var(--brand-accent)] text-[var(--brand-accent-foreground)] font-semibold'
                        : 'text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Signed-in user */}
      <div className="p-3 shrink-0 border-t border-white/[0.08]">
        <div
          className={cn(
            'flex items-center gap-3 rounded-2xl bg-[var(--brand-surface)] border border-white/[0.06]',
            collapsed ? 'justify-center p-2' : 'p-2.5'
          )}
        >
          <img
            src={user?.avatar || avatarFor(user?.name || 'MSRF')}
            alt={user?.name ?? 'User'}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-neutral-500 truncate">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Coach'}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 rounded-full text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside
        className={cn(
          // Floating panel: inset from the screen edges, rounded, with a soft shadow.
          'hidden md:block fixed top-3 left-3 bottom-3 z-30 transition-all duration-300 rounded-3xl overflow-hidden shadow-xl shadow-slate-900/15',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed top-3 bottom-3 left-3 w-72 rounded-3xl overflow-hidden bg-[var(--brand-bg)] shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
