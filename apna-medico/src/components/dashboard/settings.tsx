"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, User, Heart } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "", phone: "", bloodGroup: "", gender: "",
    allergies: "", currentMedications: "", medicalHistory: "", emergencyContact: "",
  });

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setForm({
            name: d.user.name ?? "",
            phone: d.user.phone ?? "",
            bloodGroup: d.patient?.bloodGroup ?? "",
            gender: d.patient?.gender ?? "",
            allergies: d.patient?.allergies?.join(", ") ?? "",
            currentMedications: d.patient?.currentMedications?.join(", ") ?? "",
            medicalHistory: d.patient?.medicalHistory ?? "",
            emergencyContact: d.patient?.emergencyContact ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          allergies: form.allergies.split(",").map((s) => s.trim()).filter(Boolean),
          currentMedications: form.currentMedications.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Profile updated successfully!");
    } catch { toast.error("Failed to save. Please try again."); }
    finally { setLoading(false); }
  };

  if (fetching) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>
        <p className="text-sm text-gray-500">Update your health profile for better AI consultations</p>
      </div>

      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4 text-sky-500" /> Personal Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs text-gray-500">Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" placeholder="+91 98765 43210" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Emergency Contact</Label>
            <Input value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className="mt-1" placeholder="Name & phone of emergency contact" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" /> Medical Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-gray-500">Blood Group</Label>
              <Select value={form.bloodGroup} onValueChange={(v) => setForm({ ...form, bloodGroup: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-500">Known Allergies (comma separated)</Label>
            <Input value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} className="mt-1" placeholder="Penicillin, Sulfa, Peanuts..." />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Current Medications (comma separated)</Label>
            <Input value={form.currentMedications} onChange={(e) => setForm({ ...form, currentMedications: e.target.value })} className="mt-1" placeholder="Metformin 500mg, Amlodipine 5mg..." />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Medical History</Label>
            <Textarea value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} className="mt-1 resize-none" rows={3} placeholder="Diabetes, Hypertension, previous surgeries..." />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="bg-sky-500 hover:bg-sky-600 text-white px-8">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
      </Button>
    </div>
  );
}
