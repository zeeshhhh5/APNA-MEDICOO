"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Analytics</h2>
        <p className="text-sm text-gray-500">Platform insights and performance metrics</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total Transactions", value: "0", icon: BarChart3, color: "text-sky-500", bg: "bg-sky-50" },
          { label: "Revenue (₹)", value: "₹0", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Active Users", value: "0", icon: Users, color: "text-purple-500", bg: "bg-purple-50" },
          { label: "Avg. Response Time", value: "N/A", icon: Activity, color: "text-amber-500", bg: "bg-amber-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-gray-100">
            <CardContent className="p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} mb-3`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-gray-700">Activity Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">Analytics data will appear once there are transactions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
