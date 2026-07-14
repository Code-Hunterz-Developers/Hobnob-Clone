import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan'
];

// Approximate coordinates for each supported city, used to find the closest
// match to the browser's reported geolocation.
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Lahore: { lat: 31.5497, lng: 74.3436 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5651, lng: 73.0169 },
  Faisalabad: { lat: 31.4504, lng: 73.1350 },
  Multan: { lat: 30.1575, lng: 71.5249 },
};

function getNearestCity(lat: number, lng: number): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const distance = (aLat: number, aLng: number, bLat: number, bLng: number) => {
    const R = 6371; // km
    const dLat = toRad(bLat - aLat);
    const dLng = toRad(bLng - aLng);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * sinLng * sinLng;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  let nearest = CITIES[0];
  let nearestDistance = Infinity;
  for (const city of CITIES) {
    const coords = CITY_COORDS[city];
    const d = distance(lat, lng, coords.lat, coords.lng);
    if (d < nearestDistance) {
      nearestDistance = d;
      nearest = city;
    }
  }
  return nearest;
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

  const handleUseCurrentLocation = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Location services aren\'t supported by your browser. Please select a city below.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nearestCity = getNearestCity(latitude, longitude);
        const address = await reverseGeocodeAddress(latitude, longitude);
        setIsLocating(false);
        onSelectCity(nearestCity, address ?? undefined);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location access was denied. Please select a city below.');
        } else {
          setLocationError('We couldn\'t detect your location. Please select a city below.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-background border-border rounded-3xl shadow-xl w-[calc(100vw-32px)] max-w-md mx-auto my-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Select your city</DialogTitle>
          <DialogDescription>Choose your delivery city for Sweet Treats Bakery</DialogDescription>
        </DialogHeader>
        <div className="bg-primary p-8 text-primary-foreground text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="w-16 h-16 bg-primary-foreground/10 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
            <MapPin className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-bold mb-2 relative z-10">Where to?</h2>
          <p className="text-primary-foreground/80 font-sans text-base relative z-10">
            Select your city to see what's baking near you.
          </p>
        </div>
        <div className="p-6">
          <Button 
            variant="outline" 
            className="w-full mb-6 h-14 rounded-2xl border-border bg-card text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary gap-2 font-bold text-base transition-all"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            <Navigation className={`w-5 h-5 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Locating...' : 'Use Current Location'}
          </Button>

          {locationError && (
            <div className="flex items-start gap-2 mb-6 -mt-2 text-sm text-destructive bg-destructive/10 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{locationError}</span>
            </div>
          )}
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-bold tracking-widest">Or select city</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CITIES.map(city => (
              <Button
                key={city}
                variant="ghost"
                className="h-12 rounded-xl bg-muted/50 text-foreground hover:bg-primary hover:text-primary-foreground font-medium transition-colors"
                onClick={() => onSelectCity(city)}
              >
                {city}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
