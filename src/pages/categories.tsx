import { Link } from 'wouter';
import { ArrowRight, Layers3 } from 'lucide-react';
import { useListCategories } from '@/lib/api/categories';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesPage() {
  const { data: categories, isLoading } = useListCategories();
  const marqueeCategories = [...(categories ?? []), ...(categories ?? [])];

  return (
    <div className="pb-20">
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-2 text-xs font-semibold tracking-[0.22em] uppercase">
            <Layers3 className="w-4 h-4" />
            Categories
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mt-6">
            Browse every collection in one place
          </h1>
          <p className="max-w-2xl mx-auto mt-4 text-primary-foreground/80 text-lg">
            Cakes, cookies, tarts, and signature deal boxes. Pick a collection and
            jump straight into the treats you want.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold">Shop By Category</h2>
            <p className="text-muted-foreground mt-2">
              Clean links without cluttering the main navigation.
            </p>
          </div>
          <Link href="/category/all">
            <Button variant="outline" className="rounded-full">
              View All Products
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[4/5] rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="category-marquee overflow-hidden py-2">
            <div className="category-marquee-track flex gap-6 w-max">
              {marqueeCategories.map((category, index) => (
                <div key={`${category.id}-${index}`} className="w-[86vw] sm:w-[360px] lg:w-[380px] xl:w-[400px] shrink-0">
                  <Link
                    href={`/category/${category.slug}`}
                    className="group relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-500 block"
                  >
                    <div className="aspect-[4/5] relative">
                      {category.imageUrl ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-secondary/25 to-accent/20" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                        <p className="text-xs font-semibold tracking-[0.22em] uppercase text-white/70">
                          Collection
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-4">
                          <h3 className="font-serif text-3xl font-bold">{category.name}</h3>
                          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur">
                            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
