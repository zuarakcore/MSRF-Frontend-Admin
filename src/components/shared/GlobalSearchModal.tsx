import React, { useState, useEffect } from 'react';
import { Search, X, Users, UserCheck, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/endpoints';
import { errorMessage } from '../../api/client';
import type { SearchHit } from '../../api/types';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GROUPS: {
  key: 'students' | 'coaches' | 'paymentSubmissions' | 'payments';
  label: string;
  icon: React.ReactNode;
  hover: string;
}[] = [
  { key: 'students', label: 'Students', icon: <Users className="w-3 h-3 text-blue-600" />, hover: 'hover:bg-blue-50/60 group-hover:text-blue-600' },
  { key: 'coaches', label: 'Coaches', icon: <UserCheck className="w-3 h-3 text-emerald-600" />, hover: 'hover:bg-emerald-50/60 group-hover:text-emerald-600' },
  { key: 'paymentSubmissions', label: 'Payment Submissions', icon: <CreditCard className="w-3 h-3 text-amber-600" />, hover: 'hover:bg-amber-50/60 group-hover:text-amber-700' },
  { key: 'payments', label: 'Receipts', icon: <FileText className="w-3 h-3 text-purple-600" />, hover: 'hover:bg-purple-50/60 group-hover:text-purple-700' },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search as the user types, without a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const search = useQuery({
    queryKey: ['search', debounced],
    queryFn: () => dashboardApi.search(debounced),
    enabled: isOpen && debounced.length >= 2,
  });

  if (!isOpen) return null;

  const results = search.data;
  const hasResults = results ? GROUPS.some(g => results[g.key].length > 0) : false;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  const renderHit = (hit: SearchHit, hover: string) => (
    <div
      key={hit.id}
      onClick={() => handleSelect(hit.link)}
      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer group transition-colors ${hover.split(' ')[0]}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 text-xs flex items-center justify-center border border-slate-200">
          {hit.title.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className={`text-xs font-bold text-slate-900 ${hover.split(' ')[1]}`}>{hit.title}</p>
          <p className="text-[11px] text-slate-500">{hit.subtitle}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in" onClick={onClose} />

      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search students, coaches, payments, receipts..."
            className="w-full text-base text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {debounced.length < 2 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">
              Type at least 2 characters to search across students, coaches, payments, and receipts.
            </div>
          ) : search.isLoading ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">Searching…</div>
          ) : search.error ? (
            <div className="text-center py-8 text-xs text-rose-600 font-medium">{errorMessage(search.error)}</div>
          ) : !hasResults ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              No matching records found for "{debounced}".
            </div>
          ) : (
            GROUPS.filter(g => results![g.key].length > 0).map(g => (
              <div key={g.key}>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 flex items-center gap-1.5">
                  {g.icon} {g.label} ({results![g.key].length})
                </h4>
                <div className="space-y-1">{results![g.key].map(hit => renderHit(hit, g.hover))}</div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Press ESC to exit</span>
          <span>MSRF Management Search</span>
        </div>
      </div>
    </div>
  );
};
