"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search, Star, Clock, Calendar, MapPin, Phone, Loader2,
  Stethoscope, ChevronRight, CheckCircle, XCircle, AlertCircle,
  GraduationCap, MessageCircle, ThumbsUp, Award, Globe, User,
  FileText, Video, Heart,
} from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  hospital: string | null;
  fees: number;
  languages: string[];
  availability: string | null;
  rating: number;
  phone: string | null;
  imageUrl?: string | null;
  email?: string | null;
}

interface Appointment {
  id: string;
  date: string;
  timeSlot: string;
  reason: string | null;
  status: string;
  notes?: string | null;
  doctor: Doctor;
  createdAt: string;
}

const SPECIALTIES = [
  "all", "General Physician", "Cardiologist", "Neurologist", "Pediatrician",
  "Orthopedic Surgeon", "Dermatologist", "ENT Specialist", "Gynecologist",
  "Ophthalmologist", "Psychiatrist", "Dentist", "Pulmonologist",
  "Oncologist", "Gastroenterologist", "Urologist", "Endocrinologist",
];

const STATUS_MAP: Record<string, { color: string; darkColor: string; icon: typeof CheckCircle; label: string }> = {
  PENDING:   { color: "bg-amber-100 text-amber-700", darkColor: "dark:bg-amber-900/30 dark:text-amber-400", icon: AlertCircle, label: "Pending" },
  CONFIRMED: { color: "bg-green-100 text-green-700", darkColor: "dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle, label: "Confirmed" },
  COMPLETED: { color: "bg-blue-100 text-blue-700",  darkColor: "dark:bg-blue-900/30 dark:text-blue-400",  icon: CheckCircle, label: "Completed" },
  CANCELLED: { color: "bg-red-100 text-red-700",    darkColor: "dark:bg-red-900/30 dark:text-red-400",    icon: XCircle,     label: "Cancelled" },
  NO_SHOW:   { color: "bg-gray-100 text-gray-700",  darkColor: "dark:bg-gray-800 dark:text-gray-400",     icon: XCircle,     label: "No Show" },
};

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
  "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM",
];

// Specialty-based color + gradient for doctor avatar backgrounds
const SPECIALTY_COLORS: Record<string, string> = {
  "Cardiologist": "from-red-400 to-pink-500",
  "Neurologist": "from-purple-400 to-indigo-500",
  "Pediatrician": "from-green-400 to-emerald-500",
  "Orthopedic Surgeon": "from-orange-400 to-amber-500",
  "Dermatologist": "from-pink-400 to-rose-500",
  "ENT Specialist": "from-teal-400 to-cyan-500",
  "Gynecologist": "from-fuchsia-400 to-pink-500",
  "General Physician": "from-sky-400 to-blue-500",
  "Ophthalmologist": "from-blue-400 to-indigo-500",
  "Psychiatrist": "from-violet-400 to-purple-500",
  "Dentist": "from-cyan-400 to-teal-500",
  "Pulmonologist": "from-emerald-400 to-green-500",
  "Oncologist": "from-amber-400 to-orange-500",
  "Gastroenterologist": "from-yellow-400 to-amber-500",
  "Urologist": "from-indigo-400 to-blue-500",
  "Endocrinologist": "from-lime-400 to-green-500",
};

