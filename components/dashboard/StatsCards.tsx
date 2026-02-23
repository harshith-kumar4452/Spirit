'use client';

import { FileText, CheckCircle, Zap, Trophy } from 'lucide-react';
import { User } from '@/lib/utils/types';

interface StatsCardsProps {
  userData: User;
  rank: number;
}

export function StatsCards({ userData, rank }: StatsCardsProps) {
  const stats = [
    {
      icon: FileText,
      label: 'Reports',
      value: userData.totalComplaints,
      color: 'text-brand-500',
      bgColor: 'bg-brand-50',
    },
    {
      icon: CheckCircle,
      label: 'Resolved',
      value: userData.resolvedComplaints,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Zap,
      label: 'XP Points',
      value: userData.xp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
    },
    {
      icon: Trophy,
      label: 'Rank',
      value: `#${rank}`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
