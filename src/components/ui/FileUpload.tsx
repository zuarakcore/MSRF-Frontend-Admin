import React, { useRef } from 'react';
import { UploadCloud, FileText, X, Check } from 'lucide-react';

export interface FileUploadProps {
  value?: string;
  onChange: (url: string, fileName?: string) => void;
  label?: string;
  accept?: string;
  error?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  label,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png',
  error,
  required,
  className = '',
  placeholder = 'Click to upload contract document (PDF, DOC, Images)'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group w-full p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">
                Contract Document Attached
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <Check className="w-3 h-3" /> Ready / File Loaded
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded-lg text-rose-500 hover:bg-rose-100 transition-colors"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-24 border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-700">
            {placeholder}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            PDF, DOCX, PNG, JPG (Max 10MB)
          </p>
        </div>
      )}

      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
};
