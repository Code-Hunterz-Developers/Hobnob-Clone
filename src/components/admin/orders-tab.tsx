import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useAdminListOrders,
  adminOrdersQueryKey,
  useAdminUpdateOrderStatus,
} from '@/lib/api/orders';
import { formatPrice } from '@/lib/currency';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_OPTIONS = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'] as const;

const STATUS_LABELS: Record<string, string> = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'delivered') return 'default';
  if (status === 'cancelled') return 'destructive';
  if (status === 'placed') return 'outline';
  return 'secondary';
}

export function AdminOrdersTab() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useAdminListOrders();
  const updateStatusMutation = useAdminUpdateOrderStatus();

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, data: { status } });
      await queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey() });
      toast.success('Order status updated');
    } catch {
      toast.error('Could not update order status');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-serif font-bold mb-4">Orders</h2>
      <div className="bg-background rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Placed</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Loading...
                </TableCell>
              </TableRow>
            )}
            {!isLoading && orders?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No orders yet.
                </TableCell>
              </TableRow>
            )}
            {orders?.map((order) => (
              <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                <TableCell className="font-medium">#{order.id}</TableCell>
                <TableCell>
                  <div>{order.customerName}</div>
                  <div className="text-xs text-muted-foreground">
                    {order.phone} · {order.city}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {order.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                </TableCell>
                <TableCell>{formatPrice(order.total)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                    <SelectTrigger className="w-[170px]" data-testid={`select-order-status-${order.id}`}>
                      <SelectValue>
                        <Badge variant={statusVariant(order.status)}>
                          {STATUS_LABELS[order.status] ?? order.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
