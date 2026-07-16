import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Navigation, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/components/brand-logo';

// Serviceable Karachi neighbourhoods, societies, and landmarks. Kept
// alphabetical to match how they're browsed/searched in the picker below.
const KARACHI_AREAS = [
  'Abbasi Shaheed Hospital',
  'Adamjee Nagar Society',
  'Agha Khan Hospital',
  'Al Hamra Society',
  'Al Hilal Society',
  'Amil Colony',
  'Askari 4',
  'Askari 5',
  'Bahadurabad',
  'Baldia Town',
  'Bath Island',
  'Boat Basin',
  'Burns Road',
  'Chandni Chowk',
  'Clifton Block 2',
  'Clifton Block 5',
  'Clifton Block 7',
  'Defence Phase 1',
  'Defence Phase 2',
  'Defence Phase 4',
  'Defence Phase 5',
  'Defence Phase 6',
  'Defence Phase 8',
  'Federal B Area Block 1',
  'Federal B Area Block 10',
  'Federal B Area Block 20',
  'Garden East',
  'Garden West',
  'Gulberg Town',
  'Gulistan e Johar - Block 1',
  'Gulistan e Johar - Block 2',
  'Gulistan e Johar - Block 3',
  'Gulistan e Johar - Block 4',
  'Gulistan e Johar - Block 7',
  'Gulistan e Johar - Block 13',
  'Gulistan e Johar - Block 15',
  'Gulshan e Iqbal Block 1',
  'Gulshan e Iqbal Block 2',
  'Gulshan e Iqbal Block 3',
  'Gulshan e Iqbal Block 4',
  'Gulshan e Iqbal Block 5',
  'Gulshan e Iqbal Block 6',
  'Gulshan e Iqbal Block 7',
  'Gulshan e Iqbal Block 10',
  'Gulshan e Iqbal Block 13',
  'Jamshed Town',
  'Jinnah Hospital',
  'Johar Mor',
  'Khayaban e Ittehad',
  'Khayaban e Shahbaz',
  'Korangi Industrial Area',
  'Korangi No. 1',
  'Korangi No. 4',
  'Landhi',
  'Liaquat National Hospital',
  'Liaquatabad',
  'Malir Cantt',
  'Malir Colony',
  'Manzoor Colony',
  'Model Colony',
  'Nazimabad Block 1',
  'Nazimabad Block 2',
  'Nazimabad Block 3',
  'Nazimabad Block 4',
  'North Karachi',
  'North Nazimabad Block A',
  'North Nazimabad Block B',
  'North Nazimabad Block C',
  'North Nazimabad Block D',
  'North Nazimabad Block H',
  'North Nazimabad Block L',
  'Orangi Town',
  'PECHS Block 2',
  'PECHS Block 6',
  'Saddar Town',
  'Shah Faisal Colony',
  'Shaheed e Millat Road',
  'Sharfabad',
  'SITE Town',
  'Soldier Bazaar',
  'South City Hospital',
  'Tariq Road',
  'Zamzama',
  'Ziauddin Hospital',
] as const;

export function LocationModal({
  open,
  onOpenChange,
  onSelectCity
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCity: (city: string, address?: string) => void;
}) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [comboOpen, setComboOpen] = useState(false);

  const handleUseCurrentLocation = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Location services aren\'t supported by your browser. Please select an area below.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const address = await reverseGeocodeAddress(latitude, longitude);
        setIsLocating(false);
        onSelectCity('Karachi', address ?? undefined);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access was denied. Please select an area below.');
        } else {
          setLocationError('We couldn\'t detect your location. Please select an area below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  const handleConfirm = () => {
    if (!selectedArea) return;
    onSelectCity('Karachi', selectedArea);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-background border-border rounded-3xl shadow-xl w-[calc(100vw-32px)] max-w-md mx-auto my-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Select your order type</DialogTitle>
          <DialogDescription>Choose your delivery area in Karachi for Lavashak Karachi</DialogDescription>
        </DialogHeader>

        <div className="bg-primary py-5 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-foreground/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <BrandLogo className="justify-center relative z-10" imageClassName="h-14" />
        </div>

        <div className="p-6">
          <h2 className="text-center text-muted-foreground font-bold text-lg mb-4">Select Your Order Type</h2>

          <div className="flex justify-center mb-5">
            <div className="px-8 py-3 rounded-full bg-primary text-secondary font-bold text-base">
              Delivery
            </div>
          </div>

          <p className="text-center text-muted-foreground font-medium mb-4">Please select your location</p>

          <Button
            variant="outline"
            className="w-full mb-4 h-14 rounded-2xl border-border bg-card text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary gap-2 font-bold text-base transition-all"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Locating...' : 'Use Current Location'}
          </Button>

          {locationError && (
            <div className="flex items-start gap-2 mb-4 text-sm text-destructive bg-destructive/10 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{locationError}</span>
            </div>
          )}

          <label className="block font-bold text-sm text-foreground mb-2">Please select your location</label>
          <Popover open={comboOpen} onOpenChange={setComboOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={comboOpen}
                className="w-full h-14 rounded-2xl border-border bg-card justify-between font-normal text-base"
              >
                <span className={cn('truncate', !selectedArea && 'text-muted-foreground')}>
                  {selectedArea ?? 'Search for your area'}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search area..." />
                <CommandList>
                  <CommandEmpty>No matching area found.</CommandEmpty>
                  <CommandGroup>
                    {KARACHI_AREAS.map((area) => (
                      <CommandItem
                        key={area}
                        value={area}
                        onSelect={() => {
                          setSelectedArea(area);
                          setComboOpen(false);
                        }}
                      >
                        {area}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="px-6 pb-8 pt-0">
          <Button
            className="w-full h-14 rounded-2xl bg-primary text-secondary hover:bg-primary/90 font-bold text-base"
            disabled={!selectedArea}
            onClick={handleConfirm}
          >
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Reverse-geocodes coordinates into a human-readable street address (e.g.
// "Plot 19, Johar Mor") using the free OpenStreetMap Nominatim API. Returns
// null if the lookup fails or times out, so callers can fall back to city-only.
async function reverseGeocodeAddress(lat: number, lng: number): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
      { headers: { 'Accept-Language': 'en' }, signal: controller.signal }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const a = data.address || {};

    // Build the most specific address possible.
    // Priority (most → least specific):
    //   1. amenity / building name (e.g. "Johar More Chowk")
    //   2. house_number + road (e.g. "Plot 19, Johar Road")
    //   3. neighbourhood / quarter / suburb / residential (area name)
    //   4. city_district / county (broader zone)
    // We combine up to three of these so the result reads naturally.

    const specific =
      a.amenity || a.building || a.shop || a.tourism || a.leisure || null;

    const streetLine =
      a.house_number && a.road
        ? `Plot ${a.house_number}, ${a.road}`
        : a.road || null;

    const areaLine =
      a.neighbourhood ||
      a.quarter ||
      a.suburb ||
      a.residential ||
      a.village ||
      null;

    const zoneLine = a.city_district || a.county || null;

    const parts = [specific, streetLine, areaLine, zoneLine].filter(Boolean);

    if (parts.length > 0) return parts.slice(0, 3).join(', ');

    // Last resort: take first 3 comma-parts of the display_name
    return data.display_name
      ? data.display_name.split(',').slice(0, 3).join(',').trim()
      : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
