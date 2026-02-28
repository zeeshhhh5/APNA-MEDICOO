"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, Locate } from "lucide-react";
import { toast } from "sonner";

export default function NavigationPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sharing, setSharing] = useState(false);

  const startSharing = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported"); return; }
    setSharing(true);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setLocation({ lat, lng });
        await fetch("/api/ambulance/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lng }),
        }).catch(() => {});
      },
      () => { toast.error("Could not get location"); setSharing(false); },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Navigation</h2>
        <p className="text-sm text-gray-500">Share your live location with patients</p>
      </div>

      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Locate className="h-4 w-4 text-red-500" />
            Live Location Sharing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {location ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-sm font-semibold text-green-800">Location Active</p>
              </div>
              <p className="text-xs text-green-700">
                Lat: {location.lat.toFixed(5)} · Lng: {location.lng.toFixed(5)}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <MapPin className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">Location not sharing</p>
              <p className="text-xs text-gray-400 mt-1">Start sharing to receive nearby emergency requests</p>
            </div>
          )}

          <Button
            onClick={startSharing}
            disabled={sharing}
            className={`w-full ${sharing ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white`}
          >
            <Navigation className="mr-2 h-4 w-4" />
            {sharing ? "Location Sharing Active" : "Start Location Sharing"}
          </Button>

          <p className="text-xs text-center text-gray-400">
            Your location is shared in real-time only when you are online
          </p>
        </CardContent>
      </Card>

      {location && (
        <a
          href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="w-full">
            <MapPin className="mr-2 h-4 w-4" />
            Open in Google Maps
          </Button>
        </a>
      )}
    </div>
  );
}
