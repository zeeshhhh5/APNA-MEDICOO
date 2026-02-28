"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Navigation, Star } from "lucide-react";

export default function EarningsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Earnings</h2>
        <p className="text-sm text-gray-500">Your earnings and trip statistics</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Total Earnings", value: "₹0", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Today", value: "₹0", icon: DollarSign, color: "text-sky-500", bg: "bg-sky-50" },
          { label: "Total Trips", value: "0", icon: Navigation, color: "text-red-500", bg: "bg-red-50" },
          { label: "Rating", value: "—", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
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
        <CardHeader className="pb-2"><CardTitle className="text-sm text-gray-700">Earnings History</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <TrendingUp className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-sm text-gray-500">Complete trips to see earnings here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
