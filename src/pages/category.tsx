import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'wouter';
import { useListProducts } from '@/lib/api/products';
import { useListCategories } from '@/lib/api/categories';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, SlidersHorizontal, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TAG_LABELS: Record<string, string> = {
  popular: 'Popular',
  new: 'New Arrivals',
  deal: 'Deals',
};

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const isAll = slug === 'all';
  const [searchParams] = useSearchParams();
  const tagParam = searchParams.get('tag') ?? undefined;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState<string>('featured');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories } = useListCategories();
  const currentCategory = categories?.find(c => c.slug === slug);

  const { data: products, isLoading } = useListProducts({
    categorySlug: isAll ? undefined : slug,
    tag: tagParam,
    search: debouncedSearch || undefined,
  });

  // Client-side sorting since API doesn't support it directly
  const sortedProducts = React.useMemo(() => {
    if (!products) return [];
    const sorted = [...products];
    switch (sort) {
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice ?? a.price;
          const priceB = b.discountPrice ?? b.price;
          return priceA - priceB;
        });
      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = a.discountPrice ?? a.price;
          const priceB = b.discountPrice ?? b.price;
          return priceB - priceA;
        });
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'featured':
      default:
        // Prioritize items with 'popular' or 'deal' tags
        return sorted.sort((a, b) => {
          const scoreA = a.tags?.includes('popular') ? 2 : a.tags?.includes('deal') ? 1 : 0;
          const scoreB = b.tags?.includes('popular') ? 2 : b.tags?.includes('deal') ? 1 : 0;
          return scoreB - scoreA;
        });
    }
  }, [products, sort]);

  const categoryName =
    currentCategory?.name ||
    (isAll
      ? (tagParam && TAG_LABELS[tagParam]) || 'All Treats'
      : slug?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')) ||
    'Products';

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      {/* Category Header */}
      <div className="bg-foreground text-background py-12 md:py-24 relative overflow-hidden">
        {currentCategory?.imageUrl && (
          <>
            <img
              src={currentCategory.imageUrl}
              alt={categoryName}
              className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/80 to-transparent"></div>
          </>
        )}
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center flex flex-col items-center">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-[10px] md:text-xs font-bold tracking-widest uppercase text-muted/60 mb-6 md:mb-8 space-x-1 md:space-x-2">
            <Link href="/" className="hover:text-background transition-colors flex items-center">
              <Home className="w-3 h-3 mr-1" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-background truncate max-w-[150px] sm:max-w-none">{categoryName}</span>
          </nav>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-bold mb-3 md:mb-4">{categoryName}</h1>
          <p className="font-sans text-base sm:text-lg text-muted/80 max-w-2xl px-4">
            {isAll ? 'Explore our full menu.' : `Explore our collection of ${categoryName.toLowerCase()}.`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 mt-8 md:mt-12">
        {/* Filters & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8 md:mb-10 pb-6 border-b border-border">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 h-12 bg-card border-border rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 shrink-0 text-sm font-medium text-muted-foreground hidden sm:flex">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Sort by:</span>
            </div>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-full md:w-[180px] h-12 rounded-full bg-card">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between mt-2">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {sortedProducts.map((product, i) => (
              <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both" style={{ animationDelay: `${(i % 8) * 100}ms` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 md:py-24 text-center flex flex-col items-center justify-center bg-card/50 rounded-3xl border border-border border-dashed px-4">
            <Search className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/30 mb-4 md:mb-6" />
            <h3 className="font-serif text-xl md:text-2xl font-bold mb-2">No treats found</h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto mb-6 md:mb-8 font-sans">
              We couldn't find anything matching "{search}" in this category. Try a different search term or browse other categories.
            </p>
            <Button variant="outline" onClick={() => setSearch('')} className="rounded-full">
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
