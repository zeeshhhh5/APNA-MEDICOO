"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Hospital, MapPin, Loader2, Star, Phone,
  Navigation, Search, RefreshCw, Clock, Wifi,
  WifiOff, ChevronDown, ChevronUp, Filter,
  AlertCircle, CheckCircle, BedDouble, Activity,
} from "lucide-react";

interface BedInfo {
  availableEmergencyBeds: number;
  totalEmergencyBeds: number;
  availableIcuBeds: number;
  totalIcuBeds: number;
  availableGeneralBeds: number;
  totalGeneralBeds: number;
}

interface HospitalData {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  latitude: number;
  longitude: number;
  distance?: number;
  type: "Government" | "Private" | "Trust" | "Railway";
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  isLonavala: boolean;
  specialties: string[];
  bedInfo: BedInfo;
}

// Haversine formula — precise great-circle distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 12 mock hospitals — Lonavala & surrounding Pune/Mumbai region
const MOCK_HOSPITALS: Omit<HospitalData, "distance">[] = [
  {
    id: "h1",
    name: "Sanjeevani Medical Foundation",
    address: "Pandit Nehru Rd, near City Police Station, Lonavala, MH 410401",
    phone: "+912114273456",
    rating: 4.3,
    latitude: 18.7537,
    longitude: 73.4086,
    type: "Private",
    isOpen: true,
    openTime: "00:00",
    closeTime: "23:59",
    isLonavala: true,
    specialties: ["Emergency", "General Medicine", "Surgery", "Pediatrics", "Orthopedics"],
    bedInfo: { availableEmergencyBeds: 8, totalEmergencyBeds: 15, availableIcuBeds: 3, totalIcuBeds: 8, availableGeneralBeds: 22, totalGeneralBeds: 40 },
  },
  {
    id: "h2",
    name: "Girivar Multi-Specialty Hospital",
    address: "Modi Plaza, Old Mumbai–Pune Hwy, Tungarli, Lonavala, MH 410401",
    phone: "+912114273789",
    rating: 4.7,
    latitude: 18.7489,
    longitude: 73.4125,
    type: "Private",
    isOpen: true,
    openTime: "00:00",
    closeTime: "23:59",
    isLonavala: true,
    specialties: ["Cardiology", "Neurology", "Emergency", "ICU", "Surgery", "Gynecology"],
    bedInfo: { availableEmergencyBeds: 12, totalEmergencyBeds: 20, availableIcuBeds: 5, totalIcuBeds: 10, availableGeneralBeds: 35, totalGeneralBeds: 60 },
  },
  {
    id: "h3",
    name: "Yash Hospital & Research Centre",
    address: "Gharkul Society, Valvan Village, Lonavala, MH 410401",
    phone: "+912114274123",
    rating: 4.1,
    latitude: 18.7612,
    longitude: 73.4198,
    type: "Private",
    isOpen: true,
    openTime: "08:00",
    closeTime: "22:00",
    isLonavala: true,
    specialties: ["Emergency", "General Medicine", "Orthopedics", "Pediatrics", "Radiology"],
    bedInfo: { availableEmergencyBeds: 6, totalEmergencyBeds: 12, availableIcuBeds: 2, totalIcuBeds: 6, availableGeneralBeds: 18, totalGeneralBeds: 35 },
  },
  {
    id: "h4",
    name: "Shraddha Hospital",
    address: "Bhangarwadi, near Bus Stand, Lonavala, MH 410401",
    phone: "+912114272567",
    rating: 3.8,
    latitude: 18.7445,
    longitude: 73.4052,
    type: "Trust",
    isOpen: true,
    openTime: "07:00",
    closeTime: "21:00",
    isLonavala: true,
    specialties: ["Emergency", "General Medicine", "Surgery", "Maternity", "Gynecology"],
    bedInfo: { availableEmergencyBeds: 4, totalEmergencyBeds: 10, availableIcuBeds: 1, totalIcuBeds: 4, availableGeneralBeds: 12, totalGeneralBeds: 25 },
  },
  {
    id: "h5",
    name: "Railway Hospital Lonavala",
    address: "Gawliwada, near Railway Station, Lonavala, MH 410401",
    phone: "+912114271234",
    rating: 3.2,
    latitude: 18.7523,
    longitude: 73.4067,
    type: "Railway",
    isOpen: true,
    openTime: "06:00",
    closeTime: "22:00",
    isLonavala: true,
    specialties: ["General Medicine", "Emergency", "OPD Services", "Pharmacy"],
    bedInfo: { availableEmergencyBeds: 5, totalEmergencyBeds: 8, availableIcuBeds: 2, totalIcuBeds: 3, availableGeneralBeds: 14, totalGeneralBeds: 20 },
  },
  {
    id: "h6",
    name: "Ashtavinayak Hospital",
    address: "Somatne Phata, Malavli, Lonavala–Khandala Rd, MH 410406",
    phone: "+912114285600",
    rating: 4.4,
    latitude: 18.7710,
    longitude: 73.3920,
    type: "Private",
    isOpen: true,
    openTime: "00:00",
    closeTime: "23:59",
    isLonavala: true,
    specialties: ["Cardiology", "Emergency", "Critical Care", "Orthopedics", "Neurology"],
    bedInfo: { availableEmergencyBeds: 10, totalEmergencyBeds: 18, availableIcuBeds: 6, totalIcuBeds: 12, availableGeneralBeds: 28, totalGeneralBeds: 55 },
  },
  {
    id: "h7",
    name: "Khandala General Hospital",
    address: "Khandala Village, near Post Office, Khandala, MH 410301",
    phone: "+912114272011",
    rating: 3.5,
    latitude: 18.7607,
    longitude: 73.3835,
    type: "Government",
    isOpen: true,
    openTime: "08:00",
    closeTime: "20:00",
    isLonavala: true,
    specialties: ["General Medicine", "Pediatrics", "Maternity", "OPD"],
    bedInfo: { availableEmergencyBeds: 3, totalEmergencyBeds: 8, availableIcuBeds: 0, totalIcuBeds: 2, availableGeneralBeds: 10, totalGeneralBeds: 22 },
  },
  {
    id: "h8",
    name: "Sahyadri Super Speciality Hospital",
    address: "Wakad, Pimpri-Chinchwad, Pune, MH 411057",
    phone: "+912067210000",
    rating: 4.8,
    latitude: 18.5971,
    longitude: 73.7710,
    type: "Private",
    isOpen: true,
    openTime: "00:00",
    closeTime: "23:59",
    isLonavala: false,
    specialties: ["Cardiology", "Oncology", "Neurology", "Transplant", "Robotic Surgery", "NICU"],
    bedInfo: { availableEmergencyBeds: 20, totalEmergencyBeds: 30, availableIcuBeds: 14, totalIcuBeds: 25, availableGeneralBeds: 90, totalGeneralBeds: 180 },
  },
  {
    id: "h9",
    name: "Jupiter Hospital Pune",
    address: "Eastern Express Hwy, Baner, Pune, MH 411045",
    phone: "+912067611234",
    rating: 4.6,
    latitude: 18.5596,
    longitude: 73.7795,
    type: "Private",
    isOpen: true,
    openTime: "00:00",
    closeTime: "23:59",
    isLonavala: false,
    specialties: ["Cardiology", "Orthopedics", "Neurosurgery", "Urology", "Dermatology", "IVF"],
    bedInfo: { availableEmergencyBeds: 18, totalEmergencyBeds: 25, availableIcuBeds: 10, totalIcuBeds: 20, availableGeneralBeds: 70, totalGeneralBeds: 140 },
  },
  {
    id: "h10",
    name: "Igatpuri Rural Hospital",
    address: "Mumbai–Agra Hwy, Igatpuri, Nashik, MH 422403",
    phone: "+912553240456",
    rating: 3.4,
    latitude: 19.6948,
    longitude: 73.5591,
    type: "Government",
    isOpen: true,
    openTime: "07:00",
    closeTime: "21:00",
    isLonavala: false,
    specialties: ["General Medicine", "Emergency", "Surgery", "OPD", "Maternity"],
    bedInfo: { availableEmergencyBeds: 4, totalEmergencyBeds: 10, availableIcuBeds: 1, totalIcuBeds: 3, availableGeneralBeds: 16, totalGeneralBeds: 30 },
  },
  {
    id: "h11",
    name: "Fortis Hiranandani Hospital",
    address: "Sector 10-A, Vashi, Navi Mumbai, MH 400703",
    phone: "+912227668300",
    rating: 4.5,
    latitude: 19.0706,
    longitude: 73.0114,
    type: "Private",
    isOpen: true,
    openTime: "00:00",
    closeTime: "23:59",
    isLonavala: false,
    specialties: ["Cardiology", "Oncology", "Spine Surgery", "Nephrology", "Liver Transplant"],
    bedInfo: { availableEmergencyBeds: 15, totalEmergencyBeds: 22, availableIcuBeds: 9, totalIcuBeds: 18, availableGeneralBeds: 60, totalGeneralBeds: 120 },
  },
  {
    id: "h12",
    name: "Khopoli Sub-District Hospital",
    address: "Khopoli–Pen Rd, Khopoli, Raigad, MH 410203",
    phone: "+912192262333",
    rating: 3.1,
    latitude: 18.7883,
    longitude: 73.3465,
    type: "Government",
    isOpen: true,
    openTime: "08:00",
    closeTime: "20:00",
    isLonavala: false,
    specialties: ["General Medicine", "Emergency", "Maternity", "OPD", "Pharmacy"],
    bedInfo: { availableEmergencyBeds: 2, totalEmergencyBeds: 6, availableIcuBeds: 0, totalIcuBeds: 2, availableGeneralBeds: 8, totalGeneralBeds: 18 },
  },
];

