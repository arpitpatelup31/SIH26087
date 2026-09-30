import React from 'react';
import { CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

export const SkillBadge = ({ status, score, showScore = true, size = 'md' }) => {
  const normalizedStatus = status || (score >= 80 ? 'Strong' : score >= 60 ? 'Developing' : 'Skill Gap');

  const configs = {
    'Strong': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
      label: 'Strong'
    },
    'Developing': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: TrendingUp,
      label: 'Developing'
    },
    'Skill Gap': {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: AlertTriangle,
      label: 'Skill Gap'
    }
  };

  const config = configs[normalizedStatus] || configs['Skill Gap'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size] || sizeClasses.md}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
      {showScore && score !== undefined && score !== null && (
        <span className="font-extrabold ml-0.5 opacity-90">({Math.round(score)}%)</span>
      )}
    </span>
  );
};

export default SkillBadge;
