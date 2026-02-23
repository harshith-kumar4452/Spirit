import { ComplaintCategory } from './types';

export const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  road_damage: 'Road Damage',
  streetlight: 'Streetlight',
  sanitation: 'Sanitation',
  public_property: 'Public Property',
  water_supply: 'Water Supply',
  safety_hazard: 'Safety Hazard',
  public_notice: 'Public Notice',
  greenery: 'Greenery',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<ComplaintCategory, string> = {
  road_damage: '#EF4444',      // red
  streetlight: '#F59E0B',      // amber
  sanitation: '#16A34A',       // green
  public_property: '#3B82F6',  // blue
  water_supply: '#06B6D4',     // cyan
  safety_hazard: '#EA580C',    // orange
  public_notice: '#A855F7',    // purple
  greenery: '#10B981',         // emerald
  other: '#94A3B8',            // slate
};

export const STATUS_STYLES = {
  submitted:    'bg-amber-100 text-amber-800',
  under_review: 'bg-blue-100 text-blue-800',
  in_progress:  'bg-purple-100 text-purple-800',
  resolved:     'bg-green-100 text-green-800',
  rejected:     'bg-red-100 text-red-800',
};

export const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

export const PRIORITY_COLORS = {
  low: 'text-slate-500',
  medium: 'text-amber-500',
  high: 'text-orange-500',
  critical: 'text-red-600',
};

export const LEVEL_COLORS = {
  1: 'bg-slate-100 text-slate-700 border-slate-300',
  2: 'bg-green-100 text-green-700 border-green-300',
  3: 'bg-blue-100 text-blue-700 border-blue-300',
  4: 'bg-purple-100 text-purple-700 border-purple-300',
  5: 'bg-orange-100 text-orange-700 border-orange-300',
  6: 'bg-red-100 text-red-700 border-red-300',
  7: 'bg-amber-100 text-amber-700 border-amber-300',
};

// Admin emails - hardcoded for hackathon
export const ADMIN_EMAILS = [
  'kumarharshith4452@gmail.com',
  'ayyagariabhinav21@gmail.com',
];
