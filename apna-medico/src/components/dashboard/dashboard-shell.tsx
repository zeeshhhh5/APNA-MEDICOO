"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { DashboardUser } from "@/types/dashboard";
import {
  Menu, HeartPulse, Brain, Ambulance, Hospital, Pill,
  ShieldCheck, LayoutDashboard, Package,
  Bed, Users, Activity, Bell, Settings, Truck, ClipboardList,
  BarChart3, UserCheck, AlertTriangle, Navigation, Store, ChevronRight,
  Stethoscope, User, Globe,
} from "lucide-react";
import EmergencySOS from "@/components/dashboard/emergency-sos";
import { useLanguage } from "@/contexts/language-context";
import { LANGUAGE_OPTIONS } from "@/lib/i18n";

// i18n key for each nav label — falls back to the label itself if no translation
const NAV_I18N: Record<string, string> = {
  "Overview": "nav.overview",
  "Health Tracker": "nav.health_tracker",
  "Med Reminders": "nav.med_reminders",
  "AI Doctor": "nav.ai_doctor",
  "Consult Doctor": "nav.consult_doctor",
  "Book Ambulance": "nav.book_ambulance",
  "Find Hospitals": "nav.find_hospitals",
  "Medicine Delivery": "nav.medicine_delivery",
  "Health Records": "nav.health_records",
  "Notifications": "nav.notifications",
  "Health Profile": "nav.health_profile",
  "Settings": "nav.settings",
};

const navConfig: Record<string, { label: string; icon: React.ElementType; href: string; badge?: string }[]> = {
  PATIENT: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Health Tracker", icon: Activity, href: "/dashboard/health-tracker" },
    { label: "Med Reminders", icon: Pill, href: "/dashboard/health-profile" },
    { label: "AI Doctor", icon: Brain, href: "/dashboard/ai-doctor" },
    { label: "Appointment Doctor", icon: Stethoscope, href: "/dashboard/doctors" },
    { label: "Book Ambulance", icon: Ambulance, href: "/dashboard/ambulance" },
    { label: "Find Hospitals", icon: Hospital, href: "/dashboard/hospitals" },
    { label: "Medicine Delivery", icon: Pill, href: "/dashboard/medicines" },
    { label: "Health Records", icon: ClipboardList, href: "/dashboard/records" },
    { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  ],
  HOSPITAL_STAFF: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Bed Management", icon: Bed, href: "/dashboard/beds" },
    { label: "Staff Directory", icon: Users, href: "/dashboard/staff" },
    { label: "Patient Admissions", icon: UserCheck, href: "/dashboard/admissions" },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  ],
  AMBULANCE_DRIVER: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Active Requests", icon: AlertTriangle, href: "/dashboard/requests", badge: "Live" },
    { label: "Navigation", icon: Navigation, href: "/dashboard/navigation" },
    { label: "Trip History", icon: ClipboardList, href: "/dashboard/trips" },
    { label: "Earnings", icon: Activity, href: "/dashboard/earnings" },
    { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  ],
  MEDICAL_STORE: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Orders", icon: Package, href: "/dashboard/orders", badge: "Live" },
    { label: "Inventory", icon: Store, href: "/dashboard/inventory" },
    { label: "Deliveries", icon: Truck, href: "/dashboard/deliveries" },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  ],
  ADMIN: [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Users", icon: Users, href: "/dashboard/users" },
    { label: "Hospitals", icon: Hospital, href: "/dashboard/hospitals" },
    { label: "Drivers", icon: Ambulance, href: "/dashboard/drivers" },
    { label: "Stores", icon: Store, href: "/dashboard/stores" },
    { label: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { label: "Audit Logs", icon: ClipboardList, href: "/dashboard/audit" },
  ],
};

const roleColors: Record<string, string> = {
  PATIENT: "bg-sky-500",
  HOSPITAL_STAFF: "bg-emerald-500",
  AMBULANCE_DRIVER: "bg-red-500",
  MEDICAL_STORE: "bg-amber-500",
  ADMIN: "bg-purple-500",
};

