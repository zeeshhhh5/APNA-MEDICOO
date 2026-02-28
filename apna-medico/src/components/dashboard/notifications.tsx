"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Ambulance, Package, Hospital, Brain, CheckCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  AMBULANCE: Ambulance,
  ORDER: Package,
  HOSPITAL: Hospital,
  AI: Brain,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { if (d.notifications) setNotifications(d.notifications); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch { toast.error("Failed to update notifications"); }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && <p className="text-sm text-gray-500">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
            <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">Updates about your bookings and orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] ?? Bell;
            return (
              <Card key={n.id} className={`border-gray-100 transition-all ${!n.isRead ? "bg-sky-50/50 border-sky-100" : ""}`}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${!n.isRead ? "bg-sky-100" : "bg-gray-100"}`}>
                    <Icon className={`h-4 w-4 ${!n.isRead ? "text-sky-600" : "text-gray-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                      {!n.isRead && <div className="h-2 w-2 rounded-full bg-sky-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <Badge className={`text-xs border-0 shrink-0 ${!n.isRead ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-500"}`}>
                    {n.type}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
