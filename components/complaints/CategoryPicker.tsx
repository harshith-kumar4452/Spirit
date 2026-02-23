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

const CATEGORIES: { value: ComplaintCategory; icon: any }[] = [
  { value: 'road_damage', icon: Construction },
  { value: 'streetlight', icon: Lightbulb },
  { value: 'sanitation', icon: Trash2 },
  { value: 'public_property', icon: Building },
  { value: 'water_supply', icon: Droplets },
  { value: 'safety_hazard', icon: AlertTriangle },
  { value: 'public_notice', icon: FileText },
  { value: 'greenery', icon: Trees },
  { value: 'other', icon: HelpCircle },
];

interface CategoryPickerProps {
  selected: ComplaintCategory | null;
  onSelect: (category: ComplaintCategory) => void;
}

export function CategoryPicker({ selected, onSelect }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {CATEGORIES.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
            selected === value
              ? 'border-brand-500 bg-brand-50 shadow-sm'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <Icon className={`w-6 h-6 ${selected === value ? 'text-brand-600' : 'text-slate-600'}`} />
          <span className="text-xs sm:text-sm font-medium text-slate-700 text-center">
            {CATEGORY_LABELS[value]}
          </span>
        </button>
      ))}
    </div>
  );
}
