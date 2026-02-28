"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Store, MapPin, Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface MedStore {
  id: string;
  storeName: string;
  address: string;
  phone: string;
  isOpen: boolean;
  isVerified: boolean;
  rating: number;
  deliveryRadius: number;
  user: { name: string; email: string };
}

export default function StoresPage() {
  const [stores, setStores] = useState<MedStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stores")
      .then((r) => r.json())
      .then((d) => { if (d.stores) setStores(d.stores); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const verifyStore = async (storeId: string) => {
    try {
      await fetch(`/api/admin/stores/${storeId}/verify`, { method: "PATCH" });
      setStores((prev) => prev.map((s) => s.id === storeId ? { ...s, isVerified: true } : s));
      toast.success("Store verified!");
    } catch { toast.error("Failed to verify"); }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Medical Stores</h2>
        <p className="text-sm text-gray-500">{stores.length} stores · {stores.filter(s => s.isOpen).length} open · {stores.filter(s => !s.isVerified).length} pending</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
      ) : stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Store className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No medical stores registered yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stores.map((store) => (
            <Card key={store.id} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{store.storeName}</p>
                      {store.isVerified ? (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs"><CheckCircle className="mr-1 h-2.5 w-2.5" />Verified</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700 border-0 text-xs">Pending</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{store.user.name} · {store.user.email}</p>
                  </div>
                  <Badge className={`text-xs border-0 shrink-0 ${store.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                    {store.isOpen ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="flex items-start gap-1.5 mb-3">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500">{store.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-lg bg-gray-50 p-2">
                    <p className="text-xs text-gray-400">Rating</p>
                    <p className="text-xs font-semibold">{store.rating.toFixed(1)} <Star className="inline h-2.5 w-2.5 text-amber-400" /></p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2">
                    <p className="text-xs text-gray-400">Delivery Radius</p>
                    <p className="text-xs font-semibold">{store.deliveryRadius} km</p>
                  </div>
                </div>
                {!store.isVerified && (
                  <Button size="sm" onClick={() => verifyStore(store.id)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                    <CheckCircle className="mr-1 h-3 w-3" /> Approve Store
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
