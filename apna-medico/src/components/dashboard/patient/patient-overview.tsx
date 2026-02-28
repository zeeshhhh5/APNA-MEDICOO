"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Ambulance, Hospital, Pill, ClipboardList,
  ChevronRight, Heart, Activity, AlertTriangle, Phone,
  Stethoscope, User,
} from "lucide-react";
import type { DashboardUser } from "@/types/dashboard";
import { useLanguage } from "@/contexts/language-context";

export default function PatientDashboard({ user }: { user: DashboardUser }) {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({ consultations: 0, records: 0, appointments: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/consultations").then(r => r.json()).catch(() => ({ consultations: [] })),
      fetch("/api/patients/records").then(r => r.json()).catch(() => ({ records: [] })),
      fetch("/api/doctors/appointments").then(r => r.json()).catch(() => ({ appointments: [] })),
    ]).then(([cData, rData, aData]) => {
      setCounts({
        consultations: cData.consultations?.length ?? 0,
        records: rData.records?.length ?? 0,
        appointments: aData.appointments?.length ?? 0,
      });
    });
  }, []);

  const quickActions = [
    {
      icon: Activity,
      label: t("nav.health_tracker"),
      description: "Track BP, SpO2, vitals",
      href: "/dashboard/health-tracker",
      color: "bg-teal-500",
      bg: "bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20 dark:hover:bg-teal-900/30",
      textColor: "text-teal-700 dark:text-teal-400",
    },
    {
      icon: Brain,
      label: t("nav.ai_doctor"),
      description: "Consult Dr. Aryan AI",
      href: "/dashboard/ai-doctor",
      color: "bg-purple-500",
      bg: "bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30",
      textColor: "text-purple-700 dark:text-purple-400",
    },
    {
      icon: Stethoscope,
      label: t("nav.consult_doctor"),
      description: "Book physical checkup",
      href: "/dashboard/doctors",
      color: "bg-indigo-500",
      bg: "bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30",
      textColor: "text-indigo-700 dark:text-indigo-400",
    },
    {
      icon: Ambulance,
      label: t("nav.book_ambulance"),
      description: "Emergency response",
      href: "/dashboard/ambulance",
      color: "bg-red-500",
      bg: "bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30",
      textColor: "text-red-700 dark:text-red-400",
    },
    {
      icon: Hospital,
      label: t("nav.find_hospitals"),
      description: "Nearby beds available",
      href: "/dashboard/hospitals",
      color: "bg-sky-500",
      bg: "bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20 dark:hover:bg-sky-900/30",
      textColor: "text-sky-700 dark:text-sky-400",
    },
    {
      icon: Pill,
      label: t("medicine.order"),
      description: "100+ medicines available",
      href: "/dashboard/medicines",
      color: "bg-emerald-500",
      bg: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30",
      textColor: "text-emerald-700 dark:text-emerald-400",
    },
    {
      icon: Pill,
      label: t("nav.med_reminders"),
      description: "Never miss a dose",
      href: "/dashboard/health-profile",
      color: "bg-amber-500",
      bg: "bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20 dark:hover:bg-amber-900/30",
      textColor: "text-amber-700 dark:text-amber-400",
    },
    {
      icon: ClipboardList,
      label: t("nav.health_records"),
      description: `${counts.records} documents`,
      href: "/dashboard/records",
      color: "bg-cyan-500",
      bg: "bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-900/20 dark:hover:bg-cyan-900/30",
      textColor: "text-cyan-700 dark:text-cyan-400",
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("overview.welcome")}, {user.name.split(" ")[0]}! 👋</h2>
            <p className="mt-1 text-sky-100">How are you feeling today?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.patient?.bloodGroup && (
                <Badge className="bg-white/20 text-white border-0">
                  <Heart className="mr-1 h-3 w-3" />
                  Blood: {user.patient.bloodGroup}
                </Badge>
              )}
              {(user.patient?.allergies?.length ?? 0) > 0 && (
                <Badge className="bg-white/20 text-white border-0">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {user.patient?.allergies?.length ?? 0} Allerg{(user.patient?.allergies?.length ?? 0) === 1 ? "y" : "ies"}
                </Badge>
              )}
            </div>
          </div>
          <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
            <Activity className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500">
          <Phone className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">{t("overview.emergency")}</p>
          <p className="text-xs text-red-600 dark:text-red-400">Call 108 (Ambulance) or 112 (Emergency) immediately</p>
        </div>
        <Link href="/dashboard/ambulance">
          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white shrink-0">
            Book Now
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("overview.quick_actions")}</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className={`group rounded-2xl border border-transparent p-4 transition-all cursor-pointer ${action.bg}`}>
                <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <p className={`text-sm font-semibold ${action.textColor}`}>{action.label}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Health Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("overview.health_profile")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Blood Group</span>
                <span className="font-semibold dark:text-white">{user.patient?.bloodGroup ?? "Not set"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Allergies</span>
                <span className="font-semibold dark:text-white">{user.patient?.allergies?.length ?? 0} recorded</span>
              </div>
            </div>
            <Link href="/dashboard/health-profile">
              <Button variant="ghost" size="sm" className="mt-3 w-full text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900/20">
                View Full Profile <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("overview.ai_consultations")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{counts.consultations}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total sessions</p>
            <Link href="/dashboard/ai-doctor">
              <Button variant="ghost" size="sm" className="mt-3 w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                Start Consultation <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("overview.health_records")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{counts.records}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Documents stored</p>
            <Link href="/dashboard/records">
              <Button variant="ghost" size="sm" className="mt-3 w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                View Records <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("overview.appointments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{counts.appointments}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Doctor visits</p>
            <Link href="/dashboard/doctors">
              <Button variant="ghost" size="sm" className="mt-3 w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                Book Appointment <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
