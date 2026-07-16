import { Gift, Sparkles } from 'lucide-react';
import { useListProducts } from '@/lib/api/products';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHero } from '@/components/page-hero';

export default function DealBoxesPage() {
  const { data: dealBoxes, isLoading } = useListProducts({ tag: 'deal-box' });

  return (
    <div className="pb-20">
      <PageHero
        title="Signature boxes made for gifting, sharing, and bulk orders"
        description="This page is now separate from regular categories, and the admin panel has its own upload tab for deal boxes as well."
        badge={{ icon: <Gift className="w-4 h-4" />, label: 'Deal Boxes' }}
      />

      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="mb-8 rounded-3xl border border-border bg-card/80 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-foreground">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold">Bulk & festive ready</h2>
              <p className="text-muted-foreground mt-2">
                Great for corporate gifting, birthdays, launches, and family
                gatherings. Pricing can be customized through the admin side by
                uploading dedicated deal box products.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : dealBoxes && dealBoxes.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {dealBoxes.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card/60 py-20 text-center">
            <h3 className="font-serif text-3xl font-bold">No deal boxes live yet</h3>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              Admin se pehla deal box upload karte hi yahan automatically show ho jayega.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
