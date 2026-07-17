import React from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingBag, Menu, MapPin } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LocationModal } from '@/components/location-modal';
import { BrandLogo } from '@/components/brand-logo';

const primaryNavLinks = [
  { href: '/category/all', label: 'All Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/deal-boxes', label: 'Deal Boxes' },
  { href: '/track-order', label: 'Track Order' },
] as const;

const footerPageLinks = [
  { href: '/category/all', label: 'All Products' },
  { href: '/categories', label: 'Categories' },
  { href: '/deal-boxes', label: 'Deal Boxes' },
  { href: '/track-order', label: 'Track Order' },
  { href: '/feedback', label: 'Feedback' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
] as const;

const socialLinks = [
  { href: 'https://www.facebook.com/share/1CwHEXaTtt/', label: 'Facebook' },
  {
    href: 'https://www.tiktok.com/@lavashakkarachi?_r=1&_d=f0417gmfal2c0c&sec_uid=MS4wLjABAAAAg676O1FLWtdXft8GkimjLAyjSj0xiBIcUoJq3jsAozSkzZl5n082jLKu5HpD88Fq&share_author_id=7531509435597440022&sharer_language=en&source=h5_m&u_code=elfc24m31ifi76&timestamp=1784234117&user_id=7531509435597440022&sec_user_id=MS4wLjABAAAAg676O1FLWtdXft8GkimjLAyjSj0xiBIcUoJq3jsAozSkzZl5n082jLKu5HpD88Fq&item_author_type=1&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7661423365399791382&share_link_id=c3bcc1de-5652-4541-b711-2d62cb7215c4&share_app_id=1233&ugbiz_name=ACCOUNT&ug_btm=b8727%2Cb7360&social_share_type=5&enable_checksum=1',
    label: 'TikTok',
  },
] as const;

export function Layout({ children }: { children: React.ReactNode }) {
  const { cartCount } = useCart();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [city, setCity] = React.useState<string | null>(null);
  const [address, setAddress] = React.useState<string | null>(null);
  const [locationModalOpen, setLocationModalOpen] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

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
      {primaryNavLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={() => setMobileMenuOpen(false)}
          className="text-foreground hover:text-primary transition-colors font-medium text-lg lg:text-base"
        >
          {link.label}
        </Link>
      ))}
      
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
      <div className="bg-primary text-primary-foreground py-2 text-center text-xs tracking-[0.22em] font-semibold font-sans uppercase px-4 truncate">
        Dual Flavours, One Passion. Freshly packed for Karachi.
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between gap-3">
          
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

            <Link href="/" className="flex items-center group" data-testid="link-home">
              <BrandLogo imageClassName="h-14 md:h-16 group-hover:scale-[1.02] transition-transform" />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
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
      <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t-4 border-secondary mt-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-12">
            <div className="sm:col-span-2">
              <Link href="/" className="mb-6 group inline-flex">
                <BrandLogo imageClassName="h-24 md:h-28 brightness-110" />
              </Link>
              <p className="text-primary-foreground/78 max-w-sm font-sans text-base md:text-lg">
                Signature lavashak platters, chocolate pairings, and fruit-forward gifting boxes prepared with a rich Karachi identity.
              </p>
            </div>
            
            <div>
              <h4 className="font-serif font-bold text-xl mb-6 text-secondary">Pages</h4>
              <ul className="space-y-4 font-sans text-primary-foreground/78">
                {footerPageLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-secondary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-serif font-bold text-xl mb-6 text-secondary">Payments</h4>
              <ul className="space-y-4 font-sans text-primary-foreground/78">
                <li>Verified payments may be required before dispatch on selected orders.</li>
                <li>Payment records are retained for support and dispute handling.</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-primary-foreground/15 text-center md:text-left text-primary-foreground/72 font-sans text-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <p>&copy; {new Date().getFullYear()} Lavashak Karachi. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                  className="hover:text-secondary transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
