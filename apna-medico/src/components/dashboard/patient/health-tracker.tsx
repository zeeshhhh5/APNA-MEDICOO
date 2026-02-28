"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Heart, Activity, Thermometer, Droplets, Plus, Loader2,
  TrendingUp, TrendingDown, Minus, Clock, Pill, Bell, Trash2,
} from "lucide-react";

interface Vital {
  id: string;
  systolicBP: number | null;
  diastolicBP: number | null;
  heartRate: number | null;
  oxygenSaturation: number | null;
  temperature: number | null;
  glucoseLevel: number | null;
  weight: number | null;
  notes: string | null;
  createdAt: string;
}

interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  isActive: boolean;
  startDate: string;
  endDate: string | null;
}

const getStatusColor = (value: number, low: number, high: number) => {
  if (value < low) return "text-yellow-600 bg-yellow-50";
  if (value > high) return "text-red-600 bg-red-50";
  return "text-green-600 bg-green-50";
};

const getTrendIcon = (current: number | null, previous: number | null) => {
  if (!current || !previous) return <Minus className="h-3 w-3 text-gray-400" />;
  if (current > previous) return <TrendingUp className="h-3 w-3 text-red-500" />;
  if (current < previous) return <TrendingDown className="h-3 w-3 text-green-500" />;
  return <Minus className="h-3 w-3 text-gray-400" />;
};

