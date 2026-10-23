import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MultiSelectProps {
  label?: string;
  helperText?: string;
  required?: boolean;
  error?: string;
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyText?: string;
}

/** Dropdown with checkboxes; the chosen options show as removable chips in the field. */
export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  helperText,
  required,
  error,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  emptyText = 'No options available.',
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  const toggle = (v: string) => onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  const selected = options.filter(o => value.includes(o.value));

  return (
    <div ref={rootRef} className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      {helperText && <p className="text-[11px] text-slate-500 -mt-1">{helperText}</p>}
      <div className="relative">
        <div
          role="combobox"
          tabIndex={0}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen(o => !o)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            'w-full min-h-[38px] bg-white border border-slate-300 rounded-lg pl-2.5 pr-9 py-1.5 text-sm text-slate-900 cursor-pointer flex flex-wrap items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all',
            open && 'ring-2 ring-brand/40 border-brand',
            error && 'border-rose-500'
          )}
        >
          {selected.length === 0 ? (
            <span className="px-1 text-slate-400">{placeholder}</span>
          ) : (
            selected.map(o => (
              <span
                key={o.value}
                className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-semibold text-blue-700"
              >
                {o.label}
                <button
                  type="button"
                  aria-label={`Remove ${o.label}`}
                  onClick={e => {
                    e.stopPropagation();
                    toggle(o.value);
                  }}
                  className="text-blue-400 hover:text-blue-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
          <ChevronDown
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none transition-transform',
              open && 'rotate-180'
            )}
          />
        </div>

        {open && (
          <ul
            id={listId}
            role="listbox"
            aria-multiselectable
            className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {options.length === 0 && <li className="px-3 py-2 text-xs text-slate-400">{emptyText}</li>}
            {options.map(o => {
              const checked = value.includes(o.value);
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={checked}
                  onClick={() => toggle(o.value)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50',
                    checked ? 'text-blue-700 font-semibold' : 'text-slate-700'
                  )}
                >
                  <span
                    className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center shrink-0',
                      checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    )}
                  >
                    {checked && <Check className="w-3 h-3" />}
                  </span>
                  {o.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
