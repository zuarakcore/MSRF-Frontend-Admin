import React, { useState, useEffect } from 'react';
import { Search, X, Users, UserCheck, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { INITIAL_STUDENTS, INITIAL_COACHES, INITIAL_PAYMENTS, INITIAL_INVOICES } from '../../mock-data/msrf-data';

export interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
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

  if (!isOpen) return null;

  const filteredStudents = query.trim()
    ? INITIAL_STUDENTS.filter(s =>
        s.fullName.toLowerCase().includes(query.toLowerCase()) ||
        s.studentId.toLowerCase().includes(query.toLowerCase()) ||
        (s.category && s.category.toLowerCase().includes(query.toLowerCase())) ||
        (s.course && s.course.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 4)
    : [];

  const filteredCoaches = query.trim()
    ? INITIAL_COACHES.filter(c =>
        c.fullName.toLowerCase().includes(query.toLowerCase()) ||
        c.specialization.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredPayments = query.trim()
    ? INITIAL_PAYMENTS.filter(p =>
        p.submissionNo.toLowerCase().includes(query.toLowerCase()) ||
        p.studentName.toLowerCase().includes(query.toLowerCase()) ||
        p.transactionId.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredInvoices = query.trim()
    ? INITIAL_INVOICES.filter(i =>
        i.invoiceNumber.toLowerCase().includes(query.toLowerCase()) ||
        i.studentName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasResults = filteredStudents.length > 0 || filteredCoaches.length > 0 || filteredPayments.length > 0 || filteredInvoices.length > 0;

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
    setQuery('');
  };

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
            placeholder="Search students, coaches, payments, invoices..."
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
          {!query.trim() ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">
              Type keywords to search across students, coaches, payments, and invoices.
            </div>
          ) : !hasResults ? (
            <div className="text-center py-8 text-xs text-slate-500 font-medium">
              No matching records found for "{query}".
            </div>
          ) : (
            <>
              {/* Students Group */}
              {filteredStudents.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-blue-600" /> Students ({filteredStudents.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredStudents.map(s => (
                      <div
                        key={s.id}
                        onClick={() => handleSelect(`/super-admin/students/${s.id}`)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/60 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 text-xs flex items-center justify-center border border-slate-200">
                            {s.fullName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">{s.fullName}</p>
                            <p className="text-[11px] text-slate-500">{s.studentId} • {s.course}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Coaches Group */}
              {filteredCoaches.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-emerald-600" /> Coaches ({filteredCoaches.length})
                  </h4>
                  <div className="space-y-1">
                    {filteredCoaches.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelect(`/super-admin/coaches/${c.id}`)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/60 cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img src={c.photo} alt={c.fullName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">{c.fullName}</p>
                            <p className="text-[11px] text-slate-500">{c.specialization} • {c.assignedStudentsCount} Trainees</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payments Group */}
              {filteredPayments.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3 text-amber-600" /> Payment Submissions
                  </h4>
                  <div className="space-y-1">
                    {filteredPayments.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSelect('/super-admin/payments')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/60 cursor-pointer group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700">{p.submissionNo} - {p.studentName}</p>
                          <p className="text-[11px] text-slate-500">₹{p.amount.toLocaleString('en-IN')} • {p.transactionId}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices Group */}
              {filteredInvoices.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3 h-3 text-purple-600" /> Invoices
                  </h4>
                  <div className="space-y-1">
                    {filteredInvoices.map(inv => (
                      <div
                        key={inv.id}
                        onClick={() => handleSelect('/super-admin/invoices')}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/60 cursor-pointer group transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">{inv.invoiceNumber} - {inv.studentName}</p>
                          <p className="text-[11px] text-slate-500">Total ₹{inv.totalAmount.toLocaleString('en-IN')} • {inv.paymentStatus}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
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
