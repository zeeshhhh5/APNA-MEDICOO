"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardList, ShieldCheck } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  details?: Record<string, unknown>;
}

const ACTION_COLORS: Record<string, string> = {
  VERIFY: "bg-green-100 text-green-700",
  DELETE: "bg-red-100 text-red-700",
  UPDATE: "bg-blue-100 text-blue-700",
  CREATE: "bg-purple-100 text-purple-700",
};

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((d) => { if (d.logs) setLogs(d.logs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Audit Logs</h2>
        <p className="text-sm text-gray-500">All platform administrative actions</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No audit logs yet</p>
          <p className="text-xs text-gray-400 mt-1">Admin actions will be recorded here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id} className="border-gray-100">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <ShieldCheck className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{log.action} · {log.targetType}</p>
                  <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("en-IN")}</p>
                </div>
                <Badge className={`text-xs border-0 shrink-0 ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                  {log.action}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
