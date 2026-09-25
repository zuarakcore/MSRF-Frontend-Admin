import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Printer, X } from 'lucide-react';

export interface PrintPortalProps {
  title?: string;
  onClose?: () => void;
  children: React.ReactNode;
}

export const PrintPortal: React.FC<PrintPortalProps> = ({ title = 'PDF DOCUMENT PREVIEW', onClose, children }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  useEffect(() => {
    // Automatically trigger native browser print dialog after portal mounts
    const timer = setTimeout(() => {
      window.print();
    }, 300);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible) return null;

  return ReactDOM.createPortal(
    <div className="printable-document fixed inset-0 bg-slate-950/85 z-[99999] overflow-y-auto print:static print:bg-white print:overflow-visible font-sans text-slate-900">
      {/* Floating Action Bar (Hidden during actual print) */}
      <div className="no-print sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-50 text-white shadow-2xl">
        <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider font-mono">
          {title}
        </h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer border-0"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer border-0"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" /> Close Preview
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-8 max-w-4xl mx-auto print:p-0">
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl print:shadow-none print:p-0 print:rounded-none space-y-6">
          {children}

          {/* Bottom Action Bar (Hidden during print) */}
          <div className="no-print pt-6 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer border border-slate-300"
            >
              <X className="w-4 h-4 text-slate-500" /> Close Document
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer border-0"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
