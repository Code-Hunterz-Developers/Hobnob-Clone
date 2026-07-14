import React from 'react';
import { Link } from 'wouter';
import { ShoppingBag, Menu, Croissant, CakeSlice, MapPin } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useListCategories } from '@/lib/api/categories';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LocationModal } from '@/components/location-modal';

export function Layout({ children }: { children: React.ReactNode }) {
  const { cartCount } = useCart();
  const { data: categories } = useListCategories();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [city, setCity] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [locationModalOpen, setLocationModalOpen] = React.useState(false);

  React.useEffect(() => {
    const savedCity = localStorage.getItem('sweet-treats-city');
    const savedAddress = localStorage.getItem('sweet-treats-address');
    if (savedCity) {
      setCity(savedCity);
      if (savedAddress) setAddress(savedAddress);
    } else {
      setLocationModalOpen(true);
    }
  }, []);

  const handleSelectCity = (selectedCity: string, detectedAddress?: string) => {
    setCity(selectedCity);
    localStorage.setItem('sweet-treats-city', selectedCity);

    if (detectedAddress) {
      setAddress(detectedAddress);
      localStorage.setItem('sweet-treats-address', detectedAddress);
    } else {
      // Manual city pick without a precise address — clear any stale detected address.
      setAddress(null);
      localStorage.removeItem('sweet-treats-address');
    }

    setLocationModalOpen(false);
  };

  const NavLinks = () => (
    <>
      {categories?.map((cat) => (
        <Link
          key={cat.id}
          href={`/category/${cat.slug}`}
          className="text-foreground hover:text-primary transition-colors font-medium text-lg lg:text-base"
        >
          {cat.name}
        </Link>
      ))}
      <Link href="/track-order" className="text-foreground hover:text-primary transition-colors font-medium text-lg lg:text-base">
        Track Order
      </Link>
      
      {/* Mobile-only city selector */}
      <div className="md:hidden mt-4 pt-4 border-t border-border">
        <Button variant="ghost" className="w-full justify-start px-0 text-muted-foreground hover:text-primary" onClick={() => {
          setMobileMenuOpen(false);
          setLocationModalOpen(true);
        }}>
          <MapPin className="w-5 h-5 mr-2 shrink-0" />
          <span className="truncate">{city ? `Deliver to: ${address ?? city}` : 'Select Delivery City'}</span>
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <LocationModal 
        open={locationModalOpen} 
        onOpenChange={setLocationModalOpen} 
        onSelectCity={handleSelectCity} 
      />
      
      {/* Top utility banner */}
      <div className="bg-foreground text-background py-2 text-center text-xs tracking-wider font-medium font-sans uppercase px-4 truncate">
        Free delivery on orders over Rs. 5,000. Baked fresh daily.
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:bg-muted -ml-2" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="font-serif text-2xl text-left text-primary">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 mt-8">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center transform group-hover:-rotate-12 transition-transform shadow-md shrink-0">
                <CakeSlice className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="font-serif text-xl md:text-3xl font-bold tracking-tight text-foreground truncate max-w-[140px] sm:max-w-none">
                Sweet Treats
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <NavLinks />
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            {city && (
              <Button 
                variant="ghost" 
                size="sm"
                className="hidden md:flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-muted rounded-full max-w-[200px]" 
                onClick={() => setLocationModalOpen(true)}
                title={address ?? city}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{address ?? city}</span>
              </Button>
            )}
            <Link href="/cart" data-testid="link-cart">
              <Button variant="ghost" className="relative p-2 h-auto text-foreground hover:bg-muted hover-elevate rounded-full transition-all group">
                <ShoppingBag className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full relative flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background pt-16 pb-8 border-t-4 border-primary mt-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="sm:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-md">
                  <Croissant className="w-6 h-6" />
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight text-background">
                  Sweet Treats
                </span>
              </Link>
              <p className="text-muted-foreground max-w-sm font-sans text-base md:text-lg">
                Craft-made, indulgent, and celebratory desserts baked fresh in our neighborhood workshop. Treat yourself.
              </p>
            </div>
            
            <div>
              <h4 className="font-serif font-bold text-xl mb-6 text-primary">Shop</h4>
              <ul className="space-y-4 font-sans text-muted-foreground">
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/category/${cat.slug}`} className="hover:text-primary transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-serif font-bold text-xl mb-6 text-primary">Contact</h4>
              <ul className="space-y-4 font-sans text-muted-foreground">
                <li>123 Bakery Lane</li>
                <li>Sugar City, SC 12345</li>
                <li>hello@sweettreats.example.com</li>
                <li>(555) 123-4567</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-muted-foreground/20 text-center md:text-left text-muted-foreground font-sans text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} Sweet Treats Bakery. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="hover:text-primary cursor-pointer transition-colors">Instagram</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Facebook</span>
              <span className="hover:text-primary cursor-pointer transition-colors">Twitter</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
