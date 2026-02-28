"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Users, Search, ShieldCheck, HeartPulse, Ambulance, Pill, Hospital } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

const ROLE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  PATIENT:          { icon: HeartPulse, color: "text-sky-600",    bg: "bg-sky-100" },
  HOSPITAL_STAFF:   { icon: Hospital,   color: "text-emerald-600", bg: "bg-emerald-100" },
  AMBULANCE_DRIVER: { icon: Ambulance,  color: "text-red-600",    bg: "bg-red-100" },
  MEDICAL_STORE:    { icon: Pill,       color: "text-amber-600",  bg: "bg-amber-100" },
  ADMIN:            { icon: ShieldCheck,color: "text-purple-600", bg: "bg-purple-100" },
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { if (d.users) setUsers(d.users); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500">{users.length} total users</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or role..." className="pl-9" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((user) => {
            const cfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.PATIENT;
            return (
              <Card key={user.id} className="border-gray-100">
                <CardContent className="flex items-center gap-3 p-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={`text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-xs border-0 ${cfg.bg} ${cfg.color}`}>
                      <cfg.icon className="mr-1 h-3 w-3" />
                      {user.role.replace(/_/g, " ")}
                    </Badge>
                    <Badge className={`text-xs border-0 ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
