"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Ambulance,
  Hospital,
  Pill,
  ShieldCheck,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Menu,
  X,
  Activity,
  Users,
  TrendingUp,
  Zap,
  HeartPulse,
  Phone,
} from "lucide-react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Apna <span className="text-sky-500">Medico</span>
              </span>
            </div>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-gray-600 hover:text-sky-500 transition-colors">Features</a>
              <a href="#roles" className="text-sm text-gray-600 hover:text-sky-500 transition-colors">Who It&apos;s For</a>
              <a href="#how-it-works" className="text-sm text-gray-600 hover:text-sky-500 transition-colors">How It Works</a>
              <a href="#stats" className="text-sm text-gray-600 hover:text-sky-500 transition-colors">Impact</a>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">
                    Get Started
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white">Dashboard</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>

            <button
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-sm text-gray-600">Features</a>
              <a href="#roles" className="text-sm text-gray-600">Who It&apos;s For</a>
              <a href="#how-it-works" className="text-sm text-gray-600">How It Works</a>
              <div className="flex gap-2 pt-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button variant="outline" size="sm" className="flex-1">Sign In</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm" className="flex-1 bg-sky-500 hover:bg-sky-600 text-white">Get Started</Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="flex-1">
                    <Button size="sm" className="w-full bg-sky-500 hover:bg-sky-600 text-white">Dashboard</Button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-sky-50 opacity-60 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-emerald-50 opacity-40 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-sky-50 text-sky-600 border-sky-200 hover:bg-sky-100">
                <Zap className="mr-1 h-3 w-3" />
                AI-Powered Healthcare Platform
              </Badge>
              <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 lg:text-6xl">
                Your Health,{" "}
                <span className="text-sky-500">Our Priority</span>
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                India&apos;s first AI-powered healthcare platform connecting patients, hospitals, ambulances, and medical stores in real-time. Get instant AI doctor consultations, emergency ambulance booking, and medicine delivery — all in one place.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-white px-8">
                      Start Free Today <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-sky-500 hover:bg-sky-600 text-white px-8">
                      Go to Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </SignedIn>
                <a href="#how-it-works">
                  <Button size="lg" variant="outline" className="border-gray-200 px-8">
                    See How It Works
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-sm font-medium text-gray-700">4.9/5</span>
                </div>
                <span className="text-sm text-gray-500">Trusted by 50,000+ users</span>
                <div className="flex items-center gap-1 text-sm text-red-500 font-medium">
                  <Phone className="h-4 w-4" />
                  Emergency: 108
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl bg-gradient-to-br from-sky-500 to-sky-600 p-8 shadow-2xl">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Dr. Aryan AI</p>
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <p className="text-xs text-sky-200">Online now</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl rounded-tl-sm bg-white/20 px-4 py-3">
                    <p className="text-sm text-white">Hello! I&apos;m Dr. Aryan, your AI health assistant. What symptoms are you experiencing today?</p>
                  </div>
                  <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-white px-4 py-3">
                    <p className="text-sm text-gray-700">I have fever and severe headache since 2 days</p>
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white/20 px-4 py-3">
                    <p className="text-sm text-white">I&apos;ll help you with that. Do you have any allergies? Also, is your fever above 103°F?</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="flex-1 rounded-xl bg-white/10 px-3 py-2 text-xs text-sky-200">Type your symptoms...</div>
                  <button className="rounded-xl bg-white px-3 py-2">
                    <ChevronRight className="h-4 w-4 text-sky-500" />
                  </button>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -left-6 top-8 rounded-2xl bg-white p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                    <Ambulance className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Ambulance</p>
                    <p className="text-xs text-green-500">3 nearby</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 bottom-16 rounded-2xl bg-white p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <Hospital className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">Apollo Hospital</p>
                    <p className="text-xs text-sky-500">12 ICU beds free</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Users, label: "Active Users", value: "50,000+", color: "text-sky-500" },
              { icon: Ambulance, label: "Ambulances Booked", value: "12,000+", color: "text-red-500" },
              { icon: Brain, label: "AI Consultations", value: "1,00,000+", color: "text-purple-500" },
              { icon: TrendingUp, label: "Cities Covered", value: "250+", color: "text-emerald-500" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <Icon className={`mx-auto mb-3 h-8 w-8 ${color}`} />
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-sky-50 text-sky-600 border-sky-200">Platform Features</Badge>
            <h2 className="text-4xl font-bold text-gray-900">Everything You Need in a Medical Emergency</h2>
            <p className="mt-4 text-lg text-gray-600">Comprehensive healthcare tools powered by AI and real-time data</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full border-gray-100 hover:border-sky-200 hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${f.bgColor}`}>
                      <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-600">{f.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-sky-50 text-sky-600 border-sky-200">Role-Based Platform</Badge>
            <h2 className="text-4xl font-bold text-gray-900">Built for Every Healthcare Stakeholder</h2>
            <p className="mt-4 text-lg text-gray-600">Tailored dashboards and tools for each role in the healthcare ecosystem</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`rounded-3xl p-6 ${role.bg}`}
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${role.iconBg}`}>
                  <role.icon className={`h-6 w-6 ${role.iconColor}`} />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{role.title}</h3>
                <p className="mb-4 text-sm text-gray-600">{role.description}</p>
                <ul className="space-y-1">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <div className={`h-1.5 w-1.5 rounded-full ${role.dotColor}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-sky-50 text-sky-600 border-sky-200">Simple Process</Badge>
            <h2 className="text-4xl font-bold text-gray-900">How Apna Medico Works</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="absolute left-1/2 top-6 hidden h-px w-full bg-sky-100 md:block" />
                )}
                <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white font-bold text-lg z-10">
                  {i + 1}
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-sky-500 to-sky-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Ready to Transform Healthcare?</h2>
          <p className="mb-8 text-lg text-sky-100">
            Join 50,000+ users who trust Apna Medico for their healthcare needs.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 px-8 font-semibold">
                  Get Started Free <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-sky-600 hover:bg-sky-50 px-8 font-semibold">
                  Open Dashboard <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </SignedIn>
            <div className="flex items-center gap-2 text-sky-100">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm">Free forever for patients</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500">
                <HeartPulse className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">Apna Medico</span>
            </div>
            <p className="text-sm text-gray-500 text-center">
              © 2024 Apna Medico. Made with ❤️ for India. Emergency: <span className="font-semibold text-red-500">108 / 112</span>
            </p>
            <p className="text-xs text-gray-400 text-center max-w-sm">
              AI consultations are for guidance only. Always consult a licensed doctor for medical decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Brain,
    title: "AI Doctor Consultation",
    description: "Chat or video call with Dr. Aryan AI, trained on comprehensive medical data. Get symptom analysis, diagnosis guidance, and medicine recommendations.",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  {
    icon: Ambulance,
    title: "Emergency Ambulance",
    description: "One-tap ambulance booking with real-time GPS tracking. Nearest available driver gets notified instantly with turn-by-turn navigation.",
    bgColor: "bg-red-50",
    iconColor: "text-red-500",
  },
  {
    icon: Hospital,
    title: "Hospital Locator",
    description: "Find nearby hospitals with live bed availability data — emergency beds, ICU beds, and specialist availability updated in real-time.",
    bgColor: "bg-sky-50",
    iconColor: "text-sky-500",
  },
  {
    icon: Pill,
    title: "Medicine Delivery",
    description: "Emergency medicines delivered in 10-15 minutes. Standard orders in 2 working days. Nearest medical store auto-assigned.",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    icon: Activity,
    title: "Health Records",
    description: "Complete digital health history — consultations, prescriptions, lab reports, and allergy records stored securely and accessible anytime.",
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  {
    icon: MapPin,
    title: "Location Intelligence",
    description: "GPS-powered distance sorting for hospitals, ambulances, and medical stores. Real-time routing for drivers and delivery personnel.",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-500",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Live notifications for booking status, bed availability changes, order updates, and emergency alerts via WebSocket connections.",
    bgColor: "bg-pink-50",
    iconColor: "text-pink-500",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Compliant",
    description: "End-to-end encrypted health data, role-based access control, and medical data handled with strict privacy standards.",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-500",
  },
  {
    icon: Users,
    title: "Multi-Role Platform",
    description: "Separate dashboards for patients, hospital staff, ambulance drivers, medical stores, and administrators — each purpose-built.",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-500",
  },
];

const roles = [
  {
    icon: HeartPulse,
    title: "Patient",
    description: "Complete healthcare at your fingertips",
    bg: "bg-sky-50",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-500",
    dotColor: "bg-sky-400",
    features: ["AI Doctor Chat & Video Call", "One-tap Ambulance Booking", "Hospital Bed Availability", "Emergency Medicine Delivery", "Health Records & Reports"],
  },
  {
    icon: Hospital,
    title: "Hospital Staff",
    description: "Manage your hospital in real-time",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
    dotColor: "bg-emerald-400",
    features: ["Live Bed Availability Updates", "Staff & Doctor Management", "Emergency Alerts Dashboard", "Patient Admission Tracking", "Analytics & Reports"],
  },
  {
    icon: Ambulance,
    title: "Ambulance Driver",
    description: "Respond faster, save more lives",
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    dotColor: "bg-red-400",
    features: ["Emergency Request Alerts", "GPS Navigation to Patient", "Trip Management & History", "Online/Offline Toggle", "Earnings Dashboard"],
  },
  {
    icon: Pill,
    title: "Medical Store",
    description: "Serve your community better",
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-500",
    dotColor: "bg-amber-400",
    features: ["Emergency Order Alerts", "Inventory Management", "Delivery Routing", "Order History & Analytics", "Store Profile Management"],
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    description: "Full platform oversight and control",
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    dotColor: "bg-purple-400",
    features: ["Platform Analytics Dashboard", "User Verification & Management", "Hospital & Store Approval", "Audit Logs", "System Health Monitoring"],
  },
];

const steps = [
  { title: "Sign Up & Choose Role", description: "Create your account and select your role — patient, hospital staff, driver, or medical store." },
  { title: "Complete Profile", description: "Add your details including medical history, location, and preferences for personalized service." },
  { title: "Access Dashboard", description: "Get your role-specific dashboard with all tools and real-time data relevant to you." },
  { title: "Connect & Heal", description: "Book ambulances, consult AI doctors, manage beds, or deliver medicines — everything in one app." },
];