// Mock bio / education / reviews for rich doctor profiles
function getDoctorMeta(doc: Doctor) {
  const bios: Record<string, string> = {
    "Cardiologist": "Specialist in heart conditions, cardiac surgery, and preventive cardiology. Expert in ECG interpretation and echocardiography.",
    "Neurologist": "Expert in brain & nervous system disorders including epilepsy, stroke, and headache management.",
    "Pediatrician": "Dedicated child healthcare specialist with expertise in neonatal care, vaccinations, and childhood development.",
    "Orthopedic Surgeon": "Specializes in bone, joint & sports injuries. Expert in arthroscopy and joint replacement surgery.",
    "Dermatologist": "Skin, hair & nail specialist with expertise in cosmetic dermatology and laser treatments.",
    "ENT Specialist": "Expert in ear, nose & throat conditions including sinus surgery and hearing disorders.",
    "Gynecologist": "Women's health specialist experienced in prenatal care, fertility treatments, and laparoscopic surgery.",
    "General Physician": "Comprehensive primary care with expertise in preventive medicine, chronic disease management, and health screenings.",
    "Ophthalmologist": "Eye care specialist experienced in cataract surgery, LASIK, and retinal disorder treatment.",
    "Psychiatrist": "Mental health expert specializing in anxiety, depression, PTSD, and behavioral therapy.",
    "Dentist": "Comprehensive dental care including orthodontics, root canal therapy, and cosmetic dentistry.",
    "Pulmonologist": "Lung & respiratory specialist with expertise in asthma, COPD, and sleep apnea management.",
    "Oncologist": "Cancer care specialist with experience in chemotherapy, immunotherapy, and personalized treatment plans.",
    "Gastroenterologist": "Digestive system expert specializing in endoscopy, liver diseases, and IBD management.",
    "Urologist": "Specialist in urinary tract conditions, kidney stones, and prostate health.",
    "Endocrinologist": "Hormone & metabolism expert specializing in diabetes, thyroid disorders, and PCOS management.",
  };
  const degrees = [
    `MBBS, MD (${doc.specialty})`,
    doc.experience > 15 ? "Fellowship — AIIMS New Delhi" : doc.experience > 10 ? "DNB — Apollo Hospitals" : "Residency — KEM Hospital",
  ];
  const reviewCount = Math.floor(doc.rating * 40 + doc.experience * 5);
  const thumbsUp = Math.floor(reviewCount * (doc.rating / 5) * 0.9);
  return {
    bio: bios[doc.specialty] || "Experienced medical professional providing quality healthcare.",
    degrees,
    reviewCount,
    thumbsUp,
    consultations: Math.floor(doc.experience * 120 + Math.random() * 500),
  };
}

// Mock consultation history data
const MOCK_CONSULTATIONS = [
  { id: "mc-1", doctorName: "Rajesh Kumar", specialty: "Cardiologist", type: "In-Person", date: "2025-02-15", diagnosis: "Mild hypertension", prescription: "Amlodipine 5mg once daily, low sodium diet recommended", status: "COMPLETED", fees: 800 },
  { id: "mc-2", doctorName: "Anjali Desai", specialty: "Pediatrician", type: "Video Call", date: "2025-02-10", diagnosis: "Seasonal flu", prescription: "Paracetamol 500mg, Cetirizine 10mg, warm fluids", status: "COMPLETED", fees: 600 },
  { id: "mc-3", doctorName: "Suresh Nair", specialty: "General Physician", type: "In-Person", date: "2025-01-28", diagnosis: "Annual health checkup — all normal", prescription: "Vitamin D3 supplement, continue exercise routine", status: "COMPLETED", fees: 500 },
  { id: "mc-4", doctorName: "Meera Reddy", specialty: "Dermatologist", type: "In-Person", date: "2025-01-15", diagnosis: "Contact dermatitis", prescription: "Hydrocortisone cream 1%, avoid harsh soaps", status: "COMPLETED", fees: 550 },
  { id: "mc-5", doctorName: "Arjun Singh", specialty: "Neurologist", type: "Video Call", date: "2025-01-05", diagnosis: "Tension headache", prescription: "Ibuprofen 400mg PRN, stress management, regular sleep schedule", status: "COMPLETED", fees: 1000 },
  { id: "mc-6", doctorName: "Kavita Joshi", specialty: "Gynecologist", type: "In-Person", date: "2024-12-20", diagnosis: "Routine wellness exam", prescription: "Iron + Folic acid supplement, follow-up in 6 months", status: "COMPLETED", fees: 750 },
  { id: "mc-7", doctorName: "Deepak Gupta", specialty: "ENT Specialist", type: "In-Person", date: "2024-12-10", diagnosis: "Sinusitis", prescription: "Amoxicillin 500mg, steam inhalation, nasal spray", status: "COMPLETED", fees: 650 },
  { id: "mc-8", doctorName: "Kiran Bhatt", specialty: "Endocrinologist", type: "Video Call", date: "2024-11-25", diagnosis: "Thyroid levels within range", prescription: "Continue Levothyroxine 50mcg, recheck TSH in 3 months", status: "COMPLETED", fees: 900 },
];

