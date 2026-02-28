"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { User, Heart, Shield, Loader2, Save, Plus, X } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  height: number | null;
  weight: number | null;
  allergies: string[];
  currentMedications: string[];
  medicalHistory: string | null;
  emergencyContact: string | null;
  language: string;
}

export default function HealthProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [newMed, setNewMed] = useState("");

  useEffect(() => {
    fetch("/api/patients/profile")
      .then(r => r.json())
      .then(d => { if (d.profile) setProfile(d.profile); })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch("/api/patients/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const addAllergy = () => {
    if (!newAllergy.trim() || !profile) return;
    setProfile({ ...profile, allergies: [...profile.allergies, newAllergy.trim()] });
    setNewAllergy("");
  };

  const removeAllergy = (idx: number) => {
    if (!profile) return;
    setProfile({ ...profile, allergies: profile.allergies.filter((_, i) => i !== idx) });
  };

  const addMedication = () => {
    if (!newMed.trim() || !profile) return;
    setProfile({ ...profile, currentMedications: [...profile.currentMedications, newMed.trim()] });
    setNewMed("");
  };

  const removeMedication = (idx: number) => {
    if (!profile) return;
    setProfile({ ...profile, currentMedications: profile.currentMedications.filter((_, i) => i !== idx) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">Profile not found. Please complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Health Profile</h2>
          <p className="text-sm text-gray-500">Keep your medical information up to date</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-sky-500 hover:bg-sky-600 text-white gap-1.5">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Profile</>}
        </Button>
      </div>

      {/* Personal Info */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4 text-sky-500" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={profile.phone || ""} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 9876543210" />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split("T")[0] : ""} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={profile.gender || ""} onValueChange={v => setProfile({ ...profile, gender: v })}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Select value={profile.bloodGroup || ""} onValueChange={v => setProfile({ ...profile, bloodGroup: v })}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input type="number" value={profile.height || ""} onChange={e => setProfile({ ...profile, height: parseFloat(e.target.value) || null })} placeholder="170" />
            </div>
            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input type="number" value={profile.weight || ""} onChange={e => setProfile({ ...profile, weight: parseFloat(e.target.value) || null })} placeholder="70" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Emergency Contact</Label>
            <Input value={profile.emergencyContact || ""} onChange={e => setProfile({ ...profile, emergencyContact: e.target.value })} placeholder="+91 9876543210 (Family member)" />
          </div>
          <div className="space-y-2">
            <Label>Preferred Language</Label>
            <Select value={profile.language} onValueChange={v => setProfile({ ...profile, language: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                <SelectItem value="mr">मराठी (Marathi)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medical Info */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" /> Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Allergies */}
          <div className="space-y-2">
            <Label>Allergies</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.allergies.map((a, i) => (
                <Badge key={i} className="bg-red-50 text-red-700 border-0 gap-1">
                  {a}
                  <button onClick={() => removeAllergy(i)} className="ml-1 hover:text-red-900"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
              {profile.allergies.length === 0 && <p className="text-xs text-gray-400">No allergies recorded</p>}
            </div>
            <div className="flex gap-2">
              <Input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addAllergy())} placeholder="e.g. Penicillin, Peanuts" className="flex-1" />
              <Button onClick={addAllergy} variant="outline" size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Current Medications */}
          <div className="space-y-2">
            <Label>Current Medications</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {profile.currentMedications.map((m, i) => (
                <Badge key={i} className="bg-emerald-50 text-emerald-700 border-0 gap-1">
                  {m}
                  <button onClick={() => removeMedication(i)} className="ml-1 hover:text-emerald-900"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
              {profile.currentMedications.length === 0 && <p className="text-xs text-gray-400">No medications recorded</p>}
            </div>
            <div className="flex gap-2">
              <Input value={newMed} onChange={e => setNewMed(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addMedication())} placeholder="e.g. Metformin 500mg" className="flex-1" />
              <Button onClick={addMedication} variant="outline" size="sm"><Plus className="h-4 w-4" /></Button>
            </div>
          </div>

          {/* Medical History */}
          <div className="space-y-2">
            <Label>Medical History</Label>
            <Textarea value={profile.medicalHistory || ""} onChange={e => setProfile({ ...profile, medicalHistory: e.target.value })} placeholder="Previous surgeries, chronic conditions, hospitalizations..." rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Data Safety */}
      <Card className="border-gray-100 bg-green-50">
        <CardContent className="flex items-center gap-3 p-4">
          <Shield className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Your data is secure</p>
            <p className="text-xs text-green-700">Medical information is encrypted and HIPAA-compliant. Only you and your doctors can access it.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
