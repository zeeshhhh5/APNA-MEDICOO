"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ClipboardList, FileText, Pill, Ambulance, Stethoscope, Package,
  Loader2, Plus, X, User, Heart, Shield, Save,
} from "lucide-react";
import { toast } from "sonner";

interface HealthRecord {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  createdAt: string;
  fileUrl?: string | null;
}

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

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  CONSULTATION: { icon: Stethoscope, color: "text-purple-600", bg: "bg-purple-50" },
  PRESCRIPTION:  { icon: Pill,        color: "text-emerald-600", bg: "bg-emerald-50" },
  LAB_REPORT:    { icon: FileText,    color: "text-sky-600",     bg: "bg-sky-50" },
  AMBULANCE_TRIP:{ icon: Ambulance,   color: "text-red-600",     bg: "bg-red-50" },
  MEDICINE_ORDER:{ icon: Package,     color: "text-amber-600",   bg: "bg-amber-50" },
};

export default function HealthRecords() {
  const [tab, setTab] = useState<"records" | "profile">("records");

  // ─── Records State ───
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ type: "LAB_REPORT", title: "", description: "" });

  // ─── Profile State ───
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newAllergy, setNewAllergy] = useState("");
  const [newMed, setNewMed] = useState("");

  const fetchRecords = () => {
    setRecordsLoading(true);
    fetch("/api/patients/records")
      .then((r) => r.json())
      .then((d) => { if (d.records) setRecords(d.records); })
      .catch(() => {})
      .finally(() => setRecordsLoading(false));
  };

  const fetchProfile = () => {
    setProfileLoading(true);
    fetch("/api/patients/profile")
      .then((r) => r.json())
      .then((d) => { if (d.profile) setProfile(d.profile); })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setProfileLoading(false));
  };

  useEffect(() => {
    fetchRecords();
    fetchProfile();
  }, []);

  // ─── Records Handlers ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { toast.error("Please enter a title"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/patients/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Health record added successfully");
      setIsDialogOpen(false);
      setFormData({ type: "LAB_REPORT", title: "", description: "" });
      fetchRecords();
    } catch {
      toast.error("Failed to add health record");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Profile Handlers ───
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
      toast.success("Profile saved successfully!");
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

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Health Records & Profile</h2>
          <p className="text-sm text-gray-500">Medical history and personal health information</p>
        </div>
        {tab === "records" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-sky-500 hover:bg-sky-600 text-white">
                <Plus className="h-4 w-4 mr-2" />Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader><DialogTitle>Add Health Record</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Record Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LAB_REPORT">Lab Report</SelectItem>
                      <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
                      <SelectItem value="CONSULTATION">Consultation</SelectItem>
                      <SelectItem value="AMBULANCE_TRIP">Ambulance Trip</SelectItem>
                      <SelectItem value="MEDICINE_ORDER">Medicine Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="e.g., Blood Test Report" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea placeholder="Additional details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>Cancel</Button>
                  <Button type="submit" disabled={submitting} className="bg-sky-500 hover:bg-sky-600">
                    {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : "Add Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
        {tab === "profile" && (
          <Button onClick={handleSave} disabled={saving} className="bg-sky-500 hover:bg-sky-600 text-white gap-1.5">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />Save Profile</>}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button onClick={() => setTab("records")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === "records" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <ClipboardList className="h-3.5 w-3.5" />Records ({records.length})
        </button>
        <button onClick={() => setTab("profile")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${tab === "profile" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <User className="h-3.5 w-3.5" />Health Profile
        </button>
      </div>

      {/* ─── Records Tab ─── */}
      {tab === "records" && (
        <>
          {recordsLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ClipboardList className="h-12 w-12 text-gray-200 mb-3" />
              <p className="text-gray-500">No health records yet</p>
              <p className="text-sm text-gray-400 mt-1">Your consultations, prescriptions and reports will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => {
                const cfg = TYPE_CONFIG[record.type] ?? TYPE_CONFIG.CONSULTATION;
                return (
                  <Card key={record.id} className="border-gray-100">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                        <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{record.title}</p>
                        {record.description && <p className="text-xs text-gray-500 truncate mt-0.5">{record.description}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(record.createdAt).toLocaleDateString("en-IN")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border-0 ${cfg.bg} ${cfg.color}`}>{record.type.replace(/_/g, " ")}</Badge>
                        {record.fileUrl && (
                          <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="h-7 text-xs">View</Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── Profile Tab ─── */}
      {tab === "profile" && (
        <>
          {profileLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : !profile ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-500">Profile not found. Please complete onboarding first.</p>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
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
                        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                        <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                        <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
                        <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
                        <SelectItem value="ml">മലയാളം (Malayalam)</SelectItem>
                        <SelectItem value="pa">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                        <SelectItem value="ur">اردو (Urdu)</SelectItem>
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
                  <div className="space-y-2">
                    <Label>Allergies</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.allergies.map((a, i) => (
                        <Badge key={i} className="bg-red-50 text-red-700 border-0 gap-1">
                          {a}<button onClick={() => removeAllergy(i)} className="ml-1 hover:text-red-900"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                      {profile.allergies.length === 0 && <p className="text-xs text-gray-400">No allergies recorded</p>}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newAllergy} onChange={e => setNewAllergy(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addAllergy())} placeholder="e.g. Penicillin, Peanuts" className="flex-1" />
                      <Button onClick={addAllergy} variant="outline" size="sm"><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Medications</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {profile.currentMedications.map((m, i) => (
                        <Badge key={i} className="bg-emerald-50 text-emerald-700 border-0 gap-1">
                          {m}<button onClick={() => removeMedication(i)} className="ml-1 hover:text-emerald-900"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                      {profile.currentMedications.length === 0 && <p className="text-xs text-gray-400">No medications recorded</p>}
                    </div>
                    <div className="flex gap-2">
                      <Input value={newMed} onChange={e => setNewMed(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addMedication())} placeholder="e.g. Metformin 500mg" className="flex-1" />
                      <Button onClick={addMedication} variant="outline" size="sm"><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Medical History</Label>
                    <Textarea value={profile.medicalHistory || ""} onChange={e => setProfile({ ...profile, medicalHistory: e.target.value })} placeholder="Previous surgeries, chronic conditions, hospitalizations..." rows={4} />
                  </div>
                </CardContent>
              </Card>

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
          )}
        </>
      )}
    </div>
  );
}
