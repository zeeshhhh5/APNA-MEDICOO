"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ambulance, MapPin, Phone, Loader2, CheckCircle,
  Clock, Navigation, AlertTriangle, RefreshCw,
} from "lucide-react";

interface Booking {
  id: string;
  status: string;
  pickupAddress: string;
  emergencyLevel: string;
  createdAt: string;
  driver?: { user: { name: string }; vehicleNumber: string } | null;
}

const STATUS_STEPS = [
  { key: "REQUESTED", label: "Requested", icon: Clock },
  { key: "ACCEPTED", label: "Driver Accepted", icon: CheckCircle },
  { key: "EN_ROUTE", label: "En Route", icon: Navigation },
  { key: "ARRIVED", label: "Arrived", icon: MapPin },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle },
];

export default function AmbulanceBooking() {
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/ambulance/booking");
      const data = await res.json();
      if (data.bookings) {
        setBookings(data.bookings);
        const active = data.bookings.find((b: Booking) =>
          ["REQUESTED", "ACCEPTED", "EN_ROUTE", "ARRIVED", "PATIENT_PICKED"].includes(b.status)
        );
        if (active) setActiveBooking(active);
      }
    } catch {}
  };

  const getLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      setLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        console.log("[AmbulanceBooking] Location detected:", { lat, lng, accuracy: pos.coords.accuracy });
        
        try {
          // Use PositionStack API (same as hospital locator)
          const geoKey = process.env.NEXT_PUBLIC_GEO_KEY || "9a59f9a15967c74c37aa3586c8333224";
          const res = await fetch(
            `http://api.positionstack.com/v1/reverse?access_key=${geoKey}&query=${lat},${lng}&limit=1`,
            { signal: AbortSignal.timeout(5000) }
          );
          
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }
          
          const data = await res.json();
          const address = data.data?.[0]?.label ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setLocation({ lat, lng, address });
          toast.success(`Location detected (±${Math.round(pos.coords.accuracy)}m accuracy)`);
        } catch (error) {
          console.error("[AmbulanceBooking] Geocoding error:", error);
          setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          toast.success("Location detected (coordinates only)");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error("[AmbulanceBooking] Geolocation error:", error);
        let errorMsg = "Could not get your location. ";
        if (error.code === 1) errorMsg += "Permission denied.";
        else if (error.code === 2) errorMsg += "Position unavailable.";
        else if (error.code === 3) errorMsg += "Timeout.";
        toast.error(errorMsg + " Please enable GPS.");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const bookAmbulance = async () => {
    if (!location) {
      toast.error("Please detect your location first");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ambulance/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLat: location.lat,
          pickupLng: location.lng,
          pickupAddress: location.address,
          emergencyLevel: "HIGH",
          patientCondition: condition,
        }),
      });
      if (!res.ok) throw new Error("Failed to book");
      const data = await res.json();
      setActiveBooking(data.booking);
      toast.success("Ambulance booked! Searching for nearest driver...");
      setCondition("");
    } catch {
      toast.error("Failed to book ambulance. Please call 108 directly.");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = activeBooking
    ? STATUS_STEPS.findIndex((s) => s.key === activeBooking.status)
    : -1;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Emergency Banner */}
      <div className="flex items-center gap-3 rounded-2xl bg-red-500 p-4 text-white">
        <Phone className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-bold">Life-threatening Emergency?</p>
          <p className="text-sm text-red-100">Call 108 (Ambulance) or 112 (Emergency) immediately</p>
        </div>
        <a href="tel:108" className="ml-auto">
          <Button size="sm" className="bg-white text-red-600 hover:bg-red-50 font-bold">
            Call 108
          </Button>
        </a>
      </div>

      {/* Active Booking Tracker */}
      <AnimatePresence>
        {activeBooking && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Active Booking
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={fetchBookings} className="h-7 w-7 p-0">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Status Stepper */}
                <div className="flex items-center gap-1 mb-4">
                  {STATUS_STEPS.slice(0, 5).map((step, i) => {
                    const isDone = i <= currentStepIndex;
                    const isCurrent = i === currentStepIndex;
                    return (
                      <div key={step.key} className="flex items-center flex-1">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                          isDone ? "bg-amber-500 text-white" : "bg-gray-200 text-gray-400"
                        } ${isCurrent ? "ring-2 ring-amber-300 ring-offset-1" : ""}`}>
                          {isDone ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                        </div>
                        {i < 4 && <div className={`flex-1 h-0.5 ${i < currentStepIndex ? "bg-amber-400" : "bg-gray-200"}`} />}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">
                  Status: {activeBooking.status.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{activeBooking.pickupAddress}</p>

                {activeBooking.driver && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl bg-white dark:bg-gray-800 p-3">
                    <Ambulance className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800 dark:text-white">
                        {activeBooking.driver.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{activeBooking.driver.vehicleNumber}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Book New Ambulance */}
      {!activeBooking && (
        <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 dark:text-white">
              <Ambulance className="h-5 w-5 text-red-500" />
              Book Emergency Ambulance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Location */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Location</p>
              {location ? (
                <div className="flex items-start gap-2 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-green-800 dark:text-green-400">Location Detected</p>
                    <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">{location.address}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={getLocation} className="h-7 text-xs">
                    Refresh
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={getLocation}
                  disabled={locating}
                  variant="outline"
                  className="w-full border-dashed border-2 border-gray-200 h-14"
                >
                  {locating ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Detecting location...</>
                  ) : (
                    <><MapPin className="mr-2 h-4 w-4 text-sky-500" /> Detect My Location</>
                  )}
                </Button>
              )}
            </div>

            {/* Condition */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient Condition (Optional)</p>
              <Textarea
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Describe the emergency (e.g. chest pain, accident, unconscious...)"
                className="resize-none text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                rows={3}
              />
            </div>

            <div className="flex gap-2 items-center rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-700 dark:text-red-400">
                For life-threatening emergencies, always call 108 directly. This booking alerts nearby drivers.
              </p>
            </div>

            <Button
              onClick={bookAmbulance}
              disabled={loading || !location}
              className="w-full bg-red-500 hover:bg-red-600 text-white h-12 text-base font-semibold"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Booking Ambulance...</>
              ) : (
                <><Ambulance className="mr-2 h-5 w-5" /> Book Ambulance Now</>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Booking History */}
      {bookings.length > 0 && (
        <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300">Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bookings.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                  <Ambulance className="h-4 w-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{b.pickupAddress}</p>
                    <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <Badge className={`text-xs border-0 ${
                    b.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    b.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
