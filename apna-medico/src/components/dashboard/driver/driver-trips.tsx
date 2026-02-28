"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Navigation, MapPin, Clock, CheckCircle } from "lucide-react";

interface Trip {
  id: string;
  status: string;
  pickupAddress: string;
  destAddress?: string | null;
  createdAt: string;
  patient: { user: { name: string } };
  fare?: number | null;
}

export default function DriverTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ambulance/booking")
      .then((r) => r.json())
      .then((d) => { if (d.bookings) setTrips(d.bookings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = trips.filter((t) => t.status === "COMPLETED");
  const cancelled = trips.filter((t) => t.status === "CANCELLED");

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Trip History</h2>
        <p className="text-sm text-gray-500">{completed.length} completed · {cancelled.length} cancelled</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Navigation className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No trips yet</p>
          <p className="text-xs text-gray-400 mt-1">Your completed trips will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <Card key={trip.id} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{trip.patient.user.name}</p>
                    <Badge className={`text-xs border-0 ${trip.status === "COMPLETED" ? "bg-green-100 text-green-700" : trip.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                      {trip.status}
                    </Badge>
                  </div>
                  {trip.fare && <span className="text-sm font-bold text-gray-800">₹{trip.fare}</span>}
                </div>
                <div className="flex items-start gap-2 mb-1">
                  <MapPin className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-600">{trip.pickupAddress}</p>
                </div>
                {trip.destAddress && (
                  <div className="flex items-start gap-2 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600">{trip.destAddress}</p>
                  </div>
                )}
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <p className="text-xs text-gray-400">{new Date(trip.createdAt).toLocaleString("en-IN")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
