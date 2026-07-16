import React from 'react';
import { useParams, Link } from 'wouter';
import { useGetOrder } from '@/lib/api/orders';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Package, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/currency';
import { OrderStatusBadge } from '@/lib/order-status';

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: order, isLoading, isError } = useGetOrder(id);

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-4xl font-bold mb-4 text-foreground">Order Not Found</h2>
        <p className="text-muted-foreground text-lg mb-8">We couldn't locate this order.</p>
        <Link href="/">
          <Button size="lg" className="rounded-full">Return Home</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !order) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-3xl">
        <div className="flex flex-col items-center text-center mb-12 animate-pulse">
          <Skeleton className="w-20 h-20 rounded-full mb-6" />
          <Skeleton className="h-10 w-3/4 max-w-md mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl animate-in fade-in zoom-in-95 duration-700">
      
      {/* Success Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary mb-8 animate-bounce-subtle">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
          It's in the oven!
        </h1>
        <p className="font-sans text-xl text-muted-foreground max-w-xl mx-auto">
          Thanks for your order, {order.customerName.split(' ')[0]}. We've received it and are getting it ready.
        </p>
      </div>

      {/* Order Card */}
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-muted p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border">
          <div>
            <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-1">Order Number</p>
            <p className="font-mono text-xl font-bold text-foreground">#{order.id.toString().padStart(6, '0')}</p>
          </div>
          <div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="p-6 md:p-8">
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-10 pb-10 border-b border-border">
            {/* Delivery Info */}
            <div className="space-y-6">
              <h3 className="font-serif text-2xl font-bold mb-4">Delivery Details</h3>
              
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">{order.customerName}</p>
                  <p className="text-muted-foreground">{order.address}</p>
                  <p className="text-muted-foreground">{order.city}</p>
                  <p className="text-muted-foreground mt-1">{order.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">Ordered On</p>
                  <p className="text-muted-foreground">{format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
                </div>
              </div>

              {order.notes && (
                <div className="bg-muted/50 p-4 rounded-xl text-sm italic text-muted-foreground border border-border">
                  "{order.notes}"
                </div>
              )}
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-primary" /> Order Items
              </h3>
              
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
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

              <div className="mt-8 pt-6 border-t border-border space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total > 5000 ? order.total : order.total - 250)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Delivery</span>
                  <span>{order.total > 5000 ? 'Free' : formatPrice(250)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-4 mt-2 border-t border-border">
                  <span className="font-bold text-lg">Total Paid</span>
                  <span className="font-serif text-3xl font-bold text-primary">{formatPrice(order.total)}</span>
                </div>
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
    </div>
  );
}
