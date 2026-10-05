import React from 'react';
import { Award, Star } from 'lucide-react';
import { PerformanceRecord } from '../../types';
import { formatDate } from '../../utils/format';

/** The complete player development report (all 15 skills, goals and remarks) for detail modals. */
export const PlayerReportDetail: React.FC<{ record: PerformanceRecord }> = ({ record }) => {
  const skills = record.skillAssessments ?? [];
  const goals = record.developmentGoals ?? [];

  return (
    <div className="space-y-4 text-xs">
      {/* Player & report header */}
      <div className="bg-amber-400 p-4 rounded-xl text-slate-900 flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-black uppercase">{record.studentName}</h3>
          <p className="text-[11px] font-bold text-slate-900/80">
            Position: {record.position || '—'} | Strong Foot: {record.strongFoot || '—'} | Coach: {record.coachName}
          </p>
          <p className="text-[11px] font-bold text-slate-900/80">
            Period: {record.reportPeriod || record.monthYear} • Evaluated: {formatDate(record.recordedDate)}
            {record.dob ? ` • DOB: ${formatDate(record.dob)}` : ''}
            {record.age ? ` • Age: ${record.age}` : ''}
          </p>
        </div>
        <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {record.overallRating} / 5
        </span>
      </div>

      {/* 15-skill breakdown */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-500" /> 15-Skill Performance Assessment
        </h4>
        {skills.length === 0 ? (
          <p className="text-slate-500">No skill ratings recorded.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {skills.map((sa, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-[11px] text-slate-900 uppercase">
                    {String(idx + 1).padStart(2, '0')}. {sa.category}
                  </span>
                  <span className="font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] flex items-center gap-0.5 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {sa.rating}/5
                  </span>
                </div>
                {sa.comments && <p className="text-[11px] text-slate-600 italic">{sa.comments}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strengths & areas for improvement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800">
        <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1">
          <p className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider">Player Strengths</p>
          <p className="whitespace-pre-line text-emerald-950 font-medium leading-relaxed">{record.strengths || '—'}</p>
        </div>
        <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
          <p className="font-extrabold text-rose-900 text-xs uppercase tracking-wider">Areas For Improvement</p>
          <p className="whitespace-pre-line text-rose-950 font-medium leading-relaxed">{record.areasForImprovement || '—'}</p>
        </div>
      </div>

      {/* Development goals */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
        <p className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Development Goals</p>
        {goals.length === 0 && !record.customGoal ? (
          <p className="text-slate-500">No goals set.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {goals.map((goal, gIdx) => (
                <span key={gIdx} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
                  ✓ {goal}
                </span>
              ))}
            </div>
            {record.customGoal && <p className="text-[11px] text-slate-700 font-semibold">Custom goal: {record.customGoal}</p>}
          </>
        )}
      </div>

      {/* Coach remarks */}
      <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200">
        <p className="font-extrabold text-blue-900 text-[10px] uppercase tracking-wider mb-1">Coach's Comments / Summary</p>
        <p className="italic text-blue-950 font-medium whitespace-pre-line">
          "{record.coachRemarks}" — <span className="font-bold not-italic">{record.coachName}</span>
        </p>
      </div>
    </div>
  );
};
