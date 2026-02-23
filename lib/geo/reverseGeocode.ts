export interface GeocodedAddress {
  address: string;
  area: string;
}

// Rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second

async function waitForRateLimit() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedAddress> {
  await waitForRateLimit();

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();

    return {
      address: data.display_name || 'Unknown location',
      area: data.address?.suburb || data.address?.neighbourhood || data.address?.city || 'Unknown area',
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      area: 'Unknown area',
    };
  }
}
