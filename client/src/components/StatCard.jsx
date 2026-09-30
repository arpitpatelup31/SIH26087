import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', trend }) => {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600',
      iconColor: 'text-white'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-100',
      iconBg: 'bg-orange-500',
      iconColor: 'text-white'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100',
      iconBg: 'bg-blue-600',
      iconColor: 'text-white'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-100',
      iconBg: 'bg-purple-600',
      iconColor: 'text-white'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white'
    }
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`p-4 rounded-xl bg-white border ${scheme.border} shadow-xs transition hover:shadow-md relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="text-2xl font-black text-slate-900 mt-1">{value}</div>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          {trend && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-1.5">
              {trend}
            </span>
          )}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl ${scheme.iconBg} ${scheme.iconColor} flex items-center justify-center shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${scheme.bg}`} />
    </div>
  );
};

export default StatCard;
