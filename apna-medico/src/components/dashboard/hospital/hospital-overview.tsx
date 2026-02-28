"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Bed, Users, AlertTriangle, Activity, TrendingUp,
  CheckCircle, Clock, Save, RefreshCw,
} from "lucide-react";
import type { DashboardUser } from "@/types/dashboard";

export default function HospitalDashboard({ user }: { user: DashboardUser }) {
  const hospital = user.hospitalStaff?.hospital;
  const initialBeds = hospital?.bedInfo;

  const [beds, setBeds] = useState({
    availableEmergencyBeds: initialBeds?.availableEmergencyBeds ?? 0,
    totalEmergencyBeds: initialBeds?.totalEmergencyBeds ?? 10,
    availableIcuBeds: initialBeds?.availableIcuBeds ?? 0,
    totalIcuBeds: initialBeds?.totalIcuBeds ?? 5,
    availableGeneralBeds: initialBeds?.availableGeneralBeds ?? 0,
    totalGeneralBeds: initialBeds?.totalGeneralBeds ?? 50,
    ventilators: initialBeds?.ventilators ?? 0,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!hospital?.id) return;
    setSaving(true);
    try {
      const res = await fetch("/api/hospitals/beds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId: hospital.id, ...beds }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Bed availability updated successfully!");
    } catch {
      toast.error("Failed to update bed info. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const bedCategories = [
    {
      label: "Emergency Beds",
      available: beds.availableEmergencyBeds,
      total: beds.totalEmergencyBeds,
      availableKey: "availableEmergencyBeds" as const,
      totalKey: "totalEmergencyBeds" as const,
      color: "text-red-500",
      bg: "bg-red-50",
      icon: AlertTriangle,
    },
    {
      label: "ICU Beds",
      available: beds.availableIcuBeds,
      total: beds.totalIcuBeds,
      availableKey: "availableIcuBeds" as const,
      totalKey: "totalIcuBeds" as const,
      color: "text-orange-500",
      bg: "bg-orange-50",
      icon: Activity,
    },
    {
      label: "General Beds",
      available: beds.availableGeneralBeds,
      total: beds.totalGeneralBeds,
      availableKey: "availableGeneralBeds" as const,
      totalKey: "totalGeneralBeds" as const,
      color: "text-sky-500",
      bg: "bg-sky-50",
      icon: Bed,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{hospital?.name ?? "Your Hospital"}</h2>
            <p className="mt-1 text-emerald-100">
              {user.hospitalStaff?.designation} • {user.name}
            </p>
            <div className="mt-3 flex gap-2">
              <Badge className={`border-0 text-xs ${user.hospitalStaff?.isOnDuty ? "bg-green-400/30 text-white" : "bg-white/20 text-white"}`}>
                {user.hospitalStaff?.isOnDuty ? <><CheckCircle className="mr-1 h-3 w-3" />On Duty</> : <><Clock className="mr-1 h-3 w-3" />Off Duty</>}
              </Badge>
            </div>
          </div>
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Bed Management */}
      <Card className="border-gray-100">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-base font-semibold text-gray-900">
            <Bed className="inline mr-2 h-4 w-4 text-emerald-500" />
            Real-Time Bed Availability
          </CardTitle>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {saving ? <RefreshCw className="mr-2 h-3 w-3 animate-spin" /> : <Save className="mr-2 h-3 w-3" />}
            {saving ? "Saving..." : "Update Live"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {bedCategories.map((cat) => (
              <div key={cat.label} className={`rounded-2xl ${cat.bg} p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <cat.icon className={`h-4 w-4 ${cat.color}`} />
                  <span className="text-sm font-semibold text-gray-800">{cat.label}</span>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className={`text-3xl font-bold ${cat.color}`}>{cat.available}</span>
                  <span className="text-sm text-gray-500">/ {cat.total}</span>
                </div>

                <div className="w-full bg-white rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full transition-all ${cat.available > cat.total * 0.3 ? "bg-green-400" : cat.available > 0 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${cat.total > 0 ? (cat.available / cat.total) * 100 : 0}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Available</label>
                    <Input
                      type="number"
                      min={0}
                      max={beds[cat.totalKey]}
                      value={beds[cat.availableKey]}
                      onChange={(e) => setBeds(prev => ({ ...prev, [cat.availableKey]: parseInt(e.target.value) || 0 }))}
                      className="h-8 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Total</label>
                    <Input
                      type="number"
                      min={0}
                      value={beds[cat.totalKey]}
                      onChange={(e) => setBeds(prev => ({ ...prev, [cat.totalKey]: parseInt(e.target.value) || 0 }))}
                      className="h-8 text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ventilators */}
          <div className="mt-4 flex items-center gap-4 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2 flex-1">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Ventilators Available</span>
            </div>
            <Input
              type="number"
              min={0}
              value={beds.ventilators}
              onChange={(e) => setBeds(prev => ({ ...prev, ventilators: parseInt(e.target.value) || 0 }))}
              className="w-24 h-8 text-sm text-center"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Beds", value: beds.totalEmergencyBeds + beds.totalIcuBeds + beds.totalGeneralBeds, icon: Bed, color: "text-sky-500" },
          { label: "Available Now", value: beds.availableEmergencyBeds + beds.availableIcuBeds + beds.availableGeneralBeds, icon: CheckCircle, color: "text-green-500" },
          { label: "Occupied", value: (beds.totalEmergencyBeds - beds.availableEmergencyBeds) + (beds.totalIcuBeds - beds.availableIcuBeds) + (beds.totalGeneralBeds - beds.availableGeneralBeds), icon: Users, color: "text-orange-500" },
          { label: "Ventilators", value: beds.ventilators, icon: Activity, color: "text-purple-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-gray-100">
            <CardContent className="p-4 text-center">
              <Icon className={`mx-auto mb-2 h-5 w-5 ${color}`} />
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
