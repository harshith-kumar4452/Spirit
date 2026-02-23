import { ComplaintStatus } from '@/lib/utils/types';
import { STATUS_STYLES, STATUS_LABELS } from '@/lib/utils/constants';

interface StatusBadgeProps {
  status: ComplaintStatus;
  small?: boolean;
}

export function StatusBadge({ status, small = false }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
        STATUS_STYLES[status]
      } ${small ? 'text-xs' : 'text-xs'}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
