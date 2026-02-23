import {
  Construction,
  Lightbulb,
  Trash2,
  Building,
  Droplets,
  AlertTriangle,
  FileText,
  Trees,
  HelpCircle,
} from 'lucide-react';
import { ComplaintCategory } from '@/lib/utils/types';
import { CATEGORY_LABELS } from '@/lib/utils/constants';

interface CategoryBadgeProps {
  category: ComplaintCategory;
  small?: boolean;
}

const CATEGORY_ICONS: Record<ComplaintCategory, any> = {
  road_damage: Construction,
  streetlight: Lightbulb,
  sanitation: Trash2,
  public_property: Building,
  water_supply: Droplets,
  safety_hazard: AlertTriangle,
  public_notice: FileText,
  greenery: Trees,
  other: HelpCircle,
};

export function CategoryBadge({ category, small = false }: CategoryBadgeProps) {
  const Icon = CATEGORY_ICONS[category];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 ${
        small ? 'text-xs' : 'text-xs'
      }`}
    >
      <Icon className={small ? 'w-3 h-3' : 'w-3 h-3'} />
      {CATEGORY_LABELS[category]}
    </span>
  );
}
