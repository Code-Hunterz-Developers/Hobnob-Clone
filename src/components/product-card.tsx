import React from 'react';
import { Link } from 'wouter';
import { useCart } from '@/lib/cart';
import type { Product } from '@/lib/api/types';
import { ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/currency';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail
    addItem(product, 1);
  };

  const isDiscounted = product.discountPrice !== null && product.discountPrice !== undefined;
  const currentPrice = isDiscounted ? product.discountPrice : product.price;
  const formatTagLabel = (tag: string) => tag.replace('-', ' ');

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover-elevate">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.tags?.map((tag: string) => (
            <span key={tag} className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-sm ${
              tag.toLowerCase() === 'deal' ? 'bg-destructive text-destructive-foreground' :
              tag.toLowerCase() === 'popular' ? 'bg-secondary text-secondary-foreground border border-border' :
              'bg-primary text-primary-foreground'
            }`}>
              {formatTagLabel(tag)}
            </span>
          ))}
        </div>

        {/* Quick add button (desktop hover) */}
        <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
          <Button 
            size="icon" 
            className="rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground h-12 w-12"
            onClick={handleAddToCart}
            data-testid={`button-quick-add-${product.id}`}
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add to Cart</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1 md:mb-1 uppercase tracking-wider">{product.categorySlug.replace('-', ' ')}</p>
        <h3 className="font-serif text-lg md:text-xl font-bold text-foreground mb-1 md:mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 mb-3 md:mb-4 flex-1">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-3 md:pt-4 border-t border-border">
          <div className="flex flex-wrap items-baseline gap-1 md:gap-2">
            {isDiscounted ? (
              <>
                <span className="text-base md:text-lg font-bold text-destructive">{formatPrice(product.discountPrice!)}</span>
                <span className="text-xs md:text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-base md:text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
            )}
          </div>
          
          {/* Mobile add button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-primary hover:bg-primary/10 -mr-2 shrink-0 h-8 w-8"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