const roleIcons: Record<string, React.ElementType> = {
  PATIENT: HeartPulse,
  HOSPITAL_STAFF: Hospital,
  AMBULANCE_DRIVER: Ambulance,
  MEDICAL_STORE: Pill,
  ADMIN: ShieldCheck,
};

const Sidebar = ({ user, roleColor, RoleIcon, subtitle, navItems, pathname, setSidebarOpen, tFn }: {
  user: DashboardUser;
  roleColor: string;
  RoleIcon: React.ElementType;
  subtitle: string;
  navItems: { label: string; icon: React.ElementType; href: string; badge?: string }[];
  pathname: string;
  setSidebarOpen: (open: boolean) => void;
  tFn: (key: string) => string;
}) => (
  <div className="flex h-full flex-col bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800">
    {/* Logo */}
    <div className="flex h-16 items-center gap-3 px-6 border-b border-gray-100 dark:border-gray-800">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${roleColor}`}>
        <RoleIcon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900 dark:text-white">Apna Medico</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
      </div>
    </div>

    {/* Nav */}
    <ScrollArea className="flex-1 px-3 py-4">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? `${roleColor} text-white shadow-sm`
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{NAV_I18N[item.label] ? tFn(NAV_I18N[item.label]) : item.label}</span>
              {item.badge && (
                <Badge className={`text-xs px-1.5 py-0 ${isActive ? "bg-white/20 text-white border-0" : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0"}`}>
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <Separator className="my-4" />

      <nav className="space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </nav>
    </ScrollArea>

    {/* User */}
    <div className="border-t border-gray-100 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3">
        <UserButton afterSignOutUrl="/" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
        </div>
      </div>
    </div>
  </div>
);

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGE_OPTIONS.find((l) => l.value === language);
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        onClick={() => setOpen(!open)}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current?.nativeLabel ?? "English"}</span>
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg py-1">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setLanguage(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between ${
                language === opt.value ? "text-sky-600 dark:text-sky-400 font-medium bg-sky-50 dark:bg-sky-900/30" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <span>{opt.nativeLabel}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardShell({ children, user }: { children: React.ReactNode; user: DashboardUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const navItems = navConfig[user.role] ?? navConfig.PATIENT;
  const RoleIcon = roleIcons[user.role] ?? HeartPulse;
  const roleColor = roleColors[user.role] ?? "bg-sky-500";

  const subtitle =
    user.role === "HOSPITAL_STAFF" && user.hospitalStaff
      ? user.hospitalStaff.hospital.name
      : user.role === "MEDICAL_STORE" && user.medicalStore
      ? user.medicalStore.storeName
      : user.role.replace("_", " ");

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 md:block">
        <Sidebar 
          user={user}
          roleColor={roleColor}
          RoleIcon={RoleIcon}
          subtitle={subtitle}
          navItems={navItems}
          pathname={pathname}
          setSidebarOpen={setSidebarOpen}
          tFn={t}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 shadow-xl">
            <Sidebar 
              user={user}
              roleColor={roleColor}
              RoleIcon={RoleIcon}
              subtitle={subtitle}
              navItems={navItems}
              pathname={pathname}
              setSidebarOpen={setSidebarOpen}
              tFn={t}
            />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center gap-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">
              {(() => { const item = navItems.find((n) => n.href === pathname); return item ? (NAV_I18N[item.label] ? t(NAV_I18N[item.label]) : item.label) : t("nav.overview"); })()}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <Badge className={`${roleColor} text-white border-0 text-xs`}>
              {user.role.replace(/_/g, " ")}
            </Badge>
            <div className="hidden md:block">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Emergency SOS Button - visible for patients */}
      {user.role === "PATIENT" && <EmergencySOS />}
    </div>
  );
}
