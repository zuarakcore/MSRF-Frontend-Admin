import React from 'react';

export interface StatusToggleProps {
  status: 'Active' | 'Inactive';
  onChange: (newStatus: 'Active' | 'Inactive') => void;
  disabled?: boolean;
  className?: string;
}

export const StatusToggle: React.FC<StatusToggleProps> = ({
  status,
  onChange,
  disabled = false,
  className = '',
}) => {
  const isActive = status === 'Active';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(isActive ? 'Inactive' : 'Active');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border shadow-2xs select-none cursor-pointer ${
        isActive
          ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600'
          : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={`Click to set status to ${isActive ? 'Inactive' : 'Active'}`}
    >
      <span
        className={`w-2 h-2 rounded-full transition-transform ${
          isActive ? 'bg-white shadow-xs' : 'bg-slate-500'
        }`}
      />
      <span>{isActive ? 'Active' : 'Inactive'}</span>
    </button>
  );
};