// Client-side fallback doctors — always available even if API/DB is empty
const FALLBACK_DOCTORS: Doctor[] = [
  { id: "fb-1",  name: "Rajesh Kumar",       specialty: "Cardiologist",        experience: 15, hospital: "Lilavati Hospital, Mumbai",         fees: 800,  languages: ["English", "Hindi"],               availability: "Mon-Sat 10AM-6PM",  phone: "+91-9876543001", rating: 4.8, imageUrl: null, email: null },
  { id: "fb-2",  name: "Priya Sharma",       specialty: "Cardiologist",        experience: 12, hospital: "Ruby Hall Clinic, Pune",            fees: 700,  languages: ["English", "Hindi", "Marathi"],    availability: "Mon-Fri 9AM-5PM",   phone: "+91-9876543002", rating: 4.7, imageUrl: null, email: null },
  { id: "fb-3",  name: "Anjali Desai",       specialty: "Pediatrician",        experience: 10, hospital: "Kokilaben Ambani Hospital, Mumbai", fees: 600,  languages: ["English", "Hindi", "Gujarati"],   availability: "Mon-Sat 11AM-7PM",  phone: "+91-9876543003", rating: 4.9, imageUrl: null, email: null },
  { id: "fb-4",  name: "Vikram Patel",       specialty: "Orthopedic Surgeon",  experience: 18, hospital: "Jehangir Hospital, Pune",           fees: 900,  languages: ["English", "Hindi"],               availability: "Tue-Sat 2PM-8PM",   phone: "+91-9876543004", rating: 4.6, imageUrl: null, email: null },
  { id: "fb-5",  name: "Meera Reddy",        specialty: "Dermatologist",       experience: 8,  hospital: "Wockhardt Hospital, Nagpur",        fees: 550,  languages: ["English", "Hindi", "Telugu"],     availability: "Mon-Fri 10AM-6PM",  phone: "+91-9876543005", rating: 4.5, imageUrl: null, email: null },
  { id: "fb-6",  name: "Arjun Singh",        specialty: "Neurologist",         experience: 20, hospital: "Fortis Hospital, Mumbai",           fees: 1000, languages: ["English", "Hindi", "Punjabi"],    availability: "Mon-Sat 9AM-4PM",   phone: "+91-9876543006", rating: 4.9, imageUrl: null, email: null },
  { id: "fb-7",  name: "Kavita Joshi",       specialty: "Gynecologist",        experience: 14, hospital: "Sahyadri Hospital, Pune",           fees: 750,  languages: ["English", "Hindi", "Marathi"],    availability: "Mon-Sat 10AM-6PM",  phone: "+91-9876543007", rating: 4.8, imageUrl: null, email: null },
  { id: "fb-8",  name: "Suresh Nair",        specialty: "General Physician",   experience: 25, hospital: "Apollo Hospital, Nashik",           fees: 500,  languages: ["English", "Hindi", "Malayalam"],  availability: "Mon-Sun 8AM-10PM",  phone: "+91-9876543008", rating: 4.7, imageUrl: null, email: null },
  { id: "fb-9",  name: "Deepak Gupta",       specialty: "ENT Specialist",      experience: 11, hospital: "Lilavati Hospital, Mumbai",         fees: 650,  languages: ["English", "Hindi"],               availability: "Mon-Fri 9AM-5PM",   phone: "+91-9876543009", rating: 4.6, imageUrl: null, email: null },
  { id: "fb-10", name: "Sunita Rao",         specialty: "Ophthalmologist",     experience: 16, hospital: "L V Prasad Eye Institute, Pune",    fees: 700,  languages: ["English", "Hindi", "Telugu"],     availability: "Mon-Sat 10AM-5PM",  phone: "+91-9876543010", rating: 4.7, imageUrl: null, email: null },
  { id: "fb-11", name: "Manish Tiwari",      specialty: "Psychiatrist",        experience: 13, hospital: "NIMHANS Outreach, Mumbai",          fees: 800,  languages: ["English", "Hindi"],               availability: "Mon-Fri 11AM-7PM",  phone: "+91-9876543011", rating: 4.5, imageUrl: null, email: null },
  { id: "fb-12", name: "Nandini Kulkarni",   specialty: "Dentist",            experience: 9,  hospital: "Dental Care Clinic, Pune",          fees: 400,  languages: ["English", "Hindi", "Marathi"],    availability: "Mon-Sat 9AM-6PM",   phone: "+91-9876543012", rating: 4.8, imageUrl: null, email: null },
  { id: "fb-13", name: "Ramesh Iyer",        specialty: "Pulmonologist",       experience: 17, hospital: "Kokilaben Ambani Hospital, Mumbai", fees: 850,  languages: ["English", "Hindi", "Tamil"],      availability: "Mon-Fri 10AM-5PM",  phone: "+91-9876543013", rating: 4.6, imageUrl: null, email: null },
  { id: "fb-14", name: "Pooja Mehta",        specialty: "Oncologist",          experience: 14, hospital: "Tata Memorial Hospital, Mumbai",    fees: 1200, languages: ["English", "Hindi", "Gujarati"],   availability: "Tue-Sat 9AM-4PM",   phone: "+91-9876543014", rating: 4.9, imageUrl: null, email: null },
  { id: "fb-15", name: "Anil Patil",         specialty: "Gastroenterologist",  experience: 12, hospital: "Ruby Hall Clinic, Pune",            fees: 750,  languages: ["English", "Hindi", "Marathi"],    availability: "Mon-Sat 10AM-6PM",  phone: "+91-9876543015", rating: 4.7, imageUrl: null, email: null },
  { id: "fb-16", name: "Shalini Verma",      specialty: "Urologist",           experience: 10, hospital: "Fortis Hospital, Mumbai",           fees: 800,  languages: ["English", "Hindi"],               availability: "Mon-Fri 2PM-8PM",   phone: "+91-9876543016", rating: 4.5, imageUrl: null, email: null },
  { id: "fb-17", name: "Kiran Bhatt",        specialty: "Endocrinologist",     experience: 15, hospital: "Jehangir Hospital, Pune",           fees: 900,  languages: ["English", "Hindi", "Marathi"],    availability: "Mon-Sat 9AM-3PM",   phone: "+91-9876543017", rating: 4.8, imageUrl: null, email: null },
  { id: "fb-18", name: "Harsh Pandey",       specialty: "General Physician",   experience: 8,  hospital: "City Hospital, Nagpur",             fees: 350,  languages: ["English", "Hindi"],               availability: "Mon-Sun 8AM-8PM",   phone: "+91-9876543018", rating: 4.4, imageUrl: null, email: null },
  { id: "fb-19", name: "Sneha Deshmukh",     specialty: "Pediatrician",        experience: 7,  hospital: "Sahyadri Hospital, Pune",           fees: 500,  languages: ["English", "Marathi"],             availability: "Mon-Sat 10AM-5PM",  phone: "+91-9876543019", rating: 4.6, imageUrl: null, email: null },
  { id: "fb-20", name: "Raghav Mishra",      specialty: "Cardiologist",        experience: 22, hospital: "Breach Candy Hospital, Mumbai",     fees: 1500, languages: ["English", "Hindi"],               availability: "Mon-Fri 9AM-3PM",   phone: "+91-9876543020", rating: 4.9, imageUrl: null, email: null },
];

