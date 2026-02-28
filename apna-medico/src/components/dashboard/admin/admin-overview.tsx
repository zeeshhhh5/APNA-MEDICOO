"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users, Hospital, Ambulance, Store, Activity,
  ShieldCheck, TrendingUp, AlertTriangle, CheckCircle,
} from "lucide-react";

import type { DashboardUser } from "@/types/dashboard";

export default function AdminDashboard({ user }: { user: DashboardUser }) {
  const [stats, setStats] = useState({
    totalUsers: 0, hospitals: 0, drivers: 0, stores: 0,
    pendingVerifications: 0, activeBookings: 0,
  });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.stats) setStats(d.stats); })
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-sky-500", bg: "bg-sky-50", href: "/dashboard/users" },
    { label: "Hospitals", value: stats.hospitals, icon: Hospital, color: "text-emerald-500", bg: "bg-emerald-50", href: "/dashboard/hospitals" },
    { label: "Ambulance Drivers", value: stats.drivers, icon: Ambulance, color: "text-red-500", bg: "bg-red-50", href: "/dashboard/drivers" },
    { label: "Medical Stores", value: stats.stores, icon: Store, color: "text-amber-500", bg: "bg-amber-50", href: "/dashboard/stores" },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-50", href: "/dashboard/users" },
    { label: "Active Bookings", value: stats.activeBookings, icon: Activity, color: "text-purple-500", bg: "bg-purple-50", href: "/dashboard/users" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="mt-1 text-purple-100">Welcome back, {user.name}</p>
            <div className="mt-3 flex gap-2">
              <Badge className="bg-white/20 text-white border-0">
                <ShieldCheck className="mr-1 h-3 w-3" /> Platform Admin
              </Badge>
              <Badge className="bg-green-400/30 text-white border-0">
                <CheckCircle className="mr-1 h-3 w-3" /> All Systems Operational
              </Badge>
            </div>
          </div>
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <Card className="border-gray-100 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">Platform Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              { label: "Verify Hospitals", href: "/dashboard/hospitals", icon: Hospital, color: "text-emerald-500" },
              { label: "Manage Users", href: "/dashboard/users", icon: Users, color: "text-sky-500" },
              { label: "Driver Management", href: "/dashboard/drivers", icon: Ambulance, color: "text-red-500" },
              { label: "Store Approvals", href: "/dashboard/stores", icon: Store, color: "text-amber-500" },
            ].map(({ label, href, icon: Icon, color }) => (
              <Link key={label} href={href}>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
