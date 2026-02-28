"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  HeartPulse,
  Hospital,
  Ambulance,
  Pill,
  ShieldCheck,
  ChevronRight,
  Loader2,
  UserCircle,
} from "lucide-react";

const roles = [
  {
    id: "PATIENT",
    label: "Patient",
    description: "Access AI doctor, book ambulances, find hospitals, order medicines",
    icon: HeartPulse,
    bg: "bg-sky-50 hover:bg-sky-100 border-sky-200",
    selectedBg: "bg-sky-500 text-white border-sky-500",
    iconColor: "text-sky-500",
  },
  {
    id: "HOSPITAL_STAFF",
    label: "Hospital Staff",
    description: "Manage bed availability, staff schedules, and patient admissions",
    icon: Hospital,
    bg: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    selectedBg: "bg-emerald-500 text-white border-emerald-500",
    iconColor: "text-emerald-500",
  },
  {
    id: "AMBULANCE_DRIVER",
    label: "Ambulance Driver",
    description: "Receive emergency alerts, navigate to patients, manage trips",
    icon: Ambulance,
    bg: "bg-red-50 hover:bg-red-100 border-red-200",
    selectedBg: "bg-red-500 text-white border-red-500",
    iconColor: "text-red-500",
  },
  {
    id: "MEDICAL_STORE",
    label: "Medical Store",
    description: "Accept emergency orders, manage inventory, track deliveries",
    icon: Pill,
    bg: "bg-amber-50 hover:bg-amber-100 border-amber-200",
    selectedBg: "bg-amber-500 text-white border-amber-500",
    iconColor: "text-amber-500",
  },
  {
    id: "ADMIN",
    label: "Admin",
    description: "Platform-wide oversight, user management, analytics",
    icon: ShieldCheck,
    bg: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    selectedBg: "bg-purple-500 text-white border-purple-500",
    iconColor: "text-purple-500",
  },
];

export default function OnboardingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<"role" | "details">("role");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState("");

  // Role-specific fields
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [designation, setDesignation] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("BASIC");
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");

  const handleContinue = () => {
    if (!selectedRole) { toast.error("Please select a role to continue"); return; }
    setStep("details");
  };

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Please enter your name"); return; }
    setLoading(true);
    try {
      const payload: Record<string, string> = {
        role: selectedRole!,
        name: name.trim(),
        phone: phone.trim(),
      };

      if (selectedRole === "HOSPITAL_STAFF") {
        payload.hospitalName = hospitalName.trim();
        payload.hospitalAddress = hospitalAddress.trim();
        payload.designation = designation.trim();
      } else if (selectedRole === "AMBULANCE_DRIVER") {
        payload.vehicleNumber = vehicleNumber.trim();
        payload.licenseNumber = licenseNumber.trim();
        payload.vehicleType = vehicleType;
      } else if (selectedRole === "MEDICAL_STORE") {
        payload.storeName = storeName.trim();
        payload.storeAddress = storeAddress.trim();
      }

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save role");
      }
      await user?.reload();
      toast.success("Welcome to Apna Medico!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "PATIENT", name: user?.fullName ?? "User", phone: "" }),
      });
      await user?.reload();
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50">
      <div className="m-auto w-full max-w-2xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500 shadow-lg shadow-sky-200">
            <HeartPulse className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Apna Medico</h1>
          <p className="mt-2 text-gray-500">
            {step === "role" ? "Tell us who you are to personalize your experience" : "Just a few more details"}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-16 rounded-full bg-sky-500" />
            <div className={`h-2 w-16 rounded-full transition-colors ${step === "details" ? "bg-sky-500" : "bg-sky-200"}`} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === "role" && (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="grid gap-3">
                {roles.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                        isSelected ? role.selectedBg : role.bg
                      }`}
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isSelected ? "bg-white/20" : "bg-white"}`}>
                        <role.icon className={`h-6 w-6 ${isSelected ? "text-white" : role.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold ${isSelected ? "text-white" : "text-gray-900"}`}>{role.label}</p>
                          {isSelected && <Badge className="bg-white/20 text-white text-xs border-0">Selected</Badge>}
                        </div>
                        <p className={`mt-0.5 text-sm ${isSelected ? "text-white/80" : "text-gray-500"}`}>{role.description}</p>
                      </div>
                      <ChevronRight className={`h-5 w-5 shrink-0 ${isSelected ? "text-white" : "text-gray-300"}`} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="ghost" className="flex-1 text-gray-500" onClick={handleSkip} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Skip (Join as Patient)"}
                </Button>
                <Button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white" onClick={handleContinue} disabled={!selectedRole}>
                  Continue <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-100">
                <div className="mb-6 flex items-center gap-3">
                  <UserCircle className="h-8 w-8 text-sky-500" />
                  <div>
                    <h2 className="font-semibold text-gray-900">Your Profile</h2>
                    <p className="text-sm text-gray-500">
                      Role: <span className="font-medium text-sky-600">{roles.find((r) => r.id === selectedRole)?.label}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Common fields */}
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Sharma / Rahul Kumar" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1" />
                  </div>

                  {/* Hospital Staff fields */}
                  {selectedRole === "HOSPITAL_STAFF" && (
                    <>
                      <div>
                        <Label htmlFor="hospitalName" className="text-sm font-medium text-gray-700">Hospital Name *</Label>
                        <Input id="hospitalName" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="AIIMS Delhi" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="hospitalAddress" className="text-sm font-medium text-gray-700">Hospital Address</Label>
                        <Input id="hospitalAddress" value={hospitalAddress} onChange={(e) => setHospitalAddress(e.target.value)} placeholder="Ansari Nagar, New Delhi" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="designation" className="text-sm font-medium text-gray-700">Your Designation</Label>
                        <Input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Doctor / Nurse / Admin" className="mt-1" />
                      </div>
                    </>
                  )}

                  {/* Ambulance Driver fields */}
                  {selectedRole === "AMBULANCE_DRIVER" && (
                    <>
                      <div>
                        <Label htmlFor="vehicleNumber" className="text-sm font-medium text-gray-700">Vehicle Number *</Label>
                        <Input id="vehicleNumber" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="MH-01-AB-1234" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700">License Number *</Label>
                        <Input id="licenseNumber" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="DL-0420110012345" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Vehicle Type</Label>
                        <div className="mt-1 flex gap-2">
                          {(["BASIC", "ADVANCED"] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setVehicleType(type)}
                              className={`flex-1 rounded-xl border-2 p-3 text-center text-sm font-medium transition-all ${
                                vehicleType === type
                                  ? "border-red-500 bg-red-50 text-red-700"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              {type === "BASIC" ? "Basic Life Support" : "Advanced Life Support"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Medical Store fields */}
                  {selectedRole === "MEDICAL_STORE" && (
                    <>
                      <div>
                        <Label htmlFor="storeName" className="text-sm font-medium text-gray-700">Store Name *</Label>
                        <Input id="storeName" value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="MedPlus Pharmacy" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="storeAddress" className="text-sm font-medium text-gray-700">Store Address *</Label>
                        <Input id="storeAddress" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} placeholder="123, MG Road, Pune" className="mt-1" />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setStep("role")} disabled={loading}>
                    Back
                  </Button>
                  <Button
                    className="flex-1 bg-sky-500 hover:bg-sky-600 text-white"
                    onClick={handleSubmit}
                    disabled={loading || !name.trim()}
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting up...</>
                    ) : (
                      <>Complete Setup <ChevronRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
