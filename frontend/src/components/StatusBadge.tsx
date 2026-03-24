import { TicketStatus } from '@/types/Ticket';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: TicketStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<TicketStatus, string> = {
    [TicketStatus.OPEN]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-800 hover:bg-blue-100/80',
    [TicketStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100/80',
    [TicketStatus.CLOSED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200 dark:border-green-800 hover:bg-green-100/80',
    [TicketStatus.REOPENED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 border-purple-200 dark:border-purple-800 hover:bg-purple-100/80',
  };

  const labels: Record<TicketStatus, string> = {
    [TicketStatus.OPEN]: 'Abierto',
    [TicketStatus.IN_PROGRESS]: 'En Progreso',
    [TicketStatus.CLOSED]: 'Cerrado',
    [TicketStatus.REOPENED]: 'Reabierto',
  };

  return (
    <Badge variant="outline" className={variants[status]}>
      {labels[status]}
    </Badge>
  );
}
