import React from 'react';
import { Link } from 'wouter';
import { ArrowRight, Star, Tag, Clock, ChevronRight } from 'lucide-react';
import { useListCategories } from '@/lib/api/categories';
import { useListProducts } from '@/lib/api/products';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function ProductRowSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="flex justify-between mt-2">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CategorySection() {
  const { data: categories, isLoading } = useListCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="aspect-[4/3] md:aspect-square rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {categories?.map((cat, i) => (
        <Link 
          key={cat.id} 
          href={`/category/${cat.slug}`}
          className={`group relative overflow-hidden rounded-2xl aspect-[4/3] md:aspect-square bg-muted flex items-end p-3 md:p-6 hover-elevate transition-transform transform hover:-translate-y-1`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
          {cat.imageUrl ? (
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/10" />
          )}
          <div className="relative z-20 w-full flex items-center justify-between text-white">
            <h3 className="font-serif text-lg md:text-2xl font-bold">{cat.name}</h3>
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ProductRow({ tag, title, icon, link }: { tag: string, title: string, icon: React.ReactNode, link: string }) {
  const { data: products, isLoading } = useListProducts({ tag });

  return (
    <section className="py-12 md:py-24">
      <div className="flex items-end justify-between mb-8 md:mb-10">
        <div>
          <div className="flex items-center gap-2 md:gap-3 text-primary mb-2 md:mb-3">
            {icon}
            <span className="font-sans font-bold tracking-widest uppercase text-xs md:text-sm">{tag}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-bold text-foreground leading-tight">{title}</h2>
        </div>
        <Link href={link}>
          <Button variant="ghost" className="hidden sm:flex items-center gap-2 group hover:text-primary">
            View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <ProductRowSkeleton />
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.slice(0, 4).map((product, i) => (
            <div key={product.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: `${i * 150}ms` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-muted rounded-xl p-8 md:p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
          <Clock className="w-10 h-10 md:w-12 md:h-12 opacity-20" />
          <p className="font-serif text-lg md:text-xl">Fresh batch incoming...</p>
          <p className="font-sans text-sm md:text-base max-w-sm">We're currently baking more of these. Check back soon!</p>
        </div>
      )}

      <Link href={link} className="sm:hidden mt-6 block">
        <Button variant="outline" className="w-full">
          View All
        </Button>
      </Link>
    </section>
  );
}

export default function Home() {
  return (
    <div className="animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="relative min-h-[560px] sm:min-h-[620px] md:min-h-[700px] py-16 md:py-20 flex items-center justify-center overflow-hidden bg-foreground">
        {/* Background layer with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-banner-2.jpg" 
            alt="Bakery Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-foreground/30"></div>
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-background/95 text-foreground border border-background/50 shadow-lg backdrop-blur-md mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">Freshly Baked Today</span>
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-background mb-4 md:mb-6 tracking-tight max-w-5xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both text-balance">
            Indulgence, crafted by hand.
          </h1>
          
          <p className="font-sans text-base sm:text-lg md:text-2xl text-background/80 max-w-2xl mx-auto mb-8 md:mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both px-4">
            Neighborhood bakery turned online storefront. We make celebratory, craft-made desserts that you'll remember.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both w-full max-w-md mx-auto sm:max-w-none px-4">
            <Link href="/category/all" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg rounded-full shadow-xl shadow-primary/20 font-bold w-full text-primary-foreground hover:scale-105 transition-transform">
                Shop All Treats
              </Button>
            </Link>
            <Link href="/category/all?tag=deal" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg rounded-full bg-transparent border-background/30 text-background hover:bg-background hover:text-foreground w-full">
                View Deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 md:px-6 -mt-6 md:-mt-10 relative z-20">
        <CategorySection />
      </section>

      {/* Popular Products */}
      <div className="container mx-auto px-4 md:px-6">
        <ProductRow 
          tag="popular" 
          title="Neighborhood Favorites" 
          icon={<Star className="w-4 h-4 md:w-5 md:h-5 fill-primary" />}
          link="/category/all?tag=popular"
        />
        
        {/* Deal Divider */}
        <section className="my-8 md:my-16 rounded-[2rem] bg-secondary/10 border border-secondary/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="grid md:grid-cols-2 items-stretch relative z-10">
            <div className="p-8 md:p-16 lg:p-24 flex flex-col items-start justify-center text-left order-2 md:order-1">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">The Workshop Deal Box</h2>
              <p className="font-sans text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-md">
                Can't decide? Get a curated selection of our best-selling cupcakes and tarts, boxed beautifully for gifting or hoarding.
              </p>
              <Link href="/category/all?tag=deal" className="w-full sm:w-auto">
                <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg rounded-full shadow-lg shadow-primary/20 group w-full sm:w-auto">
                  Grab a Box <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="h-48 sm:h-64 md:h-auto min-h-[250px] relative order-1 md:order-2">
              <img 
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop" 
                alt="Deal Box" 
                className="absolute inset-0 w-full h-full object-cover object-center md:clip-path-polygon-[10%_0,100%_0,100%_100%,0_100%]"
              />
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <ProductRow 
          tag="new" 
          title="Fresh Out The Oven" 
          icon={<Clock className="w-4 h-4 md:w-5 md:h-5" />}
          link="/category/all?tag=new"
        />

        {/* Deals */}
        <ProductRow 
          tag="deal" 
          title="Sweet Steals" 
          icon={<Tag className="w-4 h-4 md:w-5 md:h-5" />}
          link="/category/all?tag=deal"
        />
      </div>
    </div>
  );
}
