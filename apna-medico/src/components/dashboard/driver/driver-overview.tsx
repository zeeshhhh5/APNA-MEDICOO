"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Ambulance, MapPin, Activity, Star, Navigation,
  CheckCircle, Clock, TrendingUp, AlertTriangle,
} from "lucide-react";
import type { DashboardUser } from "@/types/dashboard";

export default function DriverDashboard({ user }: { user: DashboardUser }) {
  const driver = user.ambulanceDriver;
  const [isOnline, setIsOnline] = useState(driver?.isOnline ?? false);
  const [toggling, setToggling] = useState(false);

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      const res = await fetch("/api/ambulance/driver/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: !isOnline }),
      });
      if (!res.ok) throw new Error("Failed");
      setIsOnline(!isOnline);
      toast.success(isOnline ? "You are now offline" : "You are now online — ready for requests!");
    } catch {
      toast.error("Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 text-white ${isOnline ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-gray-500 to-gray-600"}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className={`mt-1 ${isOnline ? "text-green-100" : "text-gray-300"}`}>
              {driver?.vehicleNumber} • {driver?.vehicleType?.replace("_", " ")}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Switch
                checked={isOnline}
                onCheckedChange={handleToggleOnline}
                disabled={toggling}
                className="data-[state=checked]:bg-white"
              />
              <Badge className={`border-0 text-xs ${isOnline ? "bg-white/20 text-white" : "bg-white/10 text-gray-300"}`}>
                {isOnline ? <><CheckCircle className="mr-1 h-3 w-3" />Online</> : <><Clock className="mr-1 h-3 w-3" />Offline</>}
              </Badge>
              <span className={`text-sm ${isOnline ? "text-green-100" : "text-gray-400"}`}>
                {isOnline ? "Accepting requests" : "Go online to receive requests"}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <Ambulance className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Live Request Alert */}
      {isOnline && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Waiting for Emergency Requests</p>
            <p className="text-xs text-amber-600">You will receive real-time alerts when a patient books an ambulance</p>
          </div>
          <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Trips", value: driver?.totalTrips ?? 0, icon: Navigation, color: "text-sky-500" },
          { label: "Rating", value: `${(driver?.rating ?? 0).toFixed(1)} ★`, icon: Star, color: "text-amber-500" },
          { label: "Earnings (₹)", value: `₹${(driver?.totalEarnings ?? 0).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Status", value: isOnline ? "Online" : "Offline", icon: Activity, color: isOnline ? "text-green-500" : "text-gray-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-gray-100">
            <CardContent className="p-4 text-center">
              <Icon className={`mx-auto mb-2 h-5 w-5 ${color}`} />
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Trips */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Recent Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Navigation className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">No trips yet</p>
            <p className="text-xs text-gray-400 mt-1">Go online to start receiving emergency requests</p>
            {!isOnline && (
              <Button
                onClick={handleToggleOnline}
                disabled={toggling}
                size="sm"
                className="mt-4 bg-red-500 hover:bg-red-600 text-white"
              >
                Go Online Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Info */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Vehicle Number", value: driver?.vehicleNumber ?? "Not set" },
              { label: "Vehicle Type", value: driver?.vehicleType?.replace("_", " ") ?? "BASIC" },
              { label: "Current Location", value: "GPS Active" },
              { label: "Availability", value: driver?.isAvailable ? "Available" : "On Trip" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-sky-50 p-3">
            <MapPin className="h-4 w-4 text-sky-500" />
            <span className="text-sm text-sky-700">
              Share your location to receive nearby emergency requests
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
