import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Calendar, Award, Users } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { StatusToggle } from './StatusToggle';
import { CareerCMS } from '../../types';

export interface CareerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  career: CareerCMS | null;
  onStatusChange?: (id: string, newStatus: 'Active' | 'Inactive') => void;
}

export const CareerDetailModal: React.FC<CareerDetailModalProps> = ({
  isOpen,
  onClose,
  career,
  onStatusChange,
}) => {
  const [localStatus, setLocalStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    if (career) {
      setLocalStatus(career.status === 'Open' ? 'Active' : 'Inactive');
    }
  }, [career]);

  if (!career) return null;

  const handleToggleStatus = (newStatus: 'Active' | 'Inactive') => {
    setLocalStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(career.id, newStatus);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Career Opening Details" size="lg">
      <div className="space-y-5 py-1">
        {/* Header Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block font-mono">
              JOB POSITION
            </span>
            <h3 className="text-xl font-black text-slate-900">{career.position}</h3>
          </div>
          {onStatusChange && (
            <StatusToggle
              status={localStatus}
              onChange={handleToggleStatus}
            />
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Location:
            </span>
            <p className="font-bold text-slate-800">{career.location}</p>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Posted Date:
            </span>
            <p className="font-bold text-slate-800 font-mono">{career.postedDate}</p>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" /> Closing Date:
            </span>
            <p className="font-bold text-rose-600 font-mono">{career.closingDate || 'Open until filled'}</p>
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Required Exp:
            </span>
            <p className="font-bold text-slate-800">{career.experienceRequired}</p>
          </div>
        </div>

        {/* Full Job Description Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Full Job Description & Key Responsibilities
          </h4>
          <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-xs leading-relaxed font-sans border border-slate-800 whitespace-pre-line">
            {career.jobDescription}
          </div>
        </div>

        {/* Application Count Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" /> Total Applications Received: {career.applicationsCount}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