type SortMode = "distance" | "rating" | "beds";
type FilterType = "All" | "Government" | "Private" | "Trust" | "Railway";

// Location cache key
const LOCATION_CACHE_KEY = "apna_medico_user_location";
const LOCATION_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

export default function HospitalLocator() {
  const [locating, setLocating] = useState(false);
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("distance");
  const [filterType, setFilterType] = useState<FilterType>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [signalStrength, setSignalStrength] = useState<"excellent" | "good" | "fair" | "poor" | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const geocodeAbortRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute hospitals with distances whenever userLocation changes
  const hospitalsWithDistance: HospitalData[] = useMemo(() => {
    return MOCK_HOSPITALS.map((h) => ({
      ...h,
      distance: userLocation
        ? haversine(userLocation.lat, userLocation.lng, h.latitude, h.longitude)
        : undefined,
    }));
  }, [userLocation]);

  // Apply filter → search → sort (Lonavala always pinned first)
  const displayed = useMemo(() => {
    let list = hospitalsWithDistance;

    if (filterType !== "All") list = list.filter((h) => h.type === filterType);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    return [...list].sort((a, b) => {
      // Lonavala hospitals always come first
      if (a.isLonavala && !b.isLonavala) return -1;
      if (!a.isLonavala && b.isLonavala) return 1;

      if (sortMode === "distance") {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      }
      if (sortMode === "rating") return b.rating - a.rating;
      if (sortMode === "beds") {
        const aTotal = a.bedInfo.availableEmergencyBeds + a.bedInfo.availableIcuBeds + a.bedInfo.availableGeneralBeds;
        const bTotal = b.bedInfo.availableEmergencyBeds + b.bedInfo.availableIcuBeds + b.bedInfo.availableGeneralBeds;
        return bTotal - aTotal;
      }
      return 0;
    });
  }, [hospitalsWithDistance, search, sortMode, filterType]);

  // Load cached location on mount
  const loadCachedLocation = useCallback(() => {
    try {
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
      if (cached) {
        const data: CachedLocation = JSON.parse(cached);
        const now = Date.now();
        if (now - data.timestamp < LOCATION_CACHE_TTL) {
          setUserLocation({ lat: data.lat, lng: data.lng });
          setLocationAccuracy(data.accuracy);
          setResolvedAddress(data.address || null);
          setSortMode("distance");
          setSignalStrength(
            data.accuracy < 10 ? "excellent" :
            data.accuracy < 50 ? "good" :
            data.accuracy < 100 ? "fair" : "poor"
          );
          console.log("[HospitalLocator] Using cached location:", data);
          return true;
        }
      }
    } catch (err) {
      console.warn("[HospitalLocator] Failed to load cached location:", err);
    }
    return false;
  }, []);

  // Save location to cache
  const saveLocationToCache = useCallback((lat: number, lng: number, accuracy: number, address?: string) => {
    try {
      const data: CachedLocation = {
        lat,
        lng,
        accuracy,
        timestamp: Date.now(),
        address
      };
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(data));
      console.log("[HospitalLocator] Cached location:", data);
    } catch (err) {
      console.warn("[HospitalLocator] Failed to cache location:", err);
    }
  }, []);

  // Resolve GPS coords → human address via Google Maps → PositionStack → raw coords
  const resolveAddress = useCallback(async (lat: number, lng: number) => {
    // Abort any previous geocode request
    if (geocodeAbortRef.current) geocodeAbortRef.current.abort();
    geocodeAbortRef.current = new AbortController();
    const signal = geocodeAbortRef.current.signal;
    setGeocoding(true);

    const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const positionstackKey = process.env.NEXT_PUBLIC_POSITIONSTACK_KEY;

    // 1. Google Maps Geocoding API
    if (googleKey) {
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleKey}`,
          { signal }
        );
        const data = await res.json();
        if (data.status === "OK" && data.results?.length > 0) {
          const address = data.results[0].formatted_address;
          setResolvedAddress(address);
          setGeocoding(false);
          saveLocationToCache(lat, lng, locationAccuracy || 0, address);
          return;
        }
        console.warn("[HospitalLocator] Google geocode status:", data.status);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.warn("[HospitalLocator] Google geocode failed:", err);
      }
    }

    // 2. PositionStack fallback (client-side key)
    if (positionstackKey) {
      try {
        const res = await fetch(
          `https://api.positionstack.com/v1/reverse?access_key=${positionstackKey}&query=${lat},${lng}&limit=1`,
          { signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (!data.error && data.data?.length > 0) {
            const address = data.data[0].label;
            setResolvedAddress(address);
            setGeocoding(false);
            saveLocationToCache(lat, lng, locationAccuracy || 0, address);
            return;
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.warn("[HospitalLocator] PositionStack geocode failed:", err);
      }
    }

    // 3. Raw coordinates as last resort
    const coords = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    setResolvedAddress(coords);
    setGeocoding(false);
    saveLocationToCache(lat, lng, locationAccuracy || 0, coords);
  }, [locationAccuracy, saveLocationToCache]);

  // Exponential backoff retry mechanism
  const retryLocation = useCallback((delay: number) => {
    if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    retryTimeoutRef.current = setTimeout(() => {
      console.log(`[HospitalLocator] Retrying location (attempt ${retryCount + 1})`);
      setRetryCount(prev => prev + 1);
      startLocationWatch();
    }, delay);
  }, [retryCount]);

  const startLocationWatch = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    // Clear any existing watch and retry timeout
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setLocating(true);
    
    // Phase 1: Fast initial fix with smart caching
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const roundedAccuracy = Math.round(accuracy);
        
        setUserLocation({ lat, lng });
        setLocationAccuracy(roundedAccuracy);
        setSortMode("distance");
        setLocating(false);
        setRetryCount(0); // Reset retry count on success
        
        // Update signal strength indicator
        setSignalStrength(
          accuracy < 10 ? "excellent" :
          accuracy < 50 ? "good" :
          accuracy < 100 ? "fair" : "poor"
        );
        
        resolveAddress(lat, lng);
        toast.success(`📍 Live location active — ±${roundedAccuracy}m`);
        
        console.log("[HospitalLocator] GPS success:", { lat, lng, accuracy });
      },
      (err) => {
        console.warn("[HospitalLocator] Initial GPS failed:", err);
        setLocating(false);
        
        // Exponential backoff retry strategy
        if (retryCount < 3) {
          const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // 1s, 2s, 4s max
          toast.error(`GPS failed. Retrying in ${delay/1000}s… (${retryCount + 1}/3)`);
          retryLocation(delay);
        } else {
          toast.error("Location detection failed. Check GPS permissions and signal.");
          // Try loading cached location as last resort
          if (!loadCachedLocation()) {
            toast.error("No cached location available. Showing all hospitals.");
          }
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 8000, 
        maximumAge: 120000 // Allow 2 minutes cached data for instant load
      }
    );
    
    // Phase 2: High-accuracy GPS watch with smart caching
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        const roundedAccuracy = Math.round(accuracy);
        
        setUserLocation({ lat, lng });
        setLocationAccuracy(roundedAccuracy);
        setSortMode("distance");
        setLocating(false);
        setRetryCount(0); // Reset retry count on success
        
        // Update signal strength
        setSignalStrength(
          accuracy < 10 ? "excellent" :
          accuracy < 50 ? "good" :
          accuracy < 100 ? "fair" : "poor"
        );
        
        resolveAddress(lat, lng);
        console.log("[HospitalLocator] GPS update:", { lat, lng, accuracy });
      },
      (err) => {
        console.warn("[HospitalLocator] GPS watch failed:", err);
        const msgs: Record<number, string> = {
          1: "🚫 Location permission denied. Enable in browser settings.",
          2: "📡 GPS unavailable. Check signal or try outdoors.",
          3: "⏱️ Location timed out. Retrying automatically…",
        };
        toast.error(msgs[err.code] ?? "📍 GPS tracking failed.");
        setLocating(false);
        
        // Retry with exponential backoff
        if (retryCount < 3) {
          const delay = Math.min(2000 * Math.pow(2, retryCount), 10000); // 2s, 4s, 8s max
          retryLocation(delay);
        }
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 60000 // Allow 1 minute cached data for smooth updates
      }
    );
    watchIdRef.current = id;
  }, [retryCount, resolveAddress, retryLocation, loadCachedLocation]);

  useEffect(() => {
    // First try to load cached location for instant UI
    const hasCached = loadCachedLocation();
    
    // Always start GPS tracking (will use cached location if available)
    startLocationWatch();
    
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (geocodeAbortRef.current) geocodeAbortRef.current.abort();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startLocationWatch, loadCachedLocation]);

  const getBedBar = (available: number, total: number) => {
    const pct = total > 0 ? (available / total) * 100 : 0;
    if (available === 0) return { color: "bg-red-500", text: "text-red-600", label: "Full", bg: "bg-red-50 dark:bg-red-900/20" };
    if (pct < 30) return { color: "bg-orange-400", text: "text-orange-600", label: "Critical", bg: "bg-orange-50 dark:bg-orange-900/20" };
    if (pct < 60) return { color: "bg-yellow-400", text: "text-yellow-700", label: "Limited", bg: "bg-yellow-50 dark:bg-yellow-900/20" };
    return { color: "bg-green-500", text: "text-green-600", label: "Good", bg: "bg-green-50 dark:bg-green-900/20" };
  };

  const typeColors: Record<FilterType, string> = {
    All: "",
    Government: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    Private: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    Trust: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Railway: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  };

  const formatDistance = (d?: number) => {
    if (d === undefined) return null;
    return d < 1 ? `${Math.round(d * 1000)} m` : `${d.toFixed(1)} km`;
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Hospital className="h-5 w-5 text-sky-500" />
            Nearby Hospitals
          </h2>
          <div className="mt-0.5 space-y-0.5">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              {userLocation ? (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                  <span className="flex items-center gap-2">
                    <span>📡 GPS active · {displayed.length} hospitals</span>
                    {signalStrength && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
                        signalStrength === "excellent" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        signalStrength === "good" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        signalStrength === "fair" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {signalStrength === "excellent" ? "🟢" : signalStrength === "good" ? "🔵" : signalStrength === "fair" ? "🟡" : "🔴"}
                        ±{locationAccuracy ?? "…"}m
                      </span>
                    )}
                  </span>
                </>
              ) : locating ? (
                <><Loader2 className="h-3 w-3 animate-spin text-sky-400 shrink-0" /> <span>Detecting location…</span></>
              ) : (
                <><AlertCircle className="h-3 w-3 text-amber-500 shrink-0" /> <span>Location unavailable · showing all</span></>
              )}
            </p>
            {/* Resolved address line */}
            {userLocation && (
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 ml-4">
                <MapPin className="h-3 w-3 shrink-0" />
                {geocoding ? (
                  <span className="italic">Resolving address…</span>
                ) : resolvedAddress ? (
                  <span className="truncate max-w-xs" title={resolvedAddress}>{resolvedAddress}</span>
                ) : null}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={startLocationWatch}
          disabled={locating}
          className="gap-1.5 dark:border-gray-700 dark:text-gray-300"
        >
          {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </Button>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, area or specialty…"
          className="pl-9 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
        />
      </div>

      {/* ── Filter + Sort Row ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        {(["All", "Private", "Government", "Trust", "Railway"] as FilterType[]).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-all ${
              filterType === t
                ? "bg-sky-500 text-white border-sky-500"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-sky-300"
            }`}
          >
            {t}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          {(["distance", "rating", "beds"] as SortMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSortMode(mode)}
              className={`rounded-full px-2.5 py-1 text-xs font-medium border transition-all capitalize ${
                sortMode === mode
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white"
                  : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400"
              }`}
            >
              {mode === "distance" ? "📍 Near" : mode === "rating" ? "⭐ Rating" : "🛏 Beds"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hospital Cards ── */}
      {locating && displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          <p className="text-sm text-gray-500">Detecting your location…</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
          <Hospital className="h-12 w-12 text-gray-200 dark:text-gray-700" />
          <p className="text-gray-500 font-medium">No hospitals found</p>
          <p className="text-sm text-gray-400">Try a different search or filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((hospital, idx) => {
            const isExpanded = expandedId === hospital.id;
            const emergBar = getBedBar(hospital.bedInfo.availableEmergencyBeds, hospital.bedInfo.totalEmergencyBeds);
            const icuBar = getBedBar(hospital.bedInfo.availableIcuBeds, hospital.bedInfo.totalIcuBeds);
            const genBar = getBedBar(hospital.bedInfo.availableGeneralBeds, hospital.bedInfo.totalGeneralBeds);
            const dist = formatDistance(hospital.distance);
            const totalAvail =
              hospital.bedInfo.availableEmergencyBeds +
              hospital.bedInfo.availableIcuBeds +
              hospital.bedInfo.availableGeneralBeds;

            return (
              <Card
                key={hospital.id}
                className="border border-gray-100 dark:border-gray-800 hover:border-sky-200 dark:hover:border-sky-700 hover:shadow-md transition-all duration-200 dark:bg-gray-900 overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* ── Top rank strip for top 3 nearest ── */}
                  {/* Lonavala tag strip */}
                  {hospital.isLonavala ? (
                    <div className="h-0.5 w-full bg-sky-500" />
                  ) : (
                    <div className="h-0.5 w-full bg-gray-100 dark:bg-gray-800" />
                  )}

                  <div className="p-4">
                    {/* ── Row 1: Icon + Name + Distance ── */}
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-900/30">
                          <Hospital className="h-5 w-5 text-sky-500" />
                        </div>
                        {hospital.isLonavala && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-white text-[9px] font-bold">📍</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug">{hospital.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <Badge className={`text-[10px] px-1.5 py-0 border-0 font-medium ${typeColors[hospital.type]}`}>
                                {hospital.type}
                              </Badge>
                              <span className={`flex items-center gap-0.5 text-[10px] font-medium ${hospital.isOpen ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                                <Activity className="h-2.5 w-2.5" />
                                {hospital.isOpen ? "Open 24/7" : `Opens ${hospital.openTime}`}
                              </span>
                              {hospital.isLonavala && (
                                <Badge className="text-[10px] px-1.5 py-0 border-0 font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                                  📍 Lonavala
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Distance pill */}
                          {dist && (
                            <div className="flex flex-col items-end shrink-0">
                              <span className="flex items-center gap-0.5 text-sky-600 dark:text-sky-400 font-bold text-sm">
                                <Navigation className="h-3 w-3" />
                                {dist}
                              </span>
                              <span className="text-[10px] text-gray-400">away</span>
                            </div>
                          )}
                        </div>

                        {/* Address */}
                        <div className="flex items-start gap-1 mt-1.5">
                          <MapPin className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{hospital.address}</p>
                        </div>

                        {/* Rating row */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i <= Math.floor(hospital.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : i - 0.5 <= hospital.rating
                                    ? "fill-amber-200 text-amber-400"
                                    : "text-gray-200 dark:text-gray-700"
                                }`}
                              />
                            ))}
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-0.5 font-medium">{hospital.rating.toFixed(1)}</span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            totalAvail > 10 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            totalAvail > 3 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {totalAvail} beds free
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── Bed Status Bars ── */}
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        { label: "Emergency", avail: hospital.bedInfo.availableEmergencyBeds, total: hospital.bedInfo.totalEmergencyBeds, bar: emergBar },
                        { label: "ICU", avail: hospital.bedInfo.availableIcuBeds, total: hospital.bedInfo.totalIcuBeds, bar: icuBar },
                        { label: "General", avail: hospital.bedInfo.availableGeneralBeds, total: hospital.bedInfo.totalGeneralBeds, bar: genBar },
                      ].map(({ label, avail, total, bar }) => (
                        <div key={label} className={`rounded-lg p-2.5 ${bar.bg}`}>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                          <p className={`text-base font-bold ${bar.text} leading-tight`}>
                            {avail}
                            <span className="text-xs font-normal text-gray-400">/{total}</span>
                          </p>
                          {/* Progress bar */}
                          <div className="mt-1 h-1 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={`h-1 rounded-full transition-all ${bar.color}`}
                              style={{ width: `${total > 0 ? (avail / total) * 100 : 0}%` }}
                            />
                          </div>
                          <p className={`text-[10px] font-medium mt-0.5 ${bar.text}`}>{bar.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* ── Specialties ── */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {hospital.specialties.slice(0, isExpanded ? undefined : 4).map((s) => (
                        <Badge key={s} className="text-[10px] px-1.5 py-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-0 font-medium">
                          {s}
                        </Badge>
                      ))}
                      {!isExpanded && hospital.specialties.length > 4 && (
                        <span className="text-[10px] text-sky-500 font-medium self-center">+{hospital.specialties.length - 4} more</span>
                      )}
                    </div>

                    {/* ── Expanded Details ── */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>Hours: <span className="font-medium">{hospital.openTime === "00:00" ? "Open 24 Hours" : `${hospital.openTime} – ${hospital.closeTime}`}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                          <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{hospital.phone.replace("+91", "+91 ")}</span>
                        </div>
                        {hospital.distance !== undefined && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                            <Navigation className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            <span>Approx. travel: <span className="font-medium">{hospital.distance < 5 ? `${Math.round(hospital.distance * 3)} min by auto` : `${Math.round(hospital.distance * 2)} min by car`}</span></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── Action Buttons ── */}
                    <div className="mt-3 flex gap-2">
                      <a href={`tel:${hospital.phone}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full text-xs gap-1 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                          <Phone className="h-3 w-3" /> Call
                        </Button>
                      </a>
                      <a
                        href={`https://www.google.com/maps/dir/${userLocation ? `${userLocation.lat},${userLocation.lng}` : ""}/${hospital.latitude},${hospital.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs gap-1">
                          <Navigation className="h-3 w-3" /> Directions
                        </Button>
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedId(isExpanded ? null : hospital.id)}
                        className="px-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Footer count ── */}
      {displayed.length > 0 && (
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-2">
          Showing {displayed.length} of {MOCK_HOSPITALS.length} hospitals
          {userLocation && " · sorted by distance"}
        </p>
      )}
    </div>
  );
}
