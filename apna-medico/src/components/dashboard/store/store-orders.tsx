"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getPusherClient } from "@/lib/pusher";
import {
  Package, MapPin, User, Loader2, AlertTriangle,
  CheckCircle, Clock, Truck, Zap,
} from "lucide-react";

interface Order {
  id: string;
  patientName?: string;
  deliveryAddress: string;
  items: { name: string; quantity: number; price: number }[];
  totalAmount: number;
  deliveryType: string;
  status: string;
  createdAt: string;
  patient?: { user: { name: string; phone?: string | null } };
}

const STATUS_BADGE: Record<string, string> = {
  PENDING:          "bg-yellow-100 text-yellow-700",
  ACCEPTED:         "bg-blue-100 text-blue-700",
  PREPARING:        "bg-orange-100 text-orange-700",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-700",
  DELIVERED:        "bg-green-100 text-green-700",
  CANCELLED:        "bg-red-100 text-red-700",
};

const STATUS_FLOW = ["ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function StoreOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/medical-store/me")
      .then((r) => r.json())
      .then((d) => { if (d.storeId) setStoreId(d.storeId); })
      .catch(() => {});

    fetch("/api/medicine/orders")
      .then((r) => r.json())
      .then((d) => { if (d.orders) setOrders(d.orders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!storeId) return;
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe(`store-${storeId}`);
    channel.bind("new-order", (data: Order) => {
      setOrders((prev) => [data, ...prev]);
      toast.success(
        data.deliveryType === "EMERGENCY"
          ? `🚨 Emergency order from ${data.patientName}!`
          : `New order from ${data.patientName}`,
        { duration: 10000 }
      );
    });

    return () => { pusher.unsubscribe(`store-${storeId}`); };
  }, [storeId]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/medicine/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      toast.success(`Order status updated to ${status.replace(/_/g, " ")}`);
    } catch { toast.error("Failed to update order status"); }
    finally { setUpdating(null); }
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const activeOrders = orders.filter((o) => ["ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY"].includes(o.status));
  const pastOrders = orders.filter((o) => ["DELIVERED", "CANCELLED"].includes(o.status));

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
    </div>
  );

  const OrderCard = ({ order }: { order: Order }) => {
    const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1];
    const patientName = order.patient?.user?.name ?? order.patientName ?? "Patient";

    return (
      <Card className={`border-gray-100 ${order.deliveryType === "EMERGENCY" ? "border-red-200" : ""}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {order.deliveryType === "EMERGENCY" ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100">
                  <Zap className="h-4 w-4 text-red-500" />
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                  <Package className="h-4 w-4 text-amber-500" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-gray-800">#{order.id.slice(-6)}</p>
                  {order.deliveryType === "EMERGENCY" && (
                    <Badge className="bg-red-100 text-red-700 border-0 text-xs">EMERGENCY</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString("en-IN")}</p>
              </div>
            </div>
            <Badge className={`text-xs border-0 ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <User className="h-3.5 w-3.5 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-600">{patientName}</p>
          </div>

          <div className="flex items-start gap-2 mb-3">
            <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-600">{order.deliveryAddress}</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-2 mb-3">
            {(order.items as { name: string; quantity: number; price: number }[]).map((item, i) => (
              <div key={i} className="flex justify-between text-xs text-gray-600 py-0.5">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(0)}</span>
              </div>
            ))}
            <div className="flex justify-between text-xs font-semibold text-gray-800 border-t border-gray-200 pt-1 mt-1">
              <span>Total</span>
              <span>₹{order.totalAmount.toFixed(0)}</span>
            </div>
          </div>

          {order.status === "PENDING" && (
            <div className="flex gap-2">
              <Button
                onClick={() => updateOrderStatus(order.id, "ACCEPTED")}
                disabled={updating === order.id}
                size="sm"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
              >
                {updating === order.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle className="mr-1 h-3 w-3" />Accept</>}
              </Button>
              <Button
                onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                disabled={updating === order.id}
                size="sm"
                variant="outline"
                className="text-xs border-red-200 text-red-600 hover:bg-red-50"
              >
                Decline
              </Button>
            </div>
          )}

          {nextStatus && order.status !== "PENDING" && (
            <Button
              onClick={() => updateOrderStatus(order.id, nextStatus)}
              disabled={updating === order.id}
              size="sm"
              className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs mt-1"
            >
              {updating === order.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Truck className="h-3 w-3 mr-1" />}
              Mark as {nextStatus.replace(/_/g, " ")}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {pendingOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">Pending Orders ({pendingOrders.length})</h3>
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="space-y-3">{pendingOrders.map((o) => <OrderCard key={o.id} order={o} />)}</div>
        </div>
      )}

      {activeOrders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-bold text-gray-800">Active Orders ({activeOrders.length})</h3>
          </div>
          <div className="space-y-3">{activeOrders.map((o) => <OrderCard key={o.id} order={o} />)}</div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Package className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No orders yet</p>
          <p className="text-xs text-gray-400 mt-1">Open your store to start receiving medicine orders</p>
        </div>
      )}

      {pastOrders.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">Past Orders</h3>
          <div className="space-y-3">{pastOrders.slice(0, 10).map((o) => <OrderCard key={o.id} order={o} />)}</div>
        </div>
      )}
    </div>
  );
}