export default function DoctorConsultations() {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<Doctor[]>(FALLBACK_DOCTORS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [bookDialog, setBookDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookForm, setBookForm] = useState({ date: "", timeSlot: "", reason: "" });
  const [booking, setBooking] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [tab, setTab] = useState<"doctors" | "appointments" | "history">("doctors");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, aptRes] = await Promise.all([
          fetch(`/api/doctors?specialty=${specialty}`),
          fetch("/api/doctors/appointments"),
        ]);
        const docData = await docRes.json();
        const aptData = await aptRes.json();
        if (aptData.appointments) setAppointments(aptData.appointments);
        if (docData.doctors && docData.doctors.length > 0) {
          setDoctors(docData.doctors);
        } else if (specialty === "all") {
          // Try seeding, but keep fallback doctors visible immediately
          setSeeding(true);
          try {
            await fetch("/api/doctors/seed", { method: "POST" });
            const seededRes = await fetch("/api/doctors");
            const seededData = await seededRes.json();
            if (seededData.doctors?.length > 0) setDoctors(seededData.doctors);
          } catch { /* fallback doctors are already loaded */ } finally { setSeeding(false); }
        } else {
          // Filter fallback doctors by selected specialty
          const fallbackFiltered = FALLBACK_DOCTORS.filter(d => d.specialty === specialty);
          if (fallbackFiltered.length > 0) setDoctors(fallbackFiltered);
        }
      } catch {
        // On complete API failure, keep fallback doctors
        if (doctors.length === 0) setDoctors(FALLBACK_DOCTORS);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [specialty]);

  const seedDoctors = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/doctors/seed", { method: "POST" });
      const data = await res.json();
      toast.success(data.message);
      const docRes = await fetch("/api/doctors");
      const docData = await docRes.json();
      if (docData.doctors) setDoctors(docData.doctors);
    } catch { toast.error("Failed to seed doctors"); } finally { setSeeding(false); }
  };

  const handleBook = async () => {
    if (!selectedDoctor || !bookForm.date || !bookForm.timeSlot) {
      toast.error("Please select date and time");
      return;
    }
    setBooking(true);
    try {
      const res = await fetch("/api/doctors/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          date: bookForm.date,
          timeSlot: bookForm.timeSlot,
          reason: bookForm.reason || null,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setAppointments(prev => [data.appointment, ...prev]);
      setBookDialog(false);
      setBookForm({ date: "", timeSlot: "", reason: "" });
      setSelectedDoctor(null);
      toast.success(`Appointment booked with Dr. ${selectedDoctor.name}!`);
    } catch { toast.error("Failed to book appointment"); } finally { setBooking(false); }
  };

  const openBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookForm({ date: tomorrow.toISOString().split("T")[0], timeSlot: "", reason: "" });
    setBookDialog(true);
  };

  const openProfile = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setProfileDialog(true);
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    (d.hospital?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  const DoctorAvatar = ({ doctor, size = "md" }: { doctor: Doctor; size?: "sm" | "md" | "lg" }) => {
    const gradient = SPECIALTY_COLORS[doctor.specialty] || "from-sky-400 to-blue-500";
    const initials = doctor.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const sizeClasses = size === "lg" ? "h-20 w-20 text-xl" : size === "md" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs";
    return (
      <div className={`${sizeClasses} shrink-0 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold shadow-sm`}>
        {initials}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t("nav.consult_doctor")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("doctor.book_appointment")}</p>
        </div>
        {doctors.length === 0 && (
          <Button onClick={seedDoctors} disabled={seeding} size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
            {seeding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : "Load Doctors"}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-900/30">
              <Stethoscope className="h-4 w-4 text-sky-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{doctors.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Doctors</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
              <Calendar className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{appointments.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-900/30">
              <FileText className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{MOCK_CONSULTATIONS.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { key: "doctors" as const, label: t("doctor.find"), count: doctors.length },
          { key: "appointments" as const, label: t("doctor.my_appointments"), count: appointments.length },
          { key: "history" as const, label: "Appointments History", count: MOCK_CONSULTATIONS.length },
        ].map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              tab === tb.key ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}>
            {tb.label} ({tb.count})
          </button>
        ))}
      </div>

      {/* === FIND DOCTORS TAB === */}
      {tab === "doctors" && (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, specialty, hospital..."
                className="pl-9 dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
            </div>
            <select value={specialty} onChange={e => setSpecialty(e.target.value)}
              className="rounded-md border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white px-3 py-2 text-sm">
              {SPECIALTIES.map(s => (
                <option key={s} value={s}>{s === "all" ? "All Specialties" : s}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Stethoscope className="h-12 w-12 text-gray-200 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No doctors found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Try a different specialty or search term</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map(doc => {
                const meta = getDoctorMeta(doc);
                return (
                  <Card key={doc.id} className="border-gray-100 dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg transition-all group cursor-pointer"
                    onClick={() => openProfile(doc)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <DoctorAvatar doctor={doc} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-white">Dr. {doc.name}</h3>
                            <Badge className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-0 text-xs">{doc.specialty}</Badge>
                          </div>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1">{meta.bio}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />{doc.rating}
                              <span className="text-gray-400">({meta.reviewCount})</span>
                            </span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{doc.experience} yrs</span>
                            <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-emerald-500" />{meta.thumbsUp}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            {doc.hospital && <span className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" />{doc.hospital}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">₹{doc.fees}</span>
                          <span className="text-xs text-gray-400">per visit</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openProfile(doc); }}
                            className="text-xs gap-1 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                            <User className="h-3 w-3" />Profile
                          </Button>
                          <Button size="sm" onClick={(e) => { e.stopPropagation(); openBooking(doc); }}
                            className="bg-sky-500 hover:bg-sky-600 text-white text-xs gap-1">
                            Book <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === APPOINTMENTS TAB === */}
      {tab === "appointments" && (
        <>
          {appointments.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-900">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-200 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Book your first appointment with a doctor</p>
                <Button size="sm" onClick={() => setTab("doctors")} className="mt-4 bg-sky-500 hover:bg-sky-600 text-white">
                  Find a Doctor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {appointments.map(apt => {
                const statusInfo = STATUS_MAP[apt.status] || STATUS_MAP.PENDING;
                const StatusIcon = statusInfo.icon;
                return (
                  <Card key={apt.id} className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <DoctorAvatar doctor={apt.doctor} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Dr. {apt.doctor.name}</h3>
                            <Badge className={`${statusInfo.color} ${statusInfo.darkColor} border-0 text-xs gap-1`}>
                              <StatusIcon className="h-3 w-3" />{statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{apt.doctor.specialty} • {apt.doctor.hospital}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(apt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{apt.timeSlot}</span>
                          </div>
                          {apt.reason && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1">💬 {apt.reason}</p>}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">₹{apt.doctor.fees}</p>
                          {apt.doctor.phone && (
                            <a href={`tel:${apt.doctor.phone}`} className="flex items-center gap-1 text-xs text-sky-500 hover:text-sky-600 mt-1 justify-end">
                              <Phone className="h-3 w-3" />Call
                            </a>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* === CONSULTATION HISTORY TAB (Mock Data) === */}
      {tab === "history" && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Past Consultations</p>
          {MOCK_CONSULTATIONS.map(c => (
            <Card key={c.id} className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    c.type === "Video Call" ? "bg-purple-50 dark:bg-purple-900/30" : "bg-sky-50 dark:bg-sky-900/30"
                  }`}>
                    {c.type === "Video Call" ? <Video className="h-5 w-5 text-purple-500" /> : <Stethoscope className="h-5 w-5 text-sky-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Dr. {c.doctorName}</h3>
                      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-0 text-xs gap-1">
                        <CheckCircle className="h-3 w-3" />{c.status === "COMPLETED" ? "Completed" : c.status}
                      </Badge>
                      <Badge className={`border-0 text-xs ${c.type === "Video Call" ? "bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" : "bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"}`}>
                        {c.type === "Video Call" ? <><Video className="h-3 w-3 mr-0.5" />Video</> : <><User className="h-3 w-3 mr-0.5" />In-Person</>}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.specialty}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(c.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{c.fees}</span>
                    </div>

                    {/* Diagnosis & Prescription */}
                    <div className="mt-3 space-y-2">
                      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-2.5">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                          <Heart className="h-3 w-3" />Diagnosis
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-300">{c.diagnosis}</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-2.5">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1 mb-1">
                          <FileText className="h-3 w-3" />Prescription
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">{c.prescription}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* === DOCTOR PROFILE DIALOG === */}
      <Dialog open={profileDialog} onOpenChange={setProfileDialog}>
        <DialogContent className="sm:max-w-lg dark:bg-gray-900 dark:border-gray-800 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Doctor Profile</DialogTitle>
          </DialogHeader>
          {selectedDoctor && (() => {
            const meta = getDoctorMeta(selectedDoctor);
            return (
              <div className="space-y-4">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <DoctorAvatar doctor={selectedDoctor} size="lg" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dr. {selectedDoctor.name}</h3>
                    <Badge className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-0 text-xs mt-1">{selectedDoctor.specialty}</Badge>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500 fill-amber-500" />{selectedDoctor.rating} ({meta.reviewCount} reviews)</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-emerald-500" />{meta.thumbsUp} recommended</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{meta.bio}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 p-3 text-center">
                    <p className="text-lg font-bold text-sky-700 dark:text-sky-400">{selectedDoctor.experience}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Years Exp</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3 text-center">
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{meta.consultations}+</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Consultations</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3 text-center">
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400">₹{selectedDoctor.fees}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Per Visit</p>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />Education & Training
                  </p>
                  {meta.degrees.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Award className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="space-y-2 rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                  {selectedDoctor.hospital && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />{selectedDoctor.hospital}
                    </div>
                  )}
                  {selectedDoctor.availability && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />{selectedDoctor.availability}
                    </div>
                  )}
                  {selectedDoctor.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />{selectedDoctor.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Globe className="h-3.5 w-3.5 text-gray-400 shrink-0" />{selectedDoctor.languages.join(", ")}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MessageCircle className="h-3.5 w-3.5 text-gray-400 shrink-0" />{meta.consultations}+ patients consulted
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 dark:border-gray-700 dark:text-gray-300" onClick={() => setProfileDialog(false)}>
                    Close
                  </Button>
                  <Button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white" onClick={() => { setProfileDialog(false); openBooking(selectedDoctor); }}>
                    <Calendar className="mr-2 h-4 w-4" />Book Appointment
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* === BOOKING DIALOG === */}
      <Dialog open={bookDialog} onOpenChange={setBookDialog}>
        <DialogContent className="sm:max-w-md dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">{t("doctor.book_appointment")}</DialogTitle>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 p-3">
                <DoctorAvatar doctor={selectedDoctor} size="sm" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">Dr. {selectedDoctor.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedDoctor.specialty} • ₹{selectedDoctor.fees}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-gray-300">Date *</Label>
                <Input type="date" value={bookForm.date}
                  onChange={e => setBookForm({ ...bookForm, date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>

              <div className="space-y-2">
                <Label className="dark:text-gray-300">Time Slot *</Label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {TIME_SLOTS.map(slot => (
                    <button key={slot}
                      onClick={() => setBookForm({ ...bookForm, timeSlot: slot })}
                      className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
                        bookForm.timeSlot === slot
                          ? "bg-sky-500 text-white border-sky-500"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-sky-300"
                      }`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-gray-300">Reason (Optional)</Label>
                <Textarea value={bookForm.reason}
                  onChange={e => setBookForm({ ...bookForm, reason: e.target.value })}
                  placeholder="Briefly describe your symptoms or reason for visit..."
                  rows={3} className="dark:bg-gray-800 dark:border-gray-700 dark:text-white" />
              </div>

              {selectedDoctor.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Phone className="h-3 w-3" />Contact: {selectedDoctor.phone}
                </div>
              )}

              <Button onClick={handleBook} disabled={booking} className="w-full bg-sky-500 hover:bg-sky-600 text-white">
                {booking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Booking...</> : <><Calendar className="mr-2 h-4 w-4" />Confirm Booking</>}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
