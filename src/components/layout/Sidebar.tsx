import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';
import logoImg from '../../assets/logo.png';
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
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 shadow-xl">
      {/* Brand Header with Attached Malabar Challengers Logo */}
      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-11 h-11 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/10">
            <img src={logoImg} alt="Malabar Challengers Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="text-sm font-black tracking-tight text-white leading-tight uppercase">MALABAR</h1>
              <p className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">CHALLENGERS MSRF</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {group.title}
              </h3>
            )}
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative',
                    isActive
                      ? role === 'COACH'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/30'
                        : 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn('w-5 h-5 shrink-0 transition-colors', isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {isActive && !collapsed && (
                    <span className="ml-auto w-1.5 h-5 bg-white rounded-full opacity-80" />
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Profile at Bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0">
        <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : 'justify-between')}>
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={user?.avatar || logoImg}
              alt="User Avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0 bg-white"
            />
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate font-medium">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Sports Coach'}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
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
          'hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl z-10 animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
