import { Zap } from 'lucide-react';

interface XPBadgeProps {
  xp: number;
}

export function XPBadge({ xp }: XPBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
      <Zap className="w-3.5 h-3.5 text-amber-500" />
      <span className="text-xs font-bold text-amber-700">{xp} XP</span>
    </div>
  );
}
