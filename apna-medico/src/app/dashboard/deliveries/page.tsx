"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Truck, MapPin, Package } from "lucide-react";

interface Delivery {
  id: string;
  patientName: string;
  deliveryAddress: string;
  status: string;
  estimatedTime?: string;
  totalAmount: number;
}

const STATUS_COLORS: Record<string, string> = {
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  PREPARING: "bg-orange-100 text-orange-700",
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/medicine/orders?status=OUT_FOR_DELIVERY")
      .then((r) => r.json())
      .then((d) => { if (d.orders) setDeliveries(d.orders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Deliveries</h2>
        <p className="text-sm text-gray-500">Track active and completed deliveries</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
      ) : deliveries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Truck className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No active deliveries</p>
          <p className="text-xs text-gray-400 mt-1">Accepted orders will appear here when out for delivery</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((d) => (
            <Card key={d.id} className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-amber-500" />
                    <p className="text-sm font-semibold text-gray-800">#{d.id.slice(-6)}</p>
                  </div>
                  <Badge className={`text-xs border-0 ${STATUS_COLORS[d.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {d.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 font-medium">{d.patientName}</p>
                <div className="flex items-start gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500">{d.deliveryAddress}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {d.estimatedTime && <p className="text-xs text-gray-400">ETA: {d.estimatedTime}</p>}
                  <p className="text-sm font-bold text-gray-800 ml-auto">₹{d.totalAmount}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
