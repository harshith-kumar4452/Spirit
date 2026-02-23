'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Complaint } from '@/lib/utils/types';
import { CategoryBadge } from '@/components/complaints/CategoryBadge';
import { StatusBadge } from '@/components/complaints/StatusBadge';
import L from 'leaflet';
import ngeohash from 'ngeohash';
import 'leaflet/dist/leaflet.css';

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

// Create custom red marker for complaints
function createComplaintIcon() {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 16px; height: 16px;
      background: #EF4444;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

interface PublicMapProps {
  className?: string;
}

export function PublicMap({ className = 'h-[400px]' }: PublicMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

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
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default to Bangalore if location access denied
          setUserLocation([12.9716, 77.5946]);
          setLoading(false);
        }
      );
    } else {
      // Default to Bangalore
      setUserLocation([12.9716, 77.5946]);
      setLoading(false);
    }
  }, []);

  // Fetch nearby complaints (within ~10km radius)
  useEffect(() => {
    if (!userLocation) return;

    const [lat, lng] = userLocation;

    // Calculate geohash bounds for radius query
    const geohashPrecision = 4; // ~20km x 20km area
    const centerGeohash = ngeohash.encode(lat, lng, geohashPrecision);

    // Get neighbors to cover circular area
    const neighbors = ngeohash.neighbors(centerGeohash);
    const allHashes = [centerGeohash, ...Object.values(neighbors)];

    // Query recent complaints (simplified - just get recent ones in general area)
    const q = query(
      collection(db, 'complaints'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Complaint[];

      // Filter complaints within 10km radius
      const nearby = data.filter((complaint) => {
        const distance = getDistance(
          lat,
          lng,
          complaint.location.lat,
          complaint.location.lng
        );
        return distance <= 10; // 10km radius
      });

      setComplaints(nearby);
    });

    return () => unsubscribe();
  }, [userLocation]);

  if (loading || !userLocation) {
    return (
      <div className={`${className} bg-slate-100 rounded-xl flex items-center justify-center`}>
        <p className="text-slate-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-slate-200 shadow-sm ${className}`}>
      <MapContainer
        center={userLocation}
        zoom={13}
        className="w-full h-full"
        zoomControl={true}
      >
        <MapUpdater center={userLocation} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User's current location - Blue marker */}
        <Marker position={userLocation} icon={createUserLocationIcon()}>
          <Popup>
            <div className="text-center p-2">
              <p className="text-sm font-semibold text-brand-600">Your Location</p>
              <p className="text-xs text-slate-500 mt-1">You are here</p>
            </div>
          </Popup>
        </Marker>

        {/* Blue circle showing radius */}
        <Circle
          center={userLocation}
          radius={10000} // 10km
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.05,
            weight: 2,
            opacity: 0.3,
          }}
        />

        {/* Nearby complaints - Red markers */}
        {complaints.map((complaint) => (
          <Marker
            key={complaint.id}
            position={[complaint.location.lat, complaint.location.lng]}
            icon={createComplaintIcon()}
          >
            <Popup>
              <div className="min-w-[180px] p-2">
                <div className="flex items-center gap-2 mb-2">
                  <CategoryBadge category={complaint.category} small />
                  <StatusBadge status={complaint.status} small />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">
                  {complaint.title}
                </h3>
                <p className="text-xs text-slate-500">{complaint.location.area}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// Haversine formula to calculate distance between two points
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
