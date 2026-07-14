import React, { useState } from 'react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetOrder } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Package, MapPin, Calendar, ArrowRight, SearchX } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/currency';
import { OrderStatusBadge, ORDER_STATUS_STEPS, getOrderStatusStepIndex, getOrderStatusInfo } from '@/lib/order-status';

const trackSchema = z.object({
  orderId: z.string().min(1, 'Please enter your order number'),
  phone: z.string().min(6, 'Please enter the phone number used at checkout'),
});

type TrackFormValues = z.infer<typeof trackSchema>;

export default function TrackOrderPage() {
  const [lookup, setLookup] = useState<{ id: string; phone: string } | null>(null);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: { orderId: '', phone: '' },
  });

  const { data: order, isFetching, isError } = useGetOrder(lookup?.id, {
    enabled: !!lookup,
  });

  const phoneMatches = (a: string, b: string) => a.replace(/\D/g, '').slice(-7) === b.replace(/\D/g, '').slice(-7);

  const verifiedOrder = order && lookup && phoneMatches(order.phone, lookup.phone) ? order : null;

  React.useEffect(() => {
    if (lookup && !isFetching) {
      if (isError || (order && !phoneMatches(order.phone, lookup.phone))) {
        setNotFound(true);
      } else if (order) {
        setNotFound(false);
      }
    }
  }, [lookup, isFetching, isError, order]);

  const onSubmit = (values: TrackFormValues) => {
    const id = values.orderId.trim();
    setNotFound(false);
    setLookup({ id, phone: values.phone });
  };

  const statusStepIndex = verifiedOrder ? getOrderStatusStepIndex(verifiedOrder.status) : -1;
  const isCancelled = verifiedOrder?.status.toLowerCase() === 'cancelled';

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
          <Search className="w-9 h-9" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          Track Your Order
        </h1>
        <p className="font-sans text-lg text-muted-foreground max-w-xl mx-auto">
          Enter your order number and the phone number you used at checkout to see the latest status.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-card border border-border rounded-3xl shadow-sm p-6 md:p-8 mb-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 items-start">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Order Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your order ID" {...field} data-testid="input-track-order-id" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex-1 w-full">
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone used at checkout" {...field} data-testid="input-track-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="lg" className="rounded-full w-full sm:w-auto sm:mt-8" disabled={isFetching} data-testid="button-track-order">
              {isFetching ? 'Searching...' : 'Track Order'}
            </Button>
          </form>
        </Form>
      </div>

      {/* Loading */}
      {isFetching && (
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3 mx-auto" />
          <Skeleton className="h-[200px] w-full rounded-3xl" />
        </div>
      )}

      {/* Not Found */}
      {!isFetching && notFound && (
        <div className="text-center py-12 px-4 bg-muted/40 rounded-3xl border border-border">
          <SearchX className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-serif text-2xl font-bold text-foreground mb-2">We couldn't find that order</h3>
          <p className="text-muted-foreground">
            Double-check your order number and the phone number used at checkout, then try again.
          </p>
        </div>
      )}

      {/* Result */}
      {verifiedOrder && !isFetching && (
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-muted p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border">
            <div>
              <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-1">Order Number</p>
              <p className="font-mono text-xl font-bold text-foreground">#{verifiedOrder.id.toString().padStart(6, '0')}</p>
            </div>
            <OrderStatusBadge status={verifiedOrder.status} />
          </div>

          <div className="p-6 md:p-8">
            {/* Progress Tracker */}
            {!isCancelled ? (
              <div className="mb-10 pb-10 border-b border-border">
                <div className="flex items-center justify-between">
                  {ORDER_STATUS_STEPS.map((step, idx) => {
                    const { label, Icon } = getOrderStatusInfo(step);
                    const reached = idx <= statusStepIndex;
                    return (
                      <React.Fragment key={step}>
                        <div className="flex flex-col items-center flex-1 min-w-0">
                          <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground border border-border'}`}>
                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                          </div>
                          <span className={`mt-2 text-[10px] md:text-xs text-center font-bold uppercase tracking-wider truncate w-full ${reached ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {label}
                          </span>
                        </div>
                        {idx < ORDER_STATUS_STEPS.length - 1 && (
                          <div className={`h-0.5 flex-1 -mt-5 ${idx < statusStepIndex ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-10 pb-10 border-b border-border text-center text-red-700 bg-red-50 rounded-2xl p-4 font-medium">
                This order was cancelled. Contact us if you have questions.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-10 pb-10 border-b border-border">
              <div className="space-y-6">
                <h3 className="font-serif text-2xl font-bold mb-4">Delivery Details</h3>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">{verifiedOrder.customerName}</p>
                    <p className="text-muted-foreground">{verifiedOrder.address}</p>
                    <p className="text-muted-foreground">{verifiedOrder.city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Ordered On</p>
                    <p className="text-muted-foreground">{format(new Date(verifiedOrder.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" /> Order Items
                </h3>
                <div className="space-y-4">
                  {verifiedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-foreground truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                      </div>
                      <div className="font-bold text-foreground">
                        {formatPrice(item.quantity * item.unitPrice)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-border flex justify-between items-baseline">
                  <span className="font-bold text-lg">Total Paid</span>
                  <span className="font-serif text-3xl font-bold text-primary">{formatPrice(verifiedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link href="/">
                <Button variant="outline" className="rounded-full px-8">
                  Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