export default function HealthTracker() {
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [vitalDialog, setVitalDialog] = useState(false);
  const [reminderDialog, setReminderDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vitalForm, setVitalForm] = useState({
    systolicBP: "", diastolicBP: "", heartRate: "", oxygenSaturation: "",
    temperature: "", glucoseLevel: "", weight: "", notes: "",
  });
  const [reminderForm, setReminderForm] = useState({
    medicineName: "", dosage: "", frequency: "daily", times: "08:00", endDate: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/health/vitals").then(r => r.json()),
      fetch("/api/health/reminders").then(r => r.json()),
    ])
      .then(([vData, rData]) => {
        if (vData.vitals) setVitals(vData.vitals);
        if (rData.reminders) setReminders(rData.reminders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submitVital = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasAny = Object.entries(vitalForm).some(([k, v]) => k !== "notes" && v.trim() !== "");
    if (!hasAny) { toast.error("Please enter at least one measurement"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/health/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vitalForm),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setVitals(prev => [data.vital, ...prev]);
      setVitalDialog(false);
      setVitalForm({ systolicBP: "", diastolicBP: "", heartRate: "", oxygenSaturation: "", temperature: "", glucoseLevel: "", weight: "", notes: "" });
      toast.success("Vitals recorded successfully!");
    } catch {
      toast.error("Failed to save vitals");
    } finally {
      setSaving(false);
    }
  };

  const submitReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderForm.medicineName || !reminderForm.dosage) {
      toast.error("Medicine name and dosage are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/health/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reminderForm,
          times: reminderForm.times.split(",").map(t => t.trim()),
          endDate: reminderForm.endDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReminders(prev => [data.reminder, ...prev]);
      setReminderDialog(false);
      setReminderForm({ medicineName: "", dosage: "", frequency: "daily", times: "08:00", endDate: "" });
      toast.success("Reminder set!");
    } catch {
      toast.error("Failed to set reminder");
    } finally {
      setSaving(false);
    }
  };

  const toggleReminder = async (id: string, isActive: boolean) => {
    try {
      await fetch("/api/health/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderId: id, isActive: !isActive }),
      });
      setReminders(prev => prev.map(r => r.id === id ? { ...r, isActive: !isActive } : r));
      toast.success(isActive ? "Reminder paused" : "Reminder activated");
    } catch {
      toast.error("Failed to update reminder");
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await fetch(`/api/health/reminders?id=${id}`, { method: "DELETE" });
      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success("Reminder deleted");
    } catch {
      toast.error("Failed to delete reminder");
    }
  };

  const latest = vitals[0] || null;
  const previous = vitals[1] || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Health Tracker</h2>
          <p className="text-sm text-gray-500">Monitor your vitals & medicine reminders</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={reminderDialog} onOpenChange={setReminderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Bell className="h-3.5 w-3.5" /> Add Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Set Medicine Reminder</DialogTitle></DialogHeader>
              <form onSubmit={submitReminder} className="space-y-4">
                <div className="space-y-2">
                  <Label>Medicine Name *</Label>
                  <Input value={reminderForm.medicineName} onChange={e => setReminderForm({ ...reminderForm, medicineName: e.target.value })} placeholder="e.g. Paracetamol 500mg" required />
                </div>
                <div className="space-y-2">
                  <Label>Dosage *</Label>
                  <Input value={reminderForm.dosage} onChange={e => setReminderForm({ ...reminderForm, dosage: e.target.value })} placeholder="e.g. 1 tablet" required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <select value={reminderForm.frequency} onChange={e => setReminderForm({ ...reminderForm, frequency: e.target.value })} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm">
                      <option value="daily">Daily</option>
                      <option value="twice_daily">Twice Daily</option>
                      <option value="thrice_daily">Thrice Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time(s)</Label>
                    <Input value={reminderForm.times} onChange={e => setReminderForm({ ...reminderForm, times: e.target.value })} placeholder="08:00, 20:00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input type="date" value={reminderForm.endDate} onChange={e => setReminderForm({ ...reminderForm, endDate: e.target.value })} />
                </div>
                <Button type="submit" disabled={saving} className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Bell className="mr-2 h-4 w-4" />Set Reminder</>}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={vitalDialog} onOpenChange={setVitalDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Record Vitals
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Record Vitals</DialogTitle></DialogHeader>
              <form onSubmit={submitVital} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Systolic BP (mmHg)</Label>
                    <Input type="number" value={vitalForm.systolicBP} onChange={e => setVitalForm({ ...vitalForm, systolicBP: e.target.value })} placeholder="120" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Diastolic BP (mmHg)</Label>
                    <Input type="number" value={vitalForm.diastolicBP} onChange={e => setVitalForm({ ...vitalForm, diastolicBP: e.target.value })} placeholder="80" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Heart Rate (bpm)</Label>
                    <Input type="number" value={vitalForm.heartRate} onChange={e => setVitalForm({ ...vitalForm, heartRate: e.target.value })} placeholder="72" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SpO2 (%)</Label>
                    <Input type="number" step="0.1" value={vitalForm.oxygenSaturation} onChange={e => setVitalForm({ ...vitalForm, oxygenSaturation: e.target.value })} placeholder="98" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Temperature (°F)</Label>
                    <Input type="number" step="0.1" value={vitalForm.temperature} onChange={e => setVitalForm({ ...vitalForm, temperature: e.target.value })} placeholder="98.6" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Glucose (mg/dL)</Label>
                    <Input type="number" value={vitalForm.glucoseLevel} onChange={e => setVitalForm({ ...vitalForm, glucoseLevel: e.target.value })} placeholder="100" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Weight (kg)</Label>
                    <Input type="number" step="0.1" value={vitalForm.weight} onChange={e => setVitalForm({ ...vitalForm, weight: e.target.value })} placeholder="70" />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Notes</Label>
                  <Textarea value={vitalForm.notes} onChange={e => setVitalForm({ ...vitalForm, notes: e.target.value })} placeholder="Any symptoms or observations..." rows={2} />
                </div>
                <Button type="submit" disabled={saving} className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Plus className="mr-2 h-4 w-4" />Save Vitals</>}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Vital Cards */}
      {latest ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {latest.systolicBP != null && (
            <Card className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getStatusColor(latest.systolicBP, 90, 140)}`}>
                    <Heart className="h-4 w-4" />
                  </div>
                  {getTrendIcon(latest.systolicBP, previous?.systolicBP ?? null)}
                </div>
                <p className="text-2xl font-bold text-gray-900">{latest.systolicBP}/{latest.diastolicBP}</p>
                <p className="text-xs text-gray-500 mt-0.5">Blood Pressure</p>
              </CardContent>
            </Card>
          )}
          {latest.heartRate != null && (
            <Card className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getStatusColor(latest.heartRate, 60, 100)}`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  {getTrendIcon(latest.heartRate, previous?.heartRate ?? null)}
                </div>
                <p className="text-2xl font-bold text-gray-900">{latest.heartRate}</p>
                <p className="text-xs text-gray-500 mt-0.5">Heart Rate (bpm)</p>
              </CardContent>
            </Card>
          )}
          {latest.oxygenSaturation != null && (
            <Card className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getStatusColor(latest.oxygenSaturation, 95, 101)}`}>
                    <Droplets className="h-4 w-4" />
                  </div>
                  {getTrendIcon(latest.oxygenSaturation, previous?.oxygenSaturation ?? null)}
                </div>
                <p className="text-2xl font-bold text-gray-900">{latest.oxygenSaturation}%</p>
                <p className="text-xs text-gray-500 mt-0.5">SpO2</p>
              </CardContent>
            </Card>
          )}
          {latest.temperature != null && (
            <Card className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getStatusColor(latest.temperature, 97, 99.5)}`}>
                    <Thermometer className="h-4 w-4" />
                  </div>
                  {getTrendIcon(latest.temperature, previous?.temperature ?? null)}
                </div>
                <p className="text-2xl font-bold text-gray-900">{latest.temperature}°F</p>
                <p className="text-xs text-gray-500 mt-0.5">Temperature</p>
              </CardContent>
            </Card>
          )}
          {latest.glucoseLevel != null && (
            <Card className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${getStatusColor(latest.glucoseLevel, 70, 140)}`}>
                    <Droplets className="h-4 w-4" />
                  </div>
                  {getTrendIcon(latest.glucoseLevel, previous?.glucoseLevel ?? null)}
                </div>
                <p className="text-2xl font-bold text-gray-900">{latest.glucoseLevel}</p>
                <p className="text-xs text-gray-500 mt-0.5">Glucose (mg/dL)</p>
              </CardContent>
            </Card>
          )}
          {latest.weight != null && (
            <Card className="border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 bg-blue-50">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  {getTrendIcon(latest.weight, previous?.weight ?? null)}
                </div>
                <p className="text-2xl font-bold text-gray-900">{latest.weight} kg</p>
                <p className="text-xs text-gray-500 mt-0.5">Weight</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No vitals recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Click &quot;Record Vitals&quot; to track your health</p>
          </CardContent>
        </Card>
      )}

      {/* Medicine Reminders */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Pill className="h-4 w-4 text-emerald-500" />
            Medicine Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No reminders set</p>
              <p className="text-xs text-gray-400">Set medicine reminders to never miss a dose</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map(r => (
                <div key={r.id} className={`flex items-center gap-3 rounded-xl p-3 ${r.isActive ? "bg-emerald-50" : "bg-gray-50 opacity-60"}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${r.isActive ? "bg-emerald-100" : "bg-gray-200"}`}>
                    <Pill className={`h-4 w-4 ${r.isActive ? "text-emerald-600" : "text-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{r.medicineName}</p>
                    <p className="text-xs text-gray-500">{r.dosage} • {r.frequency} • {r.times.join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={`text-xs border-0 ${r.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
                      {r.isActive ? "Active" : "Paused"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toggleReminder(r.id, r.isActive)}>
                      <Clock className={`h-3.5 w-3.5 ${r.isActive ? "text-amber-500" : "text-green-500"}`} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => deleteReminder(r.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vitals History */}
      {vitals.length > 0 && (
        <Card className="border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Vitals History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vitals.map(v => (
                <div key={v.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
                    <Activity className="h-4 w-4 text-sky-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-700">
                      {v.systolicBP != null && <span>BP: {v.systolicBP}/{v.diastolicBP}</span>}
                      {v.heartRate != null && <span>HR: {v.heartRate}</span>}
                      {v.oxygenSaturation != null && <span>SpO2: {v.oxygenSaturation}%</span>}
                      {v.temperature != null && <span>Temp: {v.temperature}°F</span>}
                      {v.glucoseLevel != null && <span>Glucose: {v.glucoseLevel}</span>}
                      {v.weight != null && <span>Wt: {v.weight}kg</span>}
                    </div>
                    {v.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{v.notes}</p>}
                  </div>
                  <p className="text-xs text-gray-400 shrink-0">{new Date(v.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
