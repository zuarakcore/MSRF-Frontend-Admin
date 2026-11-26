import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
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
  /** Show a search box at the top of the list (for long lists). Arrow keys + Enter pick options. */
  searchable?: boolean;
  searchPlaceholder?: string;
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
  searchable = false,
  searchPlaceholder = 'Search…',
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const close = () => {
    setOpen(false);
    setQuery('');
    setActive(0);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
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
  const needle = query.trim().toLowerCase();
  const visible = needle ? options.filter(o => o.label.toLowerCase().includes(needle)) : options;
  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(i => Math.min(i + 1, visible.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visible[active]) toggle(visible[active].value);
    }
  };

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
          onClick={() => (open ? close() : setOpen(true))}
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
          <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          {searchable && (
            <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onSearchKey}
                placeholder={searchPlaceholder}
                aria-controls={listId}
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {selected.length > 0 && (
                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap">{selected.length} selected</span>
              )}
            </div>
          )}
          <ul
            id={listId}
            role="listbox"
            aria-multiselectable
            className="max-h-60 overflow-auto py-1"
          >
            {visible.length === 0 && (
              <li className="px-3 py-2 text-xs text-slate-400">{needle ? `No match for "${query.trim()}".` : emptyText}</li>
            )}
            {visible.map((o, i) => {
              const checked = value.includes(o.value);
              return (
                <li
                  key={o.value}
                  role="option"
                  aria-selected={checked}
                  onClick={() => toggle(o.value)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-slate-50',
                    searchable && i === active && 'bg-slate-50',
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
          </div>
        )}
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
};
