'use client';

import { LevelIndicator } from '@/components/gamification/LevelIndicator';
import { xpToNextLevel, getNextLevelTitle } from '@/lib/gamification/xpEngine';

interface XPProgressBarProps {
  xp: number;
  level: number;
  levelTitle: string;
}

export function XPProgressBar({ xp, level, levelTitle }: XPProgressBarProps) {
  const progress = xpToNextLevel(xp, level);
  const nextTitle = getNextLevelTitle(level);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <LevelIndicator level={level} title={levelTitle} />
        <span className="text-xs text-slate-500">
          {progress.current} / {progress.required} XP to next level
        </span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress.percentage, 100)}%` }}
        />
      </div>
      {level < 7 && (
        <p className="mt-2 text-xs text-slate-500">
          {progress.required - progress.current} more XP to reach{' '}
          <span className="font-semibold text-brand-600">{nextTitle}</span>
        </p>
      )}
    </div>
  );
}
