import React from 'react';
import logoImg from '../../assets/logo.png';

interface ReportHeaderProps {
  title: string;
  date: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ title, date }) => {
  return (
    <div className="border-b-4 border-amber-400 pb-4 mb-6">
      <div className="flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3.5">
          <img src={logoImg} alt="Malabar Challengers Logo" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase leading-none">
              MALABAR CHALLENGERS
            </h1>
            <p className="text-xs font-black text-amber-600 uppercase tracking-widest mt-1">
              FOOTBALL CLUB & SPORTS ACADEMY
            </p>
          </div>
        </div>

        {/* Right Badge & Date */}
        <div className="text-right">
          <div className="bg-amber-400 text-slate-900 font-black text-xs uppercase px-3.5 py-1.5 rounded shadow-2xs inline-block">
            {title}
          </div>
          <p className="text-xs font-black text-slate-700 uppercase tracking-wider mt-1.5 font-mono">
            DATE: {date}
          </p>
        </div>
      </div>
    </div>
  );
};
