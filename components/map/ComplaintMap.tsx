'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Complaint } from '@/lib/utils/types';
import { CategoryBadge } from '@/components/complaints/CategoryBadge';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom blue marker for user location
function createUserLocationIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 20px; height: 20px;
      background: #3B82F6;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.5);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Create custom red marker for all complaints
function createComplaintMarker(status: string) {
  const resolved = status === 'resolved';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 18px; height: 18px;
      background: ${resolved ? '#D1D5DB' : '#EF4444'};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
      ${resolved ? 'opacity: 0.6;' : ''}
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    // Guard: only setView when the map container is fully mounted
    if (!map || !map.getContainer()) return;
    try {
      map.setView(center, 13);
    } catch {
      // Map not ready yet — silently ignore
    }
  }, [center, map]);
  return null;
}

interface ComplaintMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
}

// Haversine formula to calculate distance
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function ComplaintMap({
  center: initialCenter = [12.9716, 77.5946], // Default: Bangalore
  zoom = 13,
  className = 'h-[500px]',
}: ComplaintMapProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [center, setCenter] = useState<[number, number]>(initialCenter);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(location);
          setCenter(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Fetch complaints and filter by radius
  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Complaint[];

      setComplaints(data);
    });

    return () => unsubscribe();
  }, [userLocation]);

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-200 shadow-sm ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={true}
      >
        <MapUpdater center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User's current location - Blue marker */}
        {userLocation && (
          <>
            <Marker position={userLocation} icon={createUserLocationIcon()}>
              <Popup>
                <div className="text-center p-2">
                  <p className="text-sm font-semibold text-brand-600">Your Location</p>
                  <p className="text-xs text-slate-500 mt-1">You are here</p>
                </div>
              </Popup>
            </Marker>

            {/* Blue circle showing 10km radius */}
            <Circle
              center={userLocation}
              radius={10000} // 10km in meters
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.05,
                weight: 2,
                opacity: 0.3,
              }}
            />
          </>
        )}

        {/* Complaints - Red markers */}
        {complaints.map((complaint) => (
          <Marker
            key={complaint.id}
            position={[complaint.location.lat, complaint.location.lng]}
            icon={createComplaintMarker(complaint.status)}
          >
            <Popup>
              <div className="min-w-[200px] p-2">
                <div className="flex items-center gap-2 mb-2">
                  <CategoryBadge category={complaint.category} small />
                  <StatusBadge status={complaint.status} small />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  {complaint.title}
                </h3>
                <p className="text-xs text-slate-500 mb-2">{complaint.location.address}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {complaint.upvotes}
                  </span>
                  <Link
                    href={`/complaint/${complaint.id}`}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    View →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
