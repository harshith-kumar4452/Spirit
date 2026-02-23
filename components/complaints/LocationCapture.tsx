'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { reverseGeocode, GeocodedAddress } from '@/lib/geo/reverseGeocode';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MapPin, RefreshCw, Keyboard, Crosshair, Search, CheckCircle2 } from 'lucide-react';

const SingleLocationMap = dynamic(
  () => import('@/components/map/SingleLocationMap').then((mod) => mod.SingleLocationMap),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl" /> }
);

interface LocationCaptureProps {
  onLocationSelect: (location: { lat: number; lng: number }, address: GeocodedAddress) => void;
  selectedLocation: { lat: number; lng: number } | null;
}

/* ── Forward geocode via Nominatim (address → lat/lng) ── */
async function forwardGeocode(query: string): Promise<{ lat: number; lng: number; address: string; area: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const results = await res.json();
    if (!results.length) return null;
    const top = results[0];
    return {
      lat: parseFloat(top.lat),
      lng: parseFloat(top.lon),
      address: top.display_name,
      area: top.display_name.split(',')[0].trim(),
    };
  } catch {
    return null;
  }
}

export function LocationCapture({ onLocationSelect, selectedLocation }: LocationCaptureProps) {
  const { location, error, loading, refresh } = useGeolocation();
  const [address, setAddress] = useState<GeocodedAddress | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Manual mode state
  const [mode, setMode] = useState<'gps' | 'manual'>('gps');
  const [manualQuery, setManualQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ lat: number; lng: number; address: string; area: string }>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualAddress, setManualAddress] = useState<GeocodedAddress | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When GPS location arrives, reverse geocode it
  useEffect(() => {
    if (mode !== 'gps') return;
    const loc = selectedLocation || location;
    if (!loc) return;
    setLoadingAddress(true);
    reverseGeocode(loc.lat, loc.lng).then((geocoded) => {
      setAddress(geocoded);
      setLoadingAddress(false);
      onLocationSelect(loc, geocoded);
    });
  }, [location, selectedLocation, mode]);

  // Debounced address search for manual mode
  useEffect(() => {
    if (mode !== 'manual') return;
    if (manualQuery.trim().length < 3) { setSuggestions([]); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualQuery)}&format=json&limit=5&addressdetails=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const results = await res.json();
        setSuggestions(results.map((r: any) => ({
          lat: parseFloat(r.lat),
          lng: parseFloat(r.lon),
          address: r.display_name,
          area: r.address?.suburb || r.address?.neighbourhood || r.address?.city_district || r.address?.city || r.display_name.split(',')[0].trim(),
        })));
      } catch {
        setSuggestions([]);
      }
      setSearchLoading(false);
    }, 600);
  }, [manualQuery, mode]);

  const handleSuggestionSelect = (s: { lat: number; lng: number; address: string; area: string }) => {
    const loc = { lat: s.lat, lng: s.lng };
    const addr: GeocodedAddress = { address: s.address, area: s.area };
    setManualLocation(loc);
    setManualAddress(addr);
    setManualQuery(s.area);
    setSuggestions([]);
    onLocationSelect(loc, addr);
  };

  const currentLocation = mode === 'gps' ? (selectedLocation || location) : manualLocation;
  const currentAddress = mode === 'gps' ? address : manualAddress;

  /* ── GPS loading / error states ── */
  if (mode === 'gps' && loading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-600">Getting your location...</p>
        <button
          onClick={() => setMode('manual')}
          className="mt-4 text-sm text-brand-500 hover:text-brand-600 underline underline-offset-2"
        >
          Enter address manually instead
        </button>
      </div>
    );
  }

  if (mode === 'gps' && error) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-1">Location Access Denied</h3>
        <p className="text-sm text-slate-500 mb-4">
          Allow location access or enter your address manually.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => setMode('manual')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
          >
            <Keyboard className="w-4 h-4" />
            Enter Manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setMode('gps')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'gps'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <Crosshair className="w-4 h-4" />
          Use My GPS
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'manual'
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <Keyboard className="w-4 h-4" />
          Type Address
        </button>
      </div>

      {/* Manual address search input */}
      {mode === 'manual' && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Search for an address, landmark, or area..."
              className="w-full pl-10 pr-4 py-3.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              autoFocus
            />
            {searchLoading && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <LoadingSpinner />
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionSelect(s)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-brand-50 transition-colors border-b border-slate-100 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{s.area}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{s.address}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {manualQuery.trim().length >= 3 && suggestions.length === 0 && !searchLoading && (
            <p className="text-xs text-slate-400 mt-2 pl-1">No results found. Try a different search.</p>
          )}
        </div>
      )}

      {/* Map Preview */}
      {currentLocation && (
        <div className="h-56 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <SingleLocationMap lat={currentLocation.lat} lng={currentLocation.lng} />
        </div>
      )}

      {/* Confirmed Address Display */}
      {currentAddress && currentLocation && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{currentAddress.area}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{currentAddress.address}</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nudge to switch modes */}
      {mode === 'gps' && currentLocation && (
        <p className="text-xs text-slate-400 text-center">
          Wrong location?{' '}
          <button onClick={() => setMode('manual')} className="text-brand-500 hover:underline">
            Type an address instead
          </button>
        </p>
      )}
    </div>
  );
}
