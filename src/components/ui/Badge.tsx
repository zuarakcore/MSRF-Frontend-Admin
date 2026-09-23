import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 
    | 'active' | 'inactive' | 'suspended'
    | 'paid' | 'pending' | 'overdue' | 'partially-paid'
    | 'verified' | 'rejected' | 'pending-verification'
    | 'neutral' | 'blue' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', size = 'sm', className }) => {
  const styles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',

    pending: 'bg-amber-50 text-amber-700 border-amber-200/80',
    'pending-verification': 'bg-amber-50 text-amber-700 border-amber-200/80',
    'partially-paid': 'bg-blue-50 text-blue-700 border-blue-200/80',

    overdue: 'bg-rose-50 text-rose-700 border-rose-200/80',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200/80',
    suspended: 'bg-rose-50 text-rose-700 border-rose-200/80',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',

    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs font-medium' : 'px-3 py-1 text-sm font-medium';

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border tracking-tight', styles[variant] || styles.neutral, sizeClass, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 shrink-0" />
      {children}
    </span>
  );
};
