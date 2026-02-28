"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Link from "next/link";
import {
  Package, Store, TrendingUp, Star, AlertTriangle,
  CheckCircle, Clock, ChevronRight, Pill, Truck,
} from "lucide-react";
import type { DashboardUser } from "@/types/dashboard";

export default function StoreDashboard({ user }: { user: DashboardUser }) {
  const store = user.medicalStore;
  const [isOpen, setIsOpen] = useState(store?.isOpen ?? false);
  const [toggling, setToggling] = useState(false);

  const handleToggleOpen = async () => {
    setToggling(true);
    try {
      const res = await fetch("/api/medical-store/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !isOpen }),
      });
      if (!res.ok) throw new Error("Failed");
      setIsOpen(!isOpen);
      toast.success(isOpen ? "Store is now closed" : "Store is now open — accepting orders!");
    } catch {
      toast.error("Failed to update store status");
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className={`rounded-2xl p-6 text-white ${isOpen ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-gradient-to-r from-gray-500 to-gray-600"}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{store?.storeName ?? "Your Store"}</h2>
            <p className={`mt-1 text-sm ${isOpen ? "text-amber-100" : "text-gray-300"}`}>
              {store?.address ?? "Address not set"}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <Switch
                checked={isOpen}
                onCheckedChange={handleToggleOpen}
                disabled={toggling}
              />
              <Badge className={`border-0 text-xs ${isOpen ? "bg-white/20 text-white" : "bg-white/10 text-gray-300"}`}>
                {isOpen ? <><CheckCircle className="mr-1 h-3 w-3" />Open</> : <><Clock className="mr-1 h-3 w-3" />Closed</>}
              </Badge>
              {store?.isVerified ? (
                <Badge className="bg-green-400/30 text-white border-0 text-xs">
                  <CheckCircle className="mr-1 h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge className="bg-yellow-400/30 text-white border-0 text-xs">Pending Verification</Badge>
              )}
            </div>
          </div>
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <Store className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Emergency Orders Alert */}
      {isOpen && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 animate-pulse">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Accepting Emergency Orders</p>
            <p className="text-xs text-red-600">You will receive real-time alerts for emergency medicine requests</p>
          </div>
          <div className="h-3 w-3 rounded-full bg-green-400 animate-pulse" />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Orders", value: 0, icon: Package, color: "text-sky-500" },
          { label: "Rating", value: `${(store?.rating ?? 0).toFixed(1)} ★`, icon: Star, color: "text-amber-500" },
          { label: "Delivery Radius", value: `${store?.deliveryRadius ?? 5} km`, icon: Truck, color: "text-emerald-500" },
          { label: "Status", value: isOpen ? "Open" : "Closed", icon: Store, color: isOpen ? "text-green-500" : "text-gray-400" },
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

      {/* Quick Links */}
      <div className="grid gap-3 md:grid-cols-2">
        <Link href="/dashboard/orders">
          <Card className="border-gray-100 hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Package className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Manage Orders</p>
                <p className="text-xs text-gray-500">View & accept medicine orders</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/inventory">
          <Card className="border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <Pill className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Inventory</p>
                <p className="text-xs text-gray-500">Manage medicine stock</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Orders */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-700">Recent Orders</CardTitle>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="text-xs text-amber-600 hover:text-amber-700">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1">
              {isOpen ? "Waiting for medicine orders..." : "Open your store to start receiving orders"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
