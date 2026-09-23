import React from 'react';
import { Search, X, LayoutGrid, List, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
}

export interface ActiveChip {
  key: string;
  label: string;
  displayValue: string;
  onRemove: () => void;
}

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  activeChips?: ActiveChip[];
  onClearAll?: () => void;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  actions?: React.ReactNode;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  activeChips = [],
  onClearAll,
  viewMode,
  onViewModeChange,
  actions,
}) => {
  const hasActiveFilters = Boolean(
    (searchValue && searchValue.trim() !== '') ||
    filters.some(f => f.value && f.value !== 'all' && f.value !== '' && f.value !== 'ALL') ||
    activeChips.length > 0
  );

  return (
    <div className="space-y-3">
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {filters.map(f => (
            <div key={f.key} className="relative">
              <select
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {f.options.map((opt, i) => (
                  <option key={i} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Reset button when search or filter is active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                filters.forEach(f => f.onChange('all'));
                if (onClearAll) onClearAll();
              }}
              className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-2xs"
              title="Reset search & filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* View Mode Toggle (Grid / List) */}
          {onViewModeChange && viewMode && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}

          {actions}
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Active Filters:
          </span>
          {activeChips.map(chip => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium"
            >
              <span className="text-blue-500">{chip.label}:</span>
              <span>{chip.displayValue}</span>
              <button
                onClick={chip.onRemove}
                className="hover:text-rose-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {onClearAll && (
            <button
              onClick={onClearAll}
              className="text-xs text-rose-600 hover:underline font-semibold ml-2"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};
