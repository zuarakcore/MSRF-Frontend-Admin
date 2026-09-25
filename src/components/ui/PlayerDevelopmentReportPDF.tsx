import React from 'react';
import { PerformanceRecord } from '../../types';
import { PrintPortal } from './PrintPortal';
import { ReportHeader } from './ReportHeader';
import { DEFAULT_15_CATEGORIES } from '../../mock-data/msrf-data';

interface PlayerDevelopmentReportPDFProps {
  record: PerformanceRecord;
  onClose: () => void;
}

export const PlayerDevelopmentReportPDF: React.FC<PlayerDevelopmentReportPDFProps> = ({ record, onClose }) => {
  const categories = record.skillAssessments && record.skillAssessments.length > 0
    ? record.skillAssessments
    : DEFAULT_15_CATEGORIES.map(cat => ({
        category: cat,
        rating: record.overallRating || record.rating || 4,
        comments: 'Good execution during training sessions.'
      }));

  const selectedGoals = record.developmentGoals || ['Improve weak foot', 'Improve first touch', 'Improve tactical awareness'];
  const allStandardGoals = [
    'Improve weak foot',
    'Improve first touch',
    'Improve passing accuracy',
    'Improve tactical awareness',
    'Improve finishing',
    'Improve fitness',
    'Improve communication'
  ];

  return (
    <PrintPortal title={`Player_Report_${record.studentName}_${record.recordedDate}`} onClose={onClose}>
      <div className="bg-white text-slate-900 font-sans space-y-5">
        
        {/* Top Header Matching Image 2 */}
        <ReportHeader title="PLAYER DEVELOPMENT REPORT" date={record.recordedDate} />

        {/* Date & Report Period */}
        <div className="grid grid-cols-2 gap-4 text-xs font-bold border-b-2 border-slate-800 pb-2">
          <div>
            <span className="font-black text-slate-900 uppercase">DATE: </span>
            <span className="border-b border-slate-400 px-2 font-mono">{record.recordedDate}</span>
          </div>
          <div className="text-right">
            <span className="font-black text-slate-900 uppercase">REPORT PERIOD: </span>
            <span className="border-b border-slate-400 px-2">{record.reportPeriod || record.monthYear || 'Monthly Evaluation'}</span>
          </div>
        </div>

        {/* Player Information Section */}
        <div className="space-y-2 text-xs">
          <h3 className="font-black text-center text-xs uppercase tracking-widest bg-slate-100 py-1 border border-slate-800">
            PLAYER INFORMATION
          </h3>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 font-bold">
            <div className="flex items-baseline">
              <span className="w-32 font-black uppercase">PLAYER NAME:</span>
              <span className="flex-1 border-b border-slate-400 font-extrabold text-slate-900">{record.studentName}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-24 font-black uppercase">POSITION:</span>
              <span className="flex-1 border-b border-slate-400 text-slate-900">{record.position || 'Attacking Midfielder'}</span>
            </div>
            <div className="flex items-baseline">
              <span className="w-32 font-black uppercase">DATE OF BIRTH:</span>
              <span className="flex-1 border-b border-slate-400 font-mono text-slate-900">{record.dob || '2012-05-14'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black uppercase">STRONG FOOT:</span>
              <div className="flex items-center gap-4 text-[11px]">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={record.strongFoot === 'Right' || record.strongFoot === 'Both'} readOnly className="w-3.5 h-3.5 accent-slate-900" />
                  <span>RIGHT</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={record.strongFoot === 'Left' || record.strongFoot === 'Both'} readOnly className="w-3.5 h-3.5 accent-slate-900" />
                  <span>LEFT</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={record.strongFoot === 'Both'} readOnly className="w-3.5 h-3.5 accent-slate-900" />
                  <span>BOTH</span>
                </label>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="w-32 font-black uppercase">AGE:</span>
              <span className="flex-1 border-b border-slate-400 font-mono text-slate-900">{record.age || '14'}</span>
            </div>
          </div>
        </div>

        {/* 15 Performance Assessment Table */}
        <div className="space-y-1 text-xs">
          <h3 className="font-black text-center text-xs uppercase tracking-widest bg-slate-900 text-white py-1 border border-slate-900">
            PERFORMANCE ASSESSMENT
          </h3>
          <table className="w-full border-collapse border-2 border-slate-900 text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-black uppercase text-[11px]">
                <th className="py-1.5 px-3 border border-slate-700 text-left w-2/5">CATEGORY</th>
                <th className="py-1.5 px-3 border border-slate-700 text-center w-1/4">RATING (1-5)</th>
                <th className="py-1.5 px-3 border border-slate-700 text-left w-1/3">COMMENTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-900">
              {categories.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="py-1 px-3 border border-slate-800 font-extrabold text-[11px] uppercase">{item.category}</td>
                  <td className="py-1 px-3 border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-3 font-mono font-bold text-[11px]">
                      {[1, 2, 3, 4, 5].map(num => (
                        <span
                          key={num}
                          className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${
                            item.rating === num
                              ? 'bg-slate-900 text-white font-black ring-2 ring-slate-900'
                              : 'text-slate-500'
                          }`}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-1 px-3 border border-slate-800 text-[11px] font-medium text-slate-800">
                    {item.comments || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom 3 Sections Grid Matching Image 2 */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          {/* Player Strengths */}
          <div className="border-2 border-slate-900 p-2.5 flex flex-col justify-between">
            <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-900 text-center border-b border-slate-400 pb-1 mb-1.5">
              PLAYER STRENGTHS
            </h4>
            <div className="flex-1 whitespace-pre-line font-medium text-slate-900 leading-relaxed text-[11px]">
              {record.strengths || '1. Outstanding stroke technique.\n2. Great work ethic.\n3. High discipline.'}
            </div>
          </div>

          {/* Areas For Improvement */}
          <div className="border-2 border-slate-900 p-2.5 flex flex-col justify-between">
            <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-900 text-center border-b border-slate-400 pb-1 mb-1.5">
              AREAS FOR IMPROVEMENT
            </h4>
            <div className="flex-1 whitespace-pre-line font-medium text-slate-900 leading-relaxed text-[11px]">
              {record.areasForImprovement || '1. Turn transitions.\n2. Explosive start block speed.'}
            </div>
          </div>

          {/* Development Goals Checkboxes */}
          <div className="border-2 border-slate-900 p-2.5 flex flex-col justify-between">
            <h4 className="font-black text-[11px] uppercase tracking-wider text-slate-900 text-center border-b border-slate-400 pb-1 mb-1.5">
              DEVELOPMENT GOALS
            </h4>
            <div className="space-y-1 text-[10px] font-bold text-slate-800">
              {allStandardGoals.map((goal, i) => (
                <label key={i} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal)}
                    readOnly
                    className="w-3 h-3 accent-slate-900 shrink-0"
                  />
                  <span>{goal}</span>
                </label>
              ))}
              <div className="pt-1 flex items-baseline">
                <span className="font-black text-[10px]">Other:</span>
                <span className="flex-1 border-b border-slate-400 ml-1 font-normal text-[10px]">
                  {record.customGoal || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coach's Comments & Overall Rating */}
        <div className="grid grid-cols-3 gap-3 text-xs border-2 border-slate-900 p-3">
          <div className="col-span-2">
            <h4 className="font-black text-[11px] uppercase text-slate-900">COACH'S COMMENTS / SUMMARY</h4>
            <p className="font-medium text-slate-900 text-[11px] mt-1 italic leading-snug">
              "{record.coachRemarks || 'Consistently demonstrates strong focus and dedication during all squad workouts.'}"
            </p>
          </div>
          <div className="border-l-2 border-slate-900 pl-3 flex flex-col justify-center items-center text-center">
            <h4 className="font-black text-[11px] uppercase text-slate-900">OVERALL RATING (1-5)</h4>
            <div className="flex items-center justify-center gap-3 font-mono text-sm font-black mt-2">
              {[1, 2, 3, 4, 5].map(num => (
                <span
                  key={num}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-xs ${
                    (record.overallRating || record.rating) === num
                      ? 'bg-slate-900 text-white font-black ring-2 ring-slate-900'
                      : 'text-slate-400 border border-slate-300'
                  }`}
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-4 grid grid-cols-3 gap-4 text-center text-xs font-black uppercase">
          <div>
            <div className="border-b border-slate-800 pb-1 font-mono text-[11px]">
              {record.coachName}
            </div>
            <p className="text-[10px] text-slate-600 mt-1">COACH SIGNATURE</p>
          </div>
          <div>
            <div className="border-b border-slate-800 pb-1 font-mono text-[11px] text-slate-400">
              _________________________
            </div>
            <p className="text-[10px] text-slate-600 mt-1">PARENT / GUARDIAN SIGNATURE</p>
          </div>
          <div>
            <div className="border-b border-slate-800 pb-1 font-mono text-[11px]">
              {record.studentName}
            </div>
            <p className="text-[10px] text-slate-600 mt-1">PLAYER SIGNATURE</p>
          </div>
        </div>

      </div>
    </PrintPortal>
  );
};
