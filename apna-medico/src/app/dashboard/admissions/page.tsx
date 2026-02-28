"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UserCheck, Users, Clock, Plus } from "lucide-react";
import { toast } from "sonner";

interface Admission {
  id: string;
  patientName: string;
  admissionDate: string;
  bedType: string;
  status: string;
  ward?: string;
  diagnosis?: string;
}

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientName: "",
    bedType: "GENERAL",
    ward: "",
    diagnosis: "",
  });

  useEffect(() => {
    // Load mock admissions
    const mockAdmissions: Admission[] = [
      {
        id: "1",
        patientName: "Rajesh Kumar",
        admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        bedType: "ICU",
        status: "ADMITTED",
        ward: "ICU Ward A",
        diagnosis: "Cardiac arrest recovery",
      },
      {
        id: "2",
        patientName: "Priya Sharma",
        admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        bedType: "GENERAL",
        status: "ADMITTED",
        ward: "General Ward 2",
        diagnosis: "Post-surgery observation",
      },
      {
        id: "3",
        patientName: "Amit Patel",
        admissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        bedType: "PRIVATE",
        status: "ADMITTED",
        ward: "Private Room 101",
        diagnosis: "Pneumonia treatment",
      },
    ];
    setAdmissions(mockAdmissions);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientName.trim() || !formData.ward.trim()) {
      toast.error("Patient name and ward are required");
      return;
    }

    setSubmitting(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const newAdmission: Admission = {
        id: Date.now().toString(),
        patientName: formData.patientName,
        admissionDate: new Date().toISOString(),
        bedType: formData.bedType,
        status: "ADMITTED",
        ward: formData.ward,
        diagnosis: formData.diagnosis || undefined,
      };
      
      setAdmissions([newAdmission, ...admissions]);
      toast.success("Patient admitted successfully");
      setIsDialogOpen(false);
      setFormData({ patientName: "", bedType: "GENERAL", ward: "", diagnosis: "" });
      setSubmitting(false);
    }, 1000);
  };

  const icuCount = admissions.filter(a => a.bedType === "ICU").length;
  const totalAdmitted = admissions.length;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Patient Admissions</h2>
          <p className="text-sm text-gray-500">Track current and recent admissions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sky-500 hover:bg-sky-600">
              <Plus className="h-4 w-4 mr-2" />
              Admit Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Admit New Patient</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  placeholder="Full name"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedType">Bed Type</Label>
                <Select
                  value={formData.bedType}
                  onValueChange={(value) => setFormData({ ...formData, bedType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">General Ward</SelectItem>
                    <SelectItem value="PRIVATE">Private Room</SelectItem>
                    <SelectItem value="ICU">ICU</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ward">Ward/Room Number</Label>
                <Input
                  id="ward"
                  placeholder="e.g., Ward 3 or Room 205"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis (Optional)</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Initial diagnosis or reason for admission"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  rows={3}
                />
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
                <Button type="submit" disabled={submitting} className="bg-sky-500 hover:bg-sky-600">
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Admitting...
                    </>
                  ) : (
                    "Admit Patient"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Admitted", value: totalAdmitted, icon: Users, color: "text-sky-500", bg: "bg-sky-50" },
          { label: "ICU", value: icuCount, icon: UserCheck, color: "text-red-500", bg: "bg-red-50" },
          { label: "Pending Discharge", value: 0, icon: Clock, color: "text-amber-500", bg: "bg-amber-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-gray-100">
            <CardContent className="p-3 text-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${bg} mx-auto mb-2`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>
      ) : admissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <UserCheck className="h-12 w-12 text-gray-200 mb-3" />
          <p className="text-gray-500">No active admissions</p>
          <p className="text-xs text-gray-400 mt-1">Patient admissions will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {admissions.map((a) => (
            <Card key={a.id} className="border-gray-100">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{a.patientName}</p>
                  <p className="text-xs text-gray-400">{a.ward} · {new Date(a.admissionDate).toLocaleDateString("en-IN")}</p>
                </div>
                <Badge className="bg-sky-100 text-sky-700 border-0 text-xs">{a.bedType}</Badge>
                <Badge className="bg-green-100 text-green-700 border-0 text-xs">{a.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
