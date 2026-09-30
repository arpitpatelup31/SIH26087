import React from 'react';

export const ProgressBar = ({ progress = 0, size = 'md', showLabel = true, color = 'emerald' }) => {
  const normalized = Math.min(100, Math.max(0, Math.round(progress)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colorClasses = {
    emerald: 'bg-emerald-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500'
  };

  const barColor = colorClasses[color] || 'bg-emerald-500';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-slate-600 font-medium">Progress</span>
          <span className="font-bold text-slate-900">{normalized}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeClasses[size] || 'h-2.5'}`}>
        <div
          className={`${barColor} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
