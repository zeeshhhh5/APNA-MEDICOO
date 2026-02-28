"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getPusherClient } from "@/lib/pusher";
import {
  Ambulance, MapPin, AlertTriangle, CheckCircle,
  Navigation, Loader2, Clock, User,
} from "lucide-react";

interface BookingRequest {
  id: string;
  patientName: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  emergencyLevel: string;
  patientCondition?: string;
  distance?: number;
}

interface ActiveBooking {
  id: string;
  status: string;
  patient: { user: { name: string; phone?: string | null } };
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  emergencyLevel: string;
}

export default function DriverRequests() {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [activeBooking, setActiveBooking] = useState<ActiveBooking | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    // Get driver ID
    fetch("/api/ambulance/driver/me")
      .then((r) => r.json())
      .then((d) => { if (d.driverId) setDriverId(d.driverId); })
      .catch(() => {});

    // Load active booking
    fetch("/api/ambulance/booking")
      .then((r) => r.json())
      .then((d) => {
        const active = d.bookings?.find((b: ActiveBooking) =>
          ["ACCEPTED", "EN_ROUTE", "ARRIVED", "PATIENT_PICKED"].includes(b.status)
        );
        if (active) setActiveBooking(active);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!driverId) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`driver-${driverId}`);
    channel.bind("new-booking", (data: { booking: BookingRequest }) => {
      setRequests((prev) => [data.booking, ...prev]);
      toast.error(`🚨 Emergency Request from ${data.booking.patientName}!`, {
        duration: 15000,
        action: { label: "Accept", onClick: () => acceptBooking(data.booking.id) },
      });
    });

    channel.bind("booking-update", (data: { bookingId: string; status: string }) => {
      if (data.status === "CANCELLED") {
        setRequests((prev) => prev.filter((r) => r.id !== data.bookingId));
      }
    });

    return () => { pusher.unsubscribe(`driver-${driverId}`); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverId]);

  const acceptBooking = async (bookingId: string) => {
    setAccepting(bookingId);
    try {
      const res = await fetch("/api/ambulance/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "ACCEPTED" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setActiveBooking(data.booking);
      setRequests((prev) => prev.filter((r) => r.id !== bookingId));
      toast.success("Booking accepted! Navigate to patient location.");
    } catch { toast.error("Failed to accept booking"); }
    finally { setAccepting(null); }
  };

  const updateStatus = async (status: string) => {
    if (!activeBooking) return;
    try {
      const res = await fetch("/api/ambulance/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: activeBooking.id, status }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (status === "COMPLETED" || status === "CANCELLED") {
        setActiveBooking(null);
      } else {
        setActiveBooking(data.booking);
      }
      toast.success(`Status updated: ${status.replace(/_/g, " ")}`);
    } catch { toast.error("Failed to update status"); }
  };

  const EMERGENCY_COLORS: Record<string, string> = {
    LOW: "bg-yellow-100 text-yellow-700",
    MEDIUM: "bg-orange-100 text-orange-700",
    HIGH: "bg-red-100 text-red-700",
    CRITICAL: "bg-red-200 text-red-800 font-bold",
  };

  const STATUS_FLOW = [
    { status: "EN_ROUTE", label: "En Route to Patient" },
    { status: "ARRIVED", label: "Mark Arrived" },
    { status: "PATIENT_PICKED", label: "Patient Picked Up" },
    { status: "EN_ROUTE_HOSPITAL", label: "En Route to Hospital" },
    { status: "COMPLETED", label: "Complete Trip" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Active Booking */}
      {activeBooking && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-red-800 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Active Trip
              </CardTitle>
              <Badge className={`text-xs border-0 ${EMERGENCY_COLORS[activeBooking.emergencyLevel] ?? "bg-red-100 text-red-700"}`}>
                {activeBooking.emergencyLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-white p-3">
              <User className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{activeBooking.patient.user.name}</p>
                {activeBooking.patient.user.phone && (
                  <a href={`tel:${activeBooking.patient.user.phone}`} className="text-xs text-sky-600 hover:underline">
                    {activeBooking.patient.user.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-white p-3">
              <MapPin className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-700">{activeBooking.pickupAddress}</p>
            </div>

            <a
              href={`https://www.google.com/maps/dir/current+location/${activeBooking.pickupLat},${activeBooking.pickupLng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-sky-500 hover:bg-sky-600 text-white gap-2">
                <Navigation className="h-4 w-4" /> Open Navigation
              </Button>
            </a>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Update Trip Status</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_FLOW.map(({ status, label }) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    onClick={() => updateStatus(status)}
                    className={`text-xs ${status === "COMPLETED" ? "border-green-300 text-green-700 hover:bg-green-50" : status === "CANCELLED" ? "border-red-300 text-red-700 hover:bg-red-50" : ""}`}
                  >
                    {label}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatus("CANCELLED")}
                  className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                >
                  Cancel Trip
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Incoming Requests */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Incoming Requests
            {requests.length > 0 && (
              <Badge className="bg-red-100 text-red-700 border-0 text-xs">{requests.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Ambulance className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">No requests yet</p>
              <p className="text-xs text-gray-400 mt-1">Make sure you are online to receive requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900">{req.patientName}</p>
                        <Badge className={`text-xs border-0 ${EMERGENCY_COLORS[req.emergencyLevel] ?? "bg-red-100 text-red-700"}`}>
                          {req.emergencyLevel}
                        </Badge>
                      </div>
                      {req.distance && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          <Navigation className="inline h-3 w-3 mr-1" />
                          {req.distance.toFixed(1)} km away
                        </p>
                      )}
                    </div>
                    <Clock className="h-4 w-4 text-gray-400 shrink-0" />
                  </div>

                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-700">{req.pickupAddress}</p>
                  </div>

                  {req.patientCondition && (
                    <p className="text-xs text-orange-700 bg-orange-50 rounded-lg p-2 mb-3">
                      {req.patientCondition}
                    </p>
                  )}

                  <Button
                    onClick={() => acceptBooking(req.id)}
                    disabled={accepting === req.id || !!activeBooking}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                  >
                    {accepting === req.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Accepting...</>
                    ) : (
                      <><CheckCircle className="mr-2 h-4 w-4" />Accept Request</>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
