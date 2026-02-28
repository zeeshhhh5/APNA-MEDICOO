"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Pill, Plus, Loader2, Clock, Calendar, Bell, BellOff, Trash2,
  CheckCircle, AlertTriangle,
} from "lucide-react";

interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
}

const FREQUENCY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "twice_daily", label: "Twice Daily" },
  { value: "thrice_daily", label: "Three Times Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "alternate_days", label: "Alternate Days" },
  { value: "as_needed", label: "As Needed" },
];

export default function MedicationReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    medicineName: "",
    dosage: "",
    frequency: "daily",
    times: "08:00",
    endDate: "",
  });

  const fetchReminders = () => {
    setLoading(true);
    fetch("/api/health/reminders")
      .then((r) => r.json())
      .then((d) => { if (d.reminders) setReminders(d.reminders); })
      .catch(() => toast.error("Failed to load reminders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.medicineName.trim() || !form.dosage.trim()) {
      toast.error("Medicine name and dosage are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/health/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          times: form.times.split(",").map((t) => t.trim()),
          endDate: form.endDate || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setReminders((prev) => [data.reminder, ...prev]);
      setIsDialogOpen(false);
      setForm({ medicineName: "", dosage: "", frequency: "daily", times: "08:00", endDate: "" });
      toast.success("Medication reminder added!");
    } catch {
      toast.error("Failed to add reminder");
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
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: !isActive } : r)));
      toast.success(isActive ? "Reminder paused" : "Reminder activated");
    } catch {
      toast.error("Failed to update reminder");
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await fetch(`/api/health/reminders?id=${id}`, { method: "DELETE" });
      setReminders((prev) => prev.filter((r) => r.id !== id));
      toast.success("Reminder deleted");
    } catch {
      toast.error("Failed to delete reminder");
    }
  };

  const activeReminders = reminders.filter((r) => r.isActive);
  const pausedReminders = reminders.filter((r) => !r.isActive);

  const getNextDoseTime = (reminder: Reminder) => {
    if (!reminder.times || reminder.times.length === 0) return null;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const time of reminder.times) {
      const [h, m] = time.split(":").map(Number);
      if (h * 60 + m > currentMinutes) return time;
    }
    return reminder.times[0] + " (tomorrow)";
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Medication Reminders</h2>
          <p className="text-sm text-gray-500">{activeReminders.length} active · {pausedReminders.length} paused</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sky-500 hover:bg-sky-600 text-white gap-1.5">
              <Plus className="h-4 w-4" /> Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Medication Reminder</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Medicine Name *</Label>
                <Input
                  placeholder="e.g. Metformin 500mg"
                  value={form.medicineName}
                  onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Dosage *</Label>
                <Input
                  placeholder="e.g. 1 tablet, 5ml, 2 capsules"
                  value={form.dosage}
                  onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reminder Times (comma-separated)</Label>
                <Input
                  placeholder="08:00, 14:00, 20:00"
                  value={form.times}
                  onChange={(e) => setForm({ ...form, times: e.target.value })}
                />
                <p className="text-xs text-gray-400">Use 24-hour format. Separate multiple times with commas.</p>
              </div>
              <div className="space-y-2">
                <Label>End Date (optional)</Label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-sky-500 hover:bg-sky-600">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : "Add Reminder"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-gray-100">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50">
              <Pill className="h-4 w-4 text-sky-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{reminders.length}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Bell className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{activeReminders.length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <BellOff className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{pausedReminders.length}</p>
              <p className="text-xs text-gray-500">Paused</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50">
              <Clock className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {reminders.reduce((acc, r) => acc + r.times.length, 0)}
              </p>
              <p className="text-xs text-gray-500">Daily Doses</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Pill className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No medication reminders set</p>
          <p className="text-sm text-gray-400 mt-1">Add your first reminder to never miss a dose</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Active Reminders */}
          {activeReminders.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Reminders</p>
              {activeReminders.map((reminder) => {
                const nextDose = getNextDoseTime(reminder);
                const isExpired = reminder.endDate && new Date(reminder.endDate) < new Date();
                return (
                  <Card key={reminder.id} className={`border-gray-100 ${isExpired ? "opacity-60" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                          <Pill className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-gray-800">{reminder.medicineName}</p>
                            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-xs">{reminder.dosage}</Badge>
                            {isExpired && (
                              <Badge className="bg-red-50 text-red-600 border-0 text-xs gap-1">
                                <AlertTriangle className="h-3 w-3" /> Expired
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {FREQUENCY_OPTIONS.find((f) => f.value === reminder.frequency)?.label || reminder.frequency}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bell className="h-3 w-3" />
                              {reminder.times.join(", ")}
                            </span>
                            {reminder.endDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Until {new Date(reminder.endDate).toLocaleDateString("en-IN")}
                              </span>
                            )}
                          </div>
                          {nextDose && !isExpired && (
                            <p className="text-xs text-emerald-600 font-medium mt-1">
                              <CheckCircle className="h-3 w-3 inline mr-1" />
                              Next dose: {nextDose}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Switch
                            checked={reminder.isActive}
                            onCheckedChange={() => toggleReminder(reminder.id, reminder.isActive)}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => deleteReminder(reminder.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}

          {/* Paused Reminders */}
          {pausedReminders.length > 0 && (
            <>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">Paused Reminders</p>
              {pausedReminders.map((reminder) => (
                <Card key={reminder.id} className="border-gray-100 opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <BellOff className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-600">{reminder.medicineName}</p>
                        <p className="text-xs text-gray-400">{reminder.dosage} · {reminder.times.join(", ")}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={reminder.isActive}
                          onCheckedChange={() => toggleReminder(reminder.id, reminder.isActive)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => deleteReminder(reminder.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
