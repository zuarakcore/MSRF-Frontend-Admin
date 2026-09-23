import React from 'react';
import { cn } from '../../utils/cn';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  badgeText?: string;
  badgeVariant?: 'blue' | 'emerald' | 'amber' | 'rose';
  linkTo?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  badgeText,
  badgeVariant = 'blue',
  linkTo,
  className,
  onClick,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (onClick) onClick();
    if (linkTo) navigate(linkTo);
  };

  const iconBgMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group',
        (linkTo || onClick) && 'cursor-pointer hover:border-blue-200',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-black tracking-tight text-slate-900 mt-1.5">{value}</h3>
        </div>
        <div className={cn('p-3 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105', iconBgMap[badgeVariant])}>
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {trend ? (
          <span className={cn('inline-flex items-center gap-0.5 font-bold', trend.isPositive !== false ? 'text-emerald-600' : 'text-rose-600')}>
            {trend.isPositive !== false ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend.value}
          </span>
        ) : subtitle ? (
          <span className="text-slate-500 font-medium">{subtitle}</span>
        ) : (
          <span />
        )}

        {badgeText && (
          <span className={cn('px-2 py-0.5 text-[11px] font-semibold rounded-full border', iconBgMap[badgeVariant])}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};
