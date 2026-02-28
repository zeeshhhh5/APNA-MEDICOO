// ─── Provider keys ────────────────────────────────────────────────────────────
// Google Maps — set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
// PositionStack — set GEO_MAPS_API_KEY in .env.local (legacy fallback)
const GOOGLE_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.GOOGLE_MAPS_API_KEY ||
  "";
const POSITIONSTACK_KEY = process.env.GEO_MAPS_API_KEY || "";
const POSITIONSTACK_BASE = "https://api.positionstack.com/v1"; // https — avoids mixed-content errors

export interface GeoLocation {
  lat: number;
  lng: number;
  label: string;
  city?: string;
  country?: string;
}

// ─── Reverse geocode: Google → PositionStack → raw coords ────────────────────
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // 1. Try Google Maps Geocoding API
  if (GOOGLE_KEY) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_KEY}`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      if (data.status === "OK" && data.results?.length > 0) {
        console.log("[GEOCODING] Google Maps success");
        return data.results[0].formatted_address as string;
      }
      console.warn("[GEOCODING] Google Maps status:", data.status);
    } catch (err) {
      console.warn("[GEOCODING] Google Maps failed:", err);
    }
  }

  // 2. Fallback: PositionStack
  if (POSITIONSTACK_KEY) {
    try {
      const res = await fetch(
        `${POSITIONSTACK_BASE}/reverse?access_key=${POSITIONSTACK_KEY}&query=${lat},${lng}&limit=1`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (!data.error && data.data?.length > 0) {
          console.log("[GEOCODING] PositionStack success");
          return data.data[0].label as string;
        }
        console.warn("[GEOCODING] PositionStack error:", data.error);
      }
    } catch (err) {
      console.warn("[GEOCODING] PositionStack failed:", err);
    }
  }

  // 3. Final fallback: raw coordinates
  console.warn("[GEOCODING] All providers failed — using raw coords");
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

// ─── Forward geocode: Google → PositionStack → null ──────────────────────────
export async function forwardGeocode(address: string): Promise<GeoLocation | null> {
  // 1. Try Google Maps
  if (GOOGLE_KEY) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_KEY}`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      if (data.status === "OK" && data.results?.length > 0) {
        const r = data.results[0];
        const loc = r.geometry.location;
        const city = r.address_components?.find((c: any) => c.types.includes("locality"))?.long_name;
        const country = r.address_components?.find((c: any) => c.types.includes("country"))?.long_name;
        return { lat: loc.lat, lng: loc.lng, label: r.formatted_address, city, country };
      }
    } catch (err) {
      console.warn("[GEOCODING] Google forward failed:", err);
    }
  }

  // 2. Fallback: PositionStack
  if (POSITIONSTACK_KEY) {
    try {
      const res = await fetch(
        `${POSITIONSTACK_BASE}/forward?access_key=${POSITIONSTACK_KEY}&query=${encodeURIComponent(address)}&limit=1`,
        { signal: AbortSignal.timeout(5000) }
      );
      const data = await res.json();
      if (!data.error && data.data?.length > 0) {
        const r = data.data[0];
        return { lat: r.latitude, lng: r.longitude, label: r.label, city: r.locality, country: r.country };
      }
    } catch (err) {
      console.warn("[GEOCODING] PositionStack forward failed:", err);
    }
  }

  return null;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function sortByDistance<T extends { id: string; latitude: number; longitude: number }>(
  items: T[],
  userLat: number,
  userLng: number
): (T & { distance: number })[] {
  return items
    .map((item) => ({
      ...item,
      distance: calculateDistance(userLat, userLng, item.latitude, item.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);
}
