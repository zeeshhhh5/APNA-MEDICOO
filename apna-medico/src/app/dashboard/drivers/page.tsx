"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Ambulance, Star, Navigation, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Driver {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  licenseNumber: string;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalTrips: number;
  user: { name: string; email: string; isVerified: boolean };
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/drivers")
      .then((r) => r.json())
      .then((d) => { if (d.drivers) setDrivers(d.drivers); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleVerify = async (driverId: string, userId: string, current: boolean) => {
    try {
      await fetch(`/api/admin/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isVerified: !current }),
      });
      setDrivers((prev) => prev.map((d) => d.id === driverId ? { ...d, user: { ...d.user, isVerified: !current } } : d));
      toast.success(`Driver ${!current ? "verified" : "unverified"}`);
    } catch { toast.error("Failed to update"); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Ambulance Drivers</h2>
        <p className="text-sm text-gray-500">{drivers.length} registered drivers · {drivers.filter(d => d.isOnline).length} online</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-red-500" /></div>
      ) : drivers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Ambulance className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No drivers registered yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {drivers.map((driver) => (
            <Card key={driver.id} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{driver.user.name}</p>
                      {driver.user.isVerified ? (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs"><CheckCircle className="mr-1 h-2.5 w-2.5" />Verified</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Pending</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{driver.user.email}</p>
                  </div>
                  <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${driver.isOnline ? "bg-green-400" : "bg-gray-300"}`} />
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-400">Vehicle</p>
                    <p className="text-xs font-semibold text-gray-700">{driver.vehicleNumber}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-400">Trips</p>
                    <p className="text-xs font-semibold text-gray-700">{driver.totalTrips}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2 text-center">
                    <p className="text-xs text-gray-400">Rating</p>
                    <p className="text-xs font-semibold text-gray-700">{driver.rating.toFixed(1)} ★</p>
                  </div>
                </div>
                {!driver.user.isVerified && (
                  <Button size="sm" onClick={() => toggleVerify(driver.id, driver.user as unknown as string, false)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" /> Approve Driver
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
