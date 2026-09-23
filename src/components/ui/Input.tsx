import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  isPhone?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  helperText,
  icon,
  required,
  id,
  isPhone,
  onChange,
  type,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const isTelType = isPhone || type === 'tel';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isTelType) {
      // Restrict alphabets & symbols, keep numbers only, cap at 10 digits
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          onChange={handleChange}
          maxLength={isTelType ? 10 : props.maxLength}
          className={cn(
            'w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-500',
            icon && 'pl-9',
            error && 'border-rose-500 focus:ring-rose-500 focus:border-rose-500',
            className
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : isTelType ? (
        <p className="text-[11px] text-slate-400">Must be 10-digit mobile number</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
