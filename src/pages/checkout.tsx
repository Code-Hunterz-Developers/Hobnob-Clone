import React, { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/lib/cart';
import { useCreateOrder } from '@/lib/api/orders';
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
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your full street address"),
  city: z.string().min(2, "Please enter your city"),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const [, setLocation] = useLocation();

  const createOrder = useCreateOrder();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      phone: '',
      address: '',
      city: '',
      notes: '',
    },
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !createOrder.isSuccess) {
      setLocation('/cart');
    }
  }, [items, setLocation, createOrder.isSuccess]);

  // Set city from location modal
  useEffect(() => {
    const savedCity = localStorage.getItem('sweet-treats-city');
    if (savedCity && !form.getValues().city) {
      form.setValue('city', savedCity);
    }
  }, [form]);

  const deliveryFee = cartTotal > 5000 ? 0 : 250;
  const orderTotal = cartTotal + deliveryFee;

  const onSubmit = (data: CheckoutFormValues) => {
    if (items.length === 0) return;

    createOrder.mutate(
      {
        data: {
          ...data,
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          }))
        }
      },
      {
        onSuccess: (order) => {
          clearCart();
          setLocation(`/order/${order.id}`);
        }
      }
    );
  };

  if (items.length === 0 && !createOrder.isSuccess) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted shrink-0 h-10 w-10 md:h-10 md:w-10" disabled={createOrder.isPending}>
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </Link>
        <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground">Checkout</h1>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 md:gap-12 items-start flex-col-reverse lg:flex-row">
        {/* Form - Order 2 on mobile, 1 on desktop */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          <div className="bg-card border border-border p-5 md:p-8 rounded-[2rem] shadow-sm">
            <h2 className="font-serif text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-3">
              <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm font-sans shrink-0">1</span>
              Delivery Details
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" className="h-12 bg-background rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="0300 1234567" type="tel" className="h-12 bg-background rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Baker St, Apt 4" className="h-12 bg-background rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">City</FormLabel>
                      <FormControl>
                        <Input placeholder="Karachi" className="h-12 bg-background rounded-xl" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Delivery Instructions (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Leave at front door, gate code is 1234, etc." 
                          className="resize-none min-h-[80px] md:min-h-[100px] bg-background rounded-xl"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-6 mt-6 border-t border-border">
                  <h2 className="font-serif text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-3">
                    <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm font-sans shrink-0">2</span>
                    Payment
                  </h2>
                  <div className="bg-muted p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-2 md:gap-3 mb-6 md:mb-8 border border-border">
                    <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    <h3 className="font-bold text-sm md:text-base">Pay on Delivery</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">You'll pay when your treats arrive. We accept cash and major cards at the door.</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 md:h-14 rounded-full text-base md:text-lg shadow-lg shadow-primary/20"
                    disabled={createOrder.isPending}
                    data-testid="button-place-order"
                  >
                    {createOrder.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-spin" /> 
                        Baking your order...
                      </>
                    ) : (
                      <span className="truncate">Place Order — {formatPrice(orderTotal)}</span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Mini Order Summary - Order 1 on mobile, 2 on desktop */}
        <div className="lg:col-span-2 order-1 lg:order-2 mb-6 lg:mb-0">
          <div className="bg-muted/30 rounded-[2rem] p-5 md:p-8 sticky top-24 border border-border">
            <h2 className="font-serif text-lg md:text-xl font-bold mb-4 md:mb-6">In Your Order</h2>
            
            <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 max-h-[200px] md:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => {
                const price = item.product.discountPrice ?? item.product.price;
                return (
                  <div key={item.product.id} className="flex gap-3 md:gap-4 items-center">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden shrink-0 bg-background border border-border">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs md:text-sm truncate">{item.product.name}</h4>
                      <p className="text-[10px] md:text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-xs md:text-sm whitespace-nowrap">
                      {formatPrice(price * item.quantity)}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Separator className="my-4 bg-border" />
            
            <div className="space-y-2 md:space-y-3 mb-4 md:mb-6 text-xs md:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-baseline pt-3 md:pt-4 border-t border-border">
              <span className="font-bold text-base md:text-lg">Total</span>
              <span className="font-serif text-2xl md:text-3xl font-bold text-foreground">{formatPrice(orderTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
