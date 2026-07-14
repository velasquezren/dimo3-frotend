import type { OrderStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: OrderStatus;
  animate?: boolean;
  large?: boolean;
}

const statusConfig: Record<OrderStatus, { label: string; colorClass: string }> = {
  Pending: { label: 'Pendiente', colorClass: 'text-accent-primary' },
  Confirmed: { label: 'Confirmado', colorClass: 'text-accent-secondary' },
  Delivered: { label: 'Entregado', colorClass: 'text-text-secondary' },
  Cancelled: { label: 'Cancelado', colorClass: 'text-alert' },
};

export default function StatusBadge({ status, animate = false, large = false }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`stamp-badge ${config.colorClass} ${animate ? 'stamp-animate' : ''} ${
        large ? 'text-sm px-4 py-1.5' : ''
      }`}
      role="status"
      aria-label={`Estado: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
