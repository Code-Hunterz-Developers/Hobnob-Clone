import { Clock, CheckCircle2, RefreshCcw, Truck, XCircle, PackageCheck } from 'lucide-react';

export type OrderStatusInfo = {
  label: string;
  className: string;
  Icon: typeof Clock;
};

export function getOrderStatusInfo(status: string): OrderStatusInfo {
  switch (status.toLowerCase()) {
    case 'placed':
      return { label: 'Order Placed', className: 'bg-blue-100 text-blue-800', Icon: PackageCheck };
    case 'confirmed':
      return { label: 'Confirmed', className: 'bg-indigo-100 text-indigo-800', Icon: CheckCircle2 };
    case 'preparing':
    case 'pending':
      return { label: 'Preparing', className: 'bg-yellow-100 text-yellow-800', Icon: RefreshCcw };
    case 'out_for_delivery':
      return { label: 'Out for Delivery', className: 'bg-orange-100 text-orange-800', Icon: Truck };
    case 'delivered':
      return { label: 'Delivered', className: 'bg-green-100 text-green-800', Icon: CheckCircle2 };
    case 'cancelled':
      return { label: 'Cancelled', className: 'bg-red-100 text-red-800', Icon: XCircle };
    default:
      return { label: status, className: 'bg-primary/10 text-primary', Icon: Clock };
  }
}

export function OrderStatusBadge({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' }) {
  const { label, className, Icon } = getOrderStatusInfo(status);
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider ${sizeClasses} ${className}`}>
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

// Ordered pipeline used to render a visual progress tracker.
// 'cancelled' is handled separately since it's a terminal off-ramp, not a step.
export const ORDER_STATUS_STEPS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'] as const;

export function getOrderStatusStepIndex(status: string): number {
  const idx = ORDER_STATUS_STEPS.indexOf(status.toLowerCase() as typeof ORDER_STATUS_STEPS[number]);
  if (idx !== -1) return idx;
  if (status.toLowerCase() === 'pending') return ORDER_STATUS_STEPS.indexOf('preparing');
  return 0;
}
