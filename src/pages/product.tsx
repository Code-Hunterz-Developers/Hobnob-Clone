import React, { useState } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useGetProduct, useListProducts } from '@/lib/api/products';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Minus, Plus, ShoppingBag, ArrowLeft, Home, ChevronRight, Truck, Info, Heart } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { formatPrice } from '@/lib/currency';

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, setLocation] = useLocation();
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const { data: product, isLoading, isError } = useGetProduct(id);

  // Get related products from the same category
  const { data: relatedProducts } = useListProducts(
    { categorySlug: product?.categorySlug },
    { enabled: !!product?.categorySlug }
  );

  const handleAddToCart = () => {
    if (product) {
      setIsAdding(true);
      addItem(product, quantity);
      
      // Little micro-interaction delay before resetting
      setTimeout(() => {
        setIsAdding(false);
        setQuantity(1);
      }, 500);
    }
  };

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-foreground">Oops, dropped that one.</h2>
        <p className="text-muted-foreground text-base md:text-lg mb-8">We couldn't find the treat you're looking for.</p>
        <Link href="/">
          <Button size="lg" className="rounded-full">Return Home</Button>
        </Link>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20 animate-pulse">
        <div className="flex gap-2 mb-6 md:mb-8">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-4 h-4" />
          <Skeleton className="w-24 h-4" />
        </div>
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-6 pt-2 md:pt-4">
            <Skeleton className="w-24 h-6" />
            <Skeleton className="w-3/4 h-10 md:h-12" />
            <Skeleton className="w-1/4 h-8" />
            <div className="space-y-2 mt-6 md:mt-8">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-2/3 h-4" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-12">
              <Skeleton className="w-full sm:w-32 h-14 rounded-full" />
              <Skeleton className="w-full h-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDiscounted = product.discountPrice !== null && product.discountPrice !== undefined;
  const currentPrice = isDiscounted ? product.discountPrice! : product.price;
  
  // Filter out current product and grab up to 4 related
  const filteredRelated = relatedProducts
    ?.filter(p => p.id !== product.id)
    .slice(0, 4) || [];

  return (
    <div className="animate-in fade-in duration-500 pb-16 md:pb-24">
      {/* Product Detail */}
      <section className="container mx-auto px-4 md:px-6 py-6 md:py-12 lg:py-16">
        
        {/* Breadcrumbs */}
        <nav className="flex flex-wrap items-center text-[10px] md:text-xs font-bold tracking-widest uppercase text-muted-foreground mb-6 md:mb-12 gap-1 md:space-x-2">
          <Link href="/" className="hover:text-primary transition-colors flex items-center">
            <Home className="w-3 h-3 mr-1" /> Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/category/${product.categorySlug}`} className="hover:text-primary transition-colors whitespace-nowrap">
            {product.categorySlug.replace('-', ' ')}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate max-w-[120px] sm:max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 md:gap-10 lg:gap-16 items-start">
          {/* Image */}
          <div className="relative group rounded-2xl md:rounded-3xl overflow-hidden bg-card border border-border shadow-sm">
            <div className="aspect-square w-full">
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Tags overlay */}
            <div className="absolute top-3 md:top-4 left-3 md:left-4 flex flex-col gap-2">
              {product.tags?.map((tag) => (
                <span key={tag} className={`text-[10px] md:text-xs font-bold tracking-wider uppercase px-3 py-1 md:px-4 md:py-1.5 rounded-full text-white shadow-sm ${
                  tag.toLowerCase() === 'deal' ? 'bg-destructive' : 
                  tag.toLowerCase() === 'popular' ? 'bg-secondary text-secondary-foreground' : 
                  'bg-primary'
                }`}>
                  {tag.replace('-', ' ')}
                </span>
              ))}
            </div>
            
            {/* Favorite button */}
            <button 
              onClick={() => setIsFavorited(!isFavorited)}
              className="absolute top-3 right-3 md:top-4 md:right-4 w-10 h-10 md:w-12 md:h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground hover:text-primary hover:bg-background transition-all shadow-sm group-hover:opacity-100 md:opacity-0"
            >
              <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isFavorited ? 'fill-primary text-primary' : ''}`} />
            </button>
          </div>

          {/* Info */}
          <div className="flex flex-col h-full pt-2 md:pt-6">
            <div className="mb-2">
              <Link href={`/category/${product.categorySlug}`} className="text-xs md:text-sm font-bold tracking-widest uppercase text-primary hover:underline">
                {product.categorySlug.replace('-', ' ')}
              </Link>
            </div>
            
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4 leading-[1.1]">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap items-baseline gap-2 md:gap-3 mb-6 md:mb-8">
              {isDiscounted ? (
                <>
                  <span className="font-sans text-2xl md:text-3xl font-bold text-destructive">{formatPrice(product.discountPrice!)}</span>
                  <span className="font-sans text-lg md:text-xl text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  <span className="ml-1 md:ml-2 text-[10px] md:text-xs font-bold tracking-widest uppercase bg-destructive/10 text-destructive px-2 py-1 rounded-sm">Sale</span>
                </>
              ) : (
                <span className="font-sans text-2xl md:text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
              )}
            </div>
            
            <p className="font-sans text-base md:text-lg text-muted-foreground mb-8 md:mb-10 leading-relaxed">
              {product.description}
            </p>
            
            <div className="mt-auto">
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mb-6 md:mb-8">
                {/* Quantity selector */}
                <div className="flex items-center border-2 border-input rounded-full h-12 md:h-14 w-full sm:w-32 md:w-36 shrink-0 bg-background">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <span className="flex-1 text-center font-bold text-base md:text-lg font-sans select-none">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-full flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <Button 
                  size="lg" 
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 md:h-14 w-full rounded-full text-base md:text-lg shadow-lg shadow-primary/20 transition-all ${isAdding ? 'scale-95 bg-primary/80 hover:bg-primary/80' : ''}`}
                >
                  {isAdding ? (
                    "Added!"
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2" /> <span className="hidden sm:inline">Add to Cart — </span> {formatPrice(currentPrice * quantity)}
                    </>
                  )}
                </Button>
              </div>

              {/* Badges/Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary-foreground flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Local Delivery</h4>
                    <p className="text-xs text-muted-foreground mt-1">Available in major cities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">Storage</h4>
                    <p className="text-xs text-muted-foreground mt-1">Best kept refrigerated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {filteredRelated.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 mt-12 md:mt-24 pt-12 md:pt-16 border-t border-border">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">You might also like</h2>
            <Link href={`/category/${product.categorySlug}`}>
              <Button variant="ghost" className="hover:text-primary hidden sm:flex">
                See all {product.categorySlug.replace('-', ' ')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {filteredRelated.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
          
          <Link href={`/category/${product.categorySlug}`} className="block sm:hidden mt-6">
            <Button variant="outline" className="w-full">
              See all {product.categorySlug.replace('-', ' ')}
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}
