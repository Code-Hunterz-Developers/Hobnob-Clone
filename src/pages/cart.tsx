import React from 'react';
import { Link, useLocation } from 'wouter';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/currency';

export default function CartPage() {
  const { items, updateQuantity, removeItem, cartTotal, cartCount } = useCart();
  const [, setLocation] = useLocation();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 min-h-[60vh] flex flex-col items-center justify-center py-12 md:py-20 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 md:mb-8">
          <ShoppingBag className="w-8 h-8 md:w-10 md:h-10" />
        </div>
        <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">Your cart is empty</h1>
        <p className="font-sans text-base md:text-lg text-muted-foreground max-w-md mb-6 md:mb-8">
          Looks like you haven't made your sweet selections yet. Let's fix that!
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full px-8 h-12 md:h-14 text-base md:text-lg w-full sm:w-auto">
            Start Browsing
          </Button>
        </Link>
      </div>
    );
  }

  const deliveryFee = cartTotal > 5000 ? 0 : 250;
  const orderTotal = cartTotal + deliveryFee;

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-16 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted shrink-0 h-10 w-10 md:h-10 md:w-10">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </Link>
        <h1 className="font-serif text-2xl md:text-4xl font-bold text-foreground truncate">Your Cart</h1>
        <span className="bg-primary/10 text-primary font-bold px-2.5 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm ml-auto sm:ml-2 whitespace-nowrap">
          {cartCount} {cartCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 md:gap-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {items.map((item) => {
            const isDiscounted = item.product.discountPrice !== null && item.product.discountPrice !== undefined;
            const currentPrice = isDiscounted ? item.product.discountPrice! : item.product.price;
            
            return (
              <div key={item.product.id} className="flex flex-col sm:flex-row gap-4 md:gap-6 p-4 md:p-6 bg-card border border-border rounded-2xl shadow-sm relative group">
                <Link href={`/product/${item.product.id}`} className="shrink-0 flex justify-center sm:block">
                  <div className="w-32 h-32 sm:w-32 sm:h-32 aspect-square rounded-xl overflow-hidden bg-muted">
                    <img 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
                
                <div className="flex flex-col flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 md:gap-4 mb-2">
                    <div>
                      <p className="text-[10px] md:text-xs font-bold tracking-widest uppercase text-muted-foreground mb-1">
                        {item.product.categorySlug.replace('-', ' ')}
                      </p>
                      <Link href={`/product/${item.product.id}`}>
                        <h3 className="font-serif text-lg md:text-xl font-bold hover:text-primary transition-colors line-clamp-1">
                          {item.product.name}
                        </h3>
                      </Link>
                    </div>
                    <div className="text-left sm:text-right shrink-0 mt-1 sm:mt-0">
                      <p className="font-sans font-bold text-base md:text-lg">{formatPrice(currentPrice * item.quantity)}</p>
                      {isDiscounted && (
                        <p className="text-[10px] md:text-xs text-muted-foreground line-through">{formatPrice(item.product.price * item.quantity)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-3 md:pt-4 flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-input rounded-full h-9 md:h-10 bg-background w-24 md:w-28">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 md:w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Minus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                      <span className="flex-1 text-center font-bold text-xs md:text-sm select-none">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 md:w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeItem(item.product.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2 h-9"
                    >
                      <Trash2 className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Remove</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-muted/50 rounded-[2rem] p-6 md:p-8 sticky top-24 border border-border">
          <h2 className="font-serif text-xl md:text-2xl font-bold mb-4 md:mb-6">Order Summary</h2>
          
          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 text-sm font-sans">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({cartCount} items)</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              {deliveryFee === 0 ? (
                <span className="text-primary font-bold uppercase tracking-wider text-xs">Free</span>
              ) : (
                <span>{formatPrice(deliveryFee)}</span>
              )}
            </div>
            {deliveryFee > 0 && (
              <div className="bg-background text-[10px] md:text-xs text-muted-foreground p-3 rounded-xl border border-border">
                Add <span className="font-bold text-foreground">{formatPrice(5000 - cartTotal)}</span> more to your cart to get free delivery!
              </div>
            )}
          </div>
          
          <Separator className="mb-4 md:mb-6 bg-border" />
          
          <div className="flex justify-between items-baseline mb-6 md:mb-8">
            <span className="font-bold text-base md:text-lg">Total</span>
            <span className="font-serif text-2xl md:text-3xl font-bold text-primary">{formatPrice(orderTotal)}</span>
          </div>
          
          <Button 
            size="lg" 
            className="w-full h-12 md:h-14 rounded-full text-base md:text-lg shadow-lg shadow-primary/20 group"
            onClick={() => setLocation('/checkout')}
          >
            Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <div className="mt-4 md:mt-6 text-center text-[10px] md:text-xs text-muted-foreground">
            <p>Secure checkout. Fresh treats guaranteed.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
