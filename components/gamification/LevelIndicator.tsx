import { Shield } from 'lucide-react';
import { LEVEL_COLORS } from '@/lib/utils/constants';

interface LevelIndicatorProps {
  level: number;
  title: string;
}

export function LevelIndicator({ level, title }: LevelIndicatorProps) {
  const colorClass = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] || LEVEL_COLORS[1];

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${colorClass}`}
    >
      <Shield className="w-3 h-3" />
      Lv.{level} {title}
    </div>
  );
}
