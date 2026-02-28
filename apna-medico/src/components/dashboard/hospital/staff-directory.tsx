"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Clock, Plus, Power } from "lucide-react";
import { toast } from "sonner";

interface StaffMember {
  id: string;
  designation: string;
  specialization?: string | null;
  isOnDuty: boolean;
  shiftStart?: string | null;
  shiftEnd?: string | null;
  user: { name: string; email: string; avatar?: string | null };
}

export default function StaffDirectory() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "Nurse",
    specialization: "",
    shiftStart: "09:00",
    shiftEnd: "17:00",
  });

  const fetchStaff = () => {
    setLoading(true);
    fetch("/api/hospitals/staff")
      .then((r) => r.json())
      .then((d) => { if (d.staff) setStaff(d.staff); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/hospitals/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to add staff");

      toast.success("Staff member added successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", designation: "Nurse", specialization: "", shiftStart: "09:00", shiftEnd: "17:00" });
      fetchStaff();
    } catch {
      toast.error("Failed to add staff member");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDuty = async (staffId: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/hospitals/staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, isOnDuty: !currentStatus }),
      });

      if (!res.ok) throw new Error("Failed to update duty status");

      toast.success(currentStatus ? "Marked as off duty" : "Marked as on duty");
      fetchStaff();
    } catch {
      toast.error("Failed to update duty status");
    }
  };

  const onDuty = staff.filter((s) => s.isOnDuty);
  const offDuty = staff.filter((s) => !s.isOnDuty);

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Staff Directory</h2>
          <p className="text-sm text-gray-500">{onDuty.length} on duty · {offDuty.length} off duty</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Dr. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@hospital.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Select
                  value={formData.designation}
                  onValueChange={(value) => setFormData({ ...formData, designation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Doctor">Doctor</SelectItem>
                    <SelectItem value="Nurse">Nurse</SelectItem>
                    <SelectItem value="Surgeon">Surgeon</SelectItem>
                    <SelectItem value="Pharmacist">Pharmacist</SelectItem>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="Receptionist">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization (Optional)</Label>
                <Input
                  id="specialization"
                  placeholder="e.g., Cardiology"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="shiftStart">Shift Start</Label>
                  <Input
                    id="shiftStart"
                    type="time"
                    value={formData.shiftStart}
                    onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shiftEnd">Shift End</Label>
                  <Input
                    id="shiftEnd"
                    type="time"
                    value={formData.shiftEnd}
                    onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-emerald-500 hover:bg-emerald-600">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Staff"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
      ) : staff.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No staff members registered</p>
          <p className="text-xs text-gray-400 mt-1">Staff members will appear here once they join your hospital</p>
        </div>
      ) : (
        <div className="space-y-2">
          {staff.map((member) => (
            <Card key={member.id} className="border-gray-100">
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-bold">
                    {member.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{member.user.name}</p>
                  <p className="text-xs text-gray-500">{member.designation}{member.specialization ? ` · ${member.specialization}` : ""}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {member.shiftStart && member.shiftEnd && (
                    <div className="hidden sm:flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-400">{member.shiftStart}–{member.shiftEnd}</span>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleDuty(member.id, member.isOnDuty)}
                    className={`h-7 text-xs ${member.isOnDuty ? "border-green-300 bg-green-50 hover:bg-green-100" : "border-gray-300"}`}
                  >
                    <Power className="h-3 w-3 mr-1" />
                    {member.isOnDuty ? "On Duty" : "Off Duty"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
