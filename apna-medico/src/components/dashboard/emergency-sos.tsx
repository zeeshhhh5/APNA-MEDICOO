"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Phone, AlertTriangle, Ambulance, Hospital, Loader2, MapPin, X } from "lucide-react";

export default function EmergencySOS() {
  const [open, setOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const detectLocation = () => {
    setDetectingLocation(true);
    if (!navigator.geolocation) {
      setLocation({ lat: 19.076, lng: 72.8777 }); // Mumbai fallback
      setDetectingLocation(false);
      toast.info("Geolocation not supported. Using approximate location.");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        console.log("[EmergencySOS] Location detected:", { lat, lng, accuracy: pos.coords.accuracy });
        setLocation({ lat, lng });
        setDetectingLocation(false);
      },
      (error) => {
        console.error("[EmergencySOS] Geolocation error:", error);
        setLocation({ lat: 19.076, lng: 72.8777 }); // Mumbai fallback
        setDetectingLocation(false);
        toast.info("Could not detect location. Using approximate location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const bookEmergencyAmbulance = async () => {
    if (!location) {
      detectLocation();
      return;
    }
    setBooking(true);
    try {
      console.log("[EmergencySOS] Booking ambulance with location:", location);
      const res = await fetch("/api/ambulance/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLat: location.lat,
          pickupLng: location.lng,
          pickupAddress: "Emergency Location (Auto-detected)",
          emergencyLevel: "CRITICAL",
          patientCondition: "Emergency - SOS Button Pressed",
        }),
      });
      
      const data = await res.json();
      console.log("[EmergencySOS] API response:", { status: res.status, data });
      
      if (!res.ok) {
        const errorMsg = data.details || data.error || "Failed to book ambulance";
        throw new Error(errorMsg);
      }
      
      setBooked(true);
      toast.success("Ambulance requested! Help is on the way.");
    } catch (error) {
      console.error("[EmergencySOS] Booking failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to book ambulance";
      toast.error(`${errorMessage}. Please call 108 directly.`);
    } finally {
      setBooking(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setBooked(false);
    detectLocation();
  };

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl hover:bg-red-600 active:scale-95 transition-all animate-pulse hover:animate-none"
        aria-label="Emergency SOS"
      >
        <AlertTriangle className="h-7 w-7" />
      </button>

      {/* Emergency Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md border-red-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Emergency SOS
            </DialogTitle>
          </DialogHeader>

          {booked ? (
            <div className="space-y-4 text-center py-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto">
                <Ambulance className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Help is on the way!</h3>
              <p className="text-sm text-gray-500">
                Your emergency ambulance has been requested. A driver will be assigned shortly.
              </p>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs text-amber-800 font-medium">
                  Estimated arrival: 8-15 minutes
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Keep your phone accessible. The driver will contact you.
                </p>
              </div>
              <div className="flex gap-2">
                <a href="tel:108" className="flex-1">
                  <Button variant="outline" className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50">
                    <Phone className="h-4 w-4" /> Call 108
                  </Button>
                </a>
                <Button onClick={() => setOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-900 text-white">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Location Status */}
              <div className={`flex items-center gap-2 rounded-xl p-3 ${location ? "bg-green-50 border border-green-200" : "bg-gray-50 border border-gray-200"}`}>
                {detectingLocation ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span className="text-xs text-gray-600">Detecting your location...</span>
                  </>
                ) : location ? (
                  <>
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">Location detected</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Location not available</span>
                  </>
                )}
              </div>

              {/* Emergency Actions */}
              <Button
                onClick={bookEmergencyAmbulance}
                disabled={booking || detectingLocation}
                className="w-full h-14 bg-red-500 hover:bg-red-600 text-white text-base font-bold gap-2"
              >
                {booking ? (
                  <><Loader2 className="h-5 w-5 animate-spin" />Requesting Ambulance...</>
                ) : (
                  <><Ambulance className="h-5 w-5" />Book Emergency Ambulance</>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <a href="tel:108">
                  <Button variant="outline" className="w-full h-12 gap-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold">
                    <Phone className="h-4 w-4" /> Call 108
                  </Button>
                </a>
                <a href="tel:112">
                  <Button variant="outline" className="w-full h-12 gap-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold">
                    <Phone className="h-4 w-4" /> Call 112
                  </Button>
                </a>
              </div>

              <a href="/dashboard/hospitals">
                <Button variant="outline" className="w-full gap-2 border-sky-200 text-sky-600 hover:bg-sky-50">
                  <Hospital className="h-4 w-4" /> Find Nearest Hospital
                </Button>
              </a>

              {/* Available Ambulances Info */}
              <div className="rounded-xl bg-blue-50 border border-blue-200 p-3">
                <p className="text-xs font-semibold text-blue-800">Available Ambulances Near You</p>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">MH-01-AB-1234 (Basic)</span>
                    <span className="text-blue-600 font-medium">~5 min</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">MH-01-CD-5678 (Advanced ICU)</span>
                    <span className="text-blue-600 font-medium">~8 min</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">MH-02-EF-9012 (Basic)</span>
                    <span className="text-blue-600 font-medium">~12 min</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                In a life-threatening emergency, call 108 immediately
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
