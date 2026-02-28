# APNA MEDICO — Full-Stack Healthcare Platform
## Complete Professional Development Prompt & Blueprint

> **Author Role:** Senior Full-Stack Developer (10+ years) & AI/ML Engineer
> **Project Type:** Production-Grade Healthcare SaaS Platform
> **Date:** February 2026

---

## TABLE OF CONTENTS

1. Project Overview
2. Tech Stack
3. API Keys & Third-Party Services
4. Authentication & Role System
5. Landing Page & Public Pages
6. Role 1 — Patient Dashboard
7. Role 2 — Hospital Staff Dashboard
8. Role 3 — Ambulance Driver Dashboard
9. Role 4 — Local Medical Store Dashboard
10. Role 5 — Admin Dashboard
11. Database Schema Design
12. Real-Time Architecture
13. AI/ML Architecture
14. Security & Compliance
15. Senior Developer Recommendations
16. Development Phases
17. Folder Structure

---

## 1. PROJECT OVERVIEW

**Apna Medico** is a full-stack healthcare platform connecting Patients, Hospitals, Ambulance Drivers, Local Medical Stores, and an Admin under one unified ecosystem.

**Core Features:**
- AI-powered health consultation (chat + video call with AI Doctor)
- Real-time ambulance booking & GPS tracking
- Hospital bed availability & locator with maps
- Emergency & standard medicine delivery
- Role-based dashboards with real-time data sync
- Complete admin control panel

**Core Value Proposition:** Reduce emergency response time to under 10 minutes by connecting patients with the nearest available ambulance, hospital, and pharmacy in real-time.

---

## 2. TECH STACK

### Frontend
- **Next.js 14+ (App Router)** — React framework with SSR/SSG, API routes, middleware
- **TypeScript** — Type safety across the entire codebase
- **Tailwind CSS** — Utility-first CSS framework
- **shadcn/ui** — Accessible, customizable component library
- **Framer Motion** — Smooth animations and transitions
- **Lucide React** — Consistent icon library
- **React Hook Form + Zod** — Form handling with schema validation
- **Zustand** — Lightweight global state management
- **TanStack Query (React Query)** — Server state, caching, real-time data fetching

### Backend
- **Next.js API Routes + Route Handlers** — REST API endpoints
- **Prisma ORM** — Type-safe database access layer
- **PostgreSQL (Neon/Supabase)** — Primary relational database
- **Redis (Upstash)** — Caching, rate limiting, real-time pub/sub
- **Socket.IO / Pusher** — Real-time WebSocket communication

### Authentication
- **Clerk** — Authentication, session management, role-based access (RBAC)

### AI/ML Services
- **OpenAI GPT-4o API** — AI Health Chatbot (text-based consultation)
- **OpenAI Realtime API / GPT-4o with audio** — AI Doctor Video/Voice Call
- **OpenAI Whisper API** — Speech-to-text for voice input
- **OpenAI TTS API** — Text-to-speech for AI Doctor voice responses
- **LangChain.js** — AI chain orchestration, medical RAG pipeline
- **Pinecone** — Vector database for medical knowledge retrieval

### Maps & Location
- **Google Maps Platform API** — Maps display, directions, distance matrix
- **Google Places API** — Hospital/pharmacy location search
- **Google Geocoding API** — Address to coordinates conversion
- **Browser Geolocation API** — Real-time user location

### Media & Communication
- **LiveKit / Daily.co** — WebRTC video/audio calls for AI Doctor

### Payments (Future)
- **Razorpay / Stripe** — Payment processing for medicine orders

### File Storage
- **Uploadthing / AWS S3** — Medical reports, prescriptions, profile images

### Deployment
- **Vercel** — Frontend + API deployment
- **Neon / Supabase** — Managed PostgreSQL
- **Upstash** — Managed Redis

---

## 3. API KEYS & THIRD-PARTY SERVICES REQUIRED

### MUST-HAVE API Keys

| # | Service | Env Variables | Purpose | Cost |
|---|---------|--------------|---------|------|
| 1 | **Clerk** | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Auth & RBAC | Free tier |
| 2 | **OpenAI** | `OPENAI_API_KEY` | GPT-4o, Whisper, TTS, Realtime API | Pay-per-use |
| 3 | **Google Maps** | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Maps, Directions, Places, Geocoding, Distance Matrix | $200/mo free |
| 4 | **Neon DB** | `DATABASE_URL` | PostgreSQL connection | Free tier |
| 5 | **Upstash** | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Caching, rate limiting | Free tier |
| 6 | **Pinecone** | `PINECONE_API_KEY` | Vector DB for medical RAG | Free tier |
| 7 | **Uploadthing** | `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID` | File uploads | Free tier |

### OPTIONAL API Keys

| # | Service | Env Variables | Purpose |
|---|---------|--------------|---------|
| 8 | **LiveKit** | `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `NEXT_PUBLIC_LIVEKIT_URL` | Video/audio calls |
| 9 | **Pusher** | `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET` | Real-time WebSocket |
| 10 | **Razorpay** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Payments |
| 11 | **Twilio** | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` | SMS alerts |
| 12 | **Resend** | `RESEND_API_KEY` | Email notifications |

### .env.local Template

```env
# ─── CLERK AUTH ───
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ─── DATABASE ───
DATABASE_URL=postgresql://user:pass@host:5432/apna_medico

# ─── REDIS ───
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# ─── OPENAI ───
OPENAI_API_KEY=sk-xxxxx

# ─── GOOGLE MAPS ───
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaxxxxx

# ─── PINECONE ───
PINECONE_API_KEY=xxxxx
PINECONE_INDEX_NAME=apna-medico-medical-kb

# ─── LIVEKIT ───
LIVEKIT_API_KEY=xxxxx
LIVEKIT_API_SECRET=xxxxx
NEXT_PUBLIC_LIVEKIT_URL=wss://xxxxx.livekit.cloud

# ─── FILE UPLOAD ───
UPLOADTHING_SECRET=sk_live_xxxxx
UPLOADTHING_APP_ID=xxxxx

# ─── PAYMENTS (optional) ───
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# ─── NOTIFICATIONS (optional) ───
RESEND_API_KEY=re_xxxxx
```

---

## 4. AUTHENTICATION & ROLE SYSTEM

### 4.1 Complete Auth Flow

```
Landing Page (Public)
  |
  +-- Click "Get Started" or "Login"
  |
  v
+-------------------------------+
|     SINGLE LOGIN MODAL        |
|      (Clerk Auth Modal)       |
|                               |
|  Sign In / Sign Up            |
|  (Email, Google, GitHub)      |
|                               |
|  After auth -> Role Select:   |
|                               |
|  [ Patient             ]      |
|  [ Hospital Staff       ]      |
|  [ Local Medical Store  ]      |
|  [ Ambulance Driver     ]      |
|  [ Admin (invite-only)  ]      |
|                               |
|  [ Skip for Now -> Guest ]    |
+-------------------------------+
  |
  v
Role-Specific Dashboard
```

### 4.2 Clerk Implementation

**Single sign-in modal** using Clerk `<SignIn />` and `<SignUp />` components. After auth, redirect to `/onboarding`.

On `/onboarding`, user selects role. Role stored in Clerk's `publicMetadata`:

```ts
// API route: POST /api/set-role
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId, role } = await req.json();
  await clerkClient.users.updateUser(userId, {
    publicMetadata: {
      role: role // "patient" | "hospital_staff" | "medical_store" | "ambulance_driver" | "admin"
    }
  });
  return Response.json({ success: true });
}
```

**Skip** sets role to `"guest"` — limited access (browse hospitals/pharmacies on map only).

**Admin** is invite-only — set manually via Clerk dashboard or seed script. Hidden from public role selection.

### 4.3 Role-Based Routing

Middleware redirects to correct dashboard based on role:

| Role | Dashboard Route |
|------|----------------|
| Patient | `/dashboard/patient` |
| Hospital Staff | `/dashboard/hospital` |
| Ambulance Driver | `/dashboard/ambulance` |
| Local Medical Store | `/dashboard/medical` |
| Admin | `/dashboard/admin` |
| Guest | `/explore` (limited) |

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId, sessionClaims } = auth();
    if (!userId) return auth().redirectToSignIn();

    const role = sessionClaims?.metadata?.role;
    if (!role) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    // Prevent accessing other role dashboards
    const path = req.nextUrl.pathname;
    const roleRouteMap: Record<string, string> = {
      patient: "/dashboard/patient",
      hospital_staff: "/dashboard/hospital",
      ambulance_driver: "/dashboard/ambulance",
      medical_store: "/dashboard/medical",
      admin: "/dashboard/admin",
    };

    const allowedPath = roleRouteMap[role];
    if (allowedPath && !path.startsWith(allowedPath) && role !== "admin") {
      return NextResponse.redirect(new URL(allowedPath, req.url));
    }
  }
});
```

---

## 5. LANDING PAGE & PUBLIC PAGES

### 5.1 Landing Page (`/`)

**Navbar:** Logo (left), Nav links (Features, How it Works, About), Login/Sign Up CTA (right). Sticky, transparent on hero, white on scroll.

**Hero Section:**
- Headline: "Your Health, Our Priority — Anytime, Anywhere"
- Subtext: "AI Doctor consultations, emergency ambulance booking, hospital finder, and medicine delivery — all in one platform."
- Two CTAs: "Get Started Free" (primary) + "Watch Demo" (secondary/outline)
- Right side: Animated illustration or Lottie of healthcare ecosystem
- Background: Subtle gradient with floating medical icons

**Stats Bar (animated counters on scroll):**
- 500+ Hospitals Connected
- 1000+ Ambulances Available
- 10K+ Patients Served
- 24/7 AI Doctor Available

**Features Grid (4 cards with icons + hover animation):**
- AI Doctor — Chat or video call with our AI physician anytime
- Ambulance Booking — Find and book nearest ambulance in seconds
- Hospital Finder — Real-time bed availability and distance info
- Medicine Delivery — Emergency (15 min) or standard (2-day) delivery

**How It Works (4-step horizontal visual):**
1. Sign Up & Select Your Role
2. Access Your Personalized Dashboard
3. Use AI Doctor, Book Ambulance, or Order Medicine
4. Get Help Instantly — We Connect You to the Nearest Provider

**Testimonials:** Carousel/slider with patient and hospital reviews (avatar, name, role, quote, rating stars).

**CTA Banner:** "Join Apna Medico Today — Healthcare at Your Fingertips" + Sign Up button.

**Footer:** Logo, links (About, Privacy, Terms, Contact), social media icons, "Made with care for India" tagline, copyright.

### 5.2 Additional Public Pages

- `/about` — Mission, team, story
- `/contact` — Contact form (name, email, message) + office address + map
- `/privacy` — Privacy policy
- `/terms` — Terms of service

---

## 6. ROLE 1 — PATIENT DASHBOARD

**Route:** `/dashboard/patient`

### 6.1 Dashboard Layout

```
+------------------------------------------------------+
| Top Bar: Logo | Search | Notifications | Profile     |
+------------------------------------------------------+
| Sidebar            |  Main Content Area               |
| ──────────         |                                   |
| Home/Overview      |  [Dynamic Content Based           |
| AI Doctor          |   on Sidebar Selection]           |
| Book Ambulance     |                                   |
| Find Hospital      |                                   |
| Order Medicine     |                                   |
| My Records         |                                   |
| Notifications      |                                   |
| Settings           |                                   |
| Profile            |                                   |
+------------------------------------------------------+
```

### 6.2 Home/Overview Page

- **Welcome card** with patient name, last consultation summary
- **Quick action buttons:** Talk to AI Doctor, Book Ambulance, Find Hospital, Order Medicine
- **Health summary:** Known allergies, blood group, recent conditions
- **Recent activity:** Last 5 consultations, orders, bookings
- **Emergency banner:** One-tap SOS button (always visible) that triggers ambulance booking

### 6.3 Feature A — AI Health Doctor (Chat + Video Call)

**This is the flagship feature. Route: `/dashboard/patient/ai-doctor`**

Two modes: **Chat Consultation** and **Video Call**. Tab-based UI to switch.

#### A1. AI Chat Consultation

**System Prompt for Medical AI (GPT-4o):**

```
You are Dr. Medico, an experienced general physician AI assistant for the
Apna Medico healthcare platform. You have deep knowledge across all medical
specialties including general medicine, cardiology, neurology, orthopedics,
dermatology, pediatrics, gynecology, psychiatry, emergency medicine, and
pharmacology.

BEHAVIOR RULES:
1. Ask ONE question at a time, exactly like a real doctor in a clinic visit.
2. Start by greeting the patient by name and asking "What brings you in today?"
3. Follow up with targeted diagnostic questions based on symptoms:
   - Duration of symptoms ("How long have you been experiencing this?")
   - Severity on 1-10 scale ("On a scale of 1-10, how severe is the pain?")
   - Location of pain/discomfort ("Can you point to where it hurts?")
   - Triggers or relieving factors ("Does anything make it better or worse?")
   - Associated symptoms ("Any fever, nausea, dizziness along with this?")
   - Medical history ("Do you have any pre-existing conditions?")
   - Current medications ("Are you taking any medicines currently?")
   - Known allergies (CRITICAL — always ask early)
   - Lifestyle factors (smoking, alcohol, diet, exercise)
   - Family history if relevant

4. After gathering sufficient information (typically 4-8 questions), provide:
   a) Preliminary assessment with reasoning
   b) Most likely diagnosis (with confidence level)
   c) Differential diagnoses (other possibilities)
   d) Recommended medicines:
      - Generic name and brand name
      - Dosage and frequency
      - Duration of course
      - Important side effects to watch for
      - CROSS-CHECK against patient's known allergies before recommending
   e) Whether emergency care is needed
   f) Lifestyle/home remedy suggestions

5. EMERGENCY DETECTION — If symptoms indicate life-threatening emergency:
   (chest pain, stroke signs like face drooping/arm weakness/speech difficulty,
   severe breathing difficulty, heavy bleeding, loss of consciousness,
   severe allergic reaction, suspected heart attack)
   IMMEDIATELY:
   - Alert with "EMERGENCY DETECTED" flag
   - Trigger ambulance booking suggestion
   - Provide first-aid instructions while waiting
   - Tell patient to call 108/112 as backup

6. Generate a structured JSON Patient Report after consultation.

7. Always include disclaimer: "This is AI-assisted guidance, not a replacement
   for professional medical advice. Please consult a licensed physician for
   definitive diagnosis and treatment."

8. Be empathetic, patient, professional. Use simple language. Avoid medical
   jargon unless explaining it.

9. If patient describes symptoms that match a pattern of drug interaction with
   their current medications, WARN immediately.

10. Store and reference ALL previous consultation data for this patient to
    maintain continuity of care.

PATIENT CONTEXT (injected per session):
- Name: {patient_name}
- Age: {age}
- Gender: {gender}
- Blood Group: {blood_group}
- Known Allergies: {allergies_list}
- Current Medications: {current_medications}
- Medical History: {medical_history}
- Previous Consultations Summary: {past_consultations}

OUTPUT FORMAT for Patient Report (generated at end of consultation):
{
  "patient_name": "",
  "consultation_date": "",
  "consultation_id": "",
  "symptoms_reported": [],
  "duration": "",
  "severity": "",
  "vital_signs_reported": {},
  "known_allergies": [],
  "current_medications": [],
  "examination_findings": "",
  "preliminary_diagnosis": "",
  "differential_diagnoses": [],
  "recommended_medicines": [
    {
      "generic_name": "",
      "brand_name": "",
      "dosage": "",
      "frequency": "",
      "duration": "",
      "route": "",
      "special_instructions": ""
    }
  ],
  "emergency_level": "none | low | medium | high | critical",
  "lifestyle_recommendations": [],
  "follow_up_date": "",
  "referral_specialist": "",
  "red_flags_to_watch": [],
  "disclaimer": "AI-assisted consultation. Consult a licensed physician."
}
```

**Chat UI Technical Implementation:**

- Real-time streaming responses using OpenAI streaming API (`stream: true`)
- Markdown rendering for formatted responses (bold symptoms, bullet lists)
- Message bubbles: Patient (right, blue), AI Doctor (left, white with doctor avatar)
- Typing indicator while AI is generating
- "End Consultation" button generates final report
- Report downloadable as PDF
- All conversations persisted to database per patient

**RAG Pipeline (LangChain.js + Pinecone) for Medical Knowledge:**

```
Patient message
  |
  v
Embed query using OpenAI text-embedding-3-small
  |
  v
Search Pinecone index for top 5 relevant medical knowledge chunks
  |
  v
Combine: System Prompt + Retrieved Medical Context + Patient History + Conversation History
  |
  v
Send to GPT-4o with streaming enabled
  |
  v
Stream response tokens to frontend in real-time
  |
  v
If emergency_level >= "high" -> trigger emergency UI flow
```

#### A2. AI Doctor Video Call (`/dashboard/patient/ai-doctor/video`)

**Two implementation options:**

**Option 1 — OpenAI Realtime API (Recommended):**
- Native speech-to-speech with GPT-4o multimodal
- Sub-second latency voice conversation
- Same medical system prompt as chat mode
- Patient speaks naturally, AI Doctor responds with natural voice
- Audio stream via LiveKit WebRTC transport

**Option 2 — Pipeline Approach (Fallback):**
- Patient speaks -> Whisper API (speech-to-text)
- Text -> GPT-4o (medical reasoning)
- Response text -> OpenAI TTS API (text-to-speech with "nova" or "alloy" voice)
- Audio streamed back to patient via WebRTC

**Video Call UI:**
- AI Doctor: Animated avatar or high-quality looping video of a doctor
- Lip-sync with TTS output (optional enhancement)
- Patient camera feed in picture-in-picture corner
- Controls: Mute mic, Toggle camera, End call, Switch to chat
- Real-time transcript panel on the side (accessibility)
- Same report generation at end of call

**LiveKit Integration Architecture:**
```
Patient Browser <--WebRTC--> LiveKit Server <---> AI Processing Server
   (mic/camera)                (relay)           (OpenAI Realtime API)
```

### 6.4 Feature B — Quick Nearby Ambulance Booking

**Route:** `/dashboard/patient/ambulance`

**UI Components:**
- Full-width Google Map centered on patient's live GPS location
- Ambulance markers (animated) showing nearby available ambulances
- Sort dropdown: Nearest First (default), Highest Rated
- List of ambulance cards below/beside map

**Each Ambulance Card Shows:**
- Driver name and photo
- Vehicle type (Basic / Advanced Life Support)
- Vehicle number
- Distance from patient (km)
- Estimated arrival time (ETA via Distance Matrix API)
- Driver rating (stars)
- "Book Now" button (red, prominent)

**Booking Flow:**
1. Patient taps "Book Now" on nearest ambulance
2. Confirmation modal: "Confirm emergency ambulance booking?"
3. System creates booking record with status `REQUESTED`
4. Real-time alert sent to driver via WebSocket
5. Driver accepts -> Status changes to `ACCEPTED`
6. Patient sees live tracking on map (driver GPS every 5 seconds)
7. Status progression: `REQUESTED -> ACCEPTED -> EN_ROUTE -> ARRIVED -> PATIENT_PICKED -> EN_ROUTE_HOSPITAL -> COMPLETED`
8. Each status change triggers push notification to patient

**Auto-Dispatch Logic:**
- Find 3 nearest available drivers within 10km radius
- Send alert to nearest driver first
- If not accepted within 30 seconds, auto-escalate to next driver
- If no driver accepts within 2 minutes, show patient fallback: "Call 108 emergency"

### 6.5 Feature C — Quick Nearby Hospital Locator

**Route:** `/dashboard/patient/hospitals`

**UI Components:**
- Google Map with hospital markers (custom hospital icon pins)
- Filter sidebar: Distance range, Specialty, Emergency Available, ICU Available
- Hospital cards in a scrollable list beside the map

**Each Hospital Card Shows:**

| Data Point | Source | Display |
|------------|--------|---------|
| Hospital Name | Database | Bold title |
| Address | Database | Subtitle |
| Distance | Google Distance Matrix API | "2.3 km away (8 min by car)" |
| Emergency Beds Available | Real-time from hospital staff | Green badge: "12 Emergency Beds" / Red: "0 Available" |
| ICU Beds Available | Real-time from hospital staff | Blue badge: "3 ICU Beds" / Red: "0 Available" |
| Rating | Average from patient reviews | Star rating (4.2/5) with count |
| Specialties | Database | Tags: "Cardiology, Neurology, Ortho" |
| Ventilators | Real-time from hospital staff | Count if > 0 |

**Actions per Hospital:**
- "Get Directions" — Opens Google Maps navigation
- "Call Hospital" — Direct phone dial
- "View Details" — Full page with reviews, all staff, detailed bed info

**Sorting:** Default by distance (nearest first). Can sort by rating, bed availability.

### 6.6 Feature D — Emergency & Standard Medicine Delivery

**Route:** `/dashboard/patient/medicines`

**Two delivery modes — toggle tabs:**

#### Emergency Delivery (10-15 minutes)

```
Patient uploads prescription photo OR AI Doctor generates digital prescription
  |
  v
System extracts medicine list (OCR via OpenAI Vision API if photo uploaded)
  |
  v
Search nearby medical stores (within 5km) that have ALL required medicines in stock
  |
  v
Sort by distance, send real-time alert to top 3 matching stores
  |
  v
First store to accept gets the order
  |
  v
Store prepares order -> Assigns delivery person
  |
  v
Patient tracks delivery on map in real-time (delivery person GPS)
  |
  v
Delivered within 10-15 minutes
```

**Emergency Order UI:**
- Upload prescription button (camera/gallery)
- OR "Use AI Doctor Prescription" (auto-fills from last consultation)
- Medicine list with quantities (editable)
- "Request Emergency Delivery" button (red, prominent)
- After placing: Live map tracking + status bar
- Estimated delivery countdown timer

#### Standard Delivery (1-2 Working Days)

- Browse medicine catalog (search by name, category)
- Upload prescription image (OCR extracts medicines)
- Add to cart with quantities
- Checkout: Delivery address, payment method
- Order confirmation with tracking ID
- Status updates via notifications: `PLACED -> CONFIRMED -> SHIPPED -> DELIVERED`

**Comparison:**

| Feature | Emergency | Standard |
|---------|-----------|----------|
| Delivery Time | 10-15 min | 1-2 working days |
| Pricing | Premium (surge pricing) | Normal + delivery fee |
| Availability | 24/7 | Business hours |
| Prescription | Required | Required for Rx drugs |
| Tracking | Real-time map | Status updates |
| Minimum Order | None | May apply |

### 6.7 Feature E — My Health Records

**Route:** `/dashboard/patient/records`

**Sections:**
- **Consultations** — All AI Doctor chat/video consultations with full transcripts and reports
- **Prescriptions** — AI-generated + uploaded prescriptions, downloadable as PDF
- **Allergy Profile** — Managed list of allergies (add/remove), auto-injected into every AI consultation
- **Ambulance Trips** — History of all emergency bookings with dates, drivers, routes
- **Medicine Orders** — Order history with reorder button
- **Health Timeline** — Chronological view of ALL health events (consultations + orders + trips)
- **Export** — Download complete health record as PDF or share with doctor

---

## 7. ROLE 2 — HOSPITAL STAFF DASHBOARD

**Route:** `/dashboard/hospital`

### 7.1 Dashboard Layout

```
+------------------------------------------------------+
| Top Bar: Hospital Name | Alerts | Staff Profile       |
+------------------------------------------------------+
| Sidebar            |  Main Content Area               |
| ──────────         |                                   |
| Overview           |  [Real-time Stats Cards]          |
| Bed Management     |                                   |
| Staff Management   |                                   |
| Incoming Patients  |                                   |
| Analytics          |                                   |
| Hospital Profile   |                                   |
| Settings           |                                   |
+------------------------------------------------------+
```

### 7.2 Overview Dashboard

- **Live stat cards (real-time, auto-updating):**
  - Available Emergency Beds (green/red indicator)
  - Available ICU Beds (green/red indicator)
  - Available General Beds
  - Ventilators Available
  - Doctors On Duty right now
  - Incoming Ambulances (en-route count)
- **Today's admissions / discharges count**
- **Pending emergency requests**
- **Charts:** Bed occupancy trend (7-day line chart), Patient inflow (bar chart)

### 7.3 Feature A — Real-Time Bed Management

**Route:** `/dashboard/hospital/beds`

**UI: Data table + inline editing**

| Field | Type | Editable | Details |
|-------|------|----------|---------|
| Total Emergency Beds | Number | Yes (admin setup) | Total physical capacity |
| Available Emergency Beds | Number | **Yes (quick edit)** | Currently free — shown to patients |
| Occupied Emergency Beds | Auto-calculated | No | Total - Available |
| Total ICU Beds | Number | Yes (admin setup) | Total ICU capacity |
| Available ICU Beds | Number | **Yes (quick edit)** | Currently free — shown to patients |
| Occupied ICU Beds | Auto-calculated | No | Total - Available |
| Total General Ward Beds | Number | Yes | General ward capacity |
| Available General Beds | Number | **Yes (quick edit)** | Currently free |
| Ventilators Available | Number | **Yes (quick edit)** | Critical resource |

**Quick Edit UI:**
- Each editable field has `[-]` and `[+]` buttons for instant increment/decrement
- OR direct number input
- Every change immediately synced to database via API
- **Auto-broadcast:** Changes instantly reflected on patient-facing hospital cards via WebSocket
- **Audit log:** Every change recorded with timestamp, staff member name, old value, new value

### 7.4 Feature B — Staff Availability Management

**Route:** `/dashboard/hospital/staff`

**UI: Filterable data table + add/edit modal**

| Column | Details |
|--------|---------|
| Name | Doctor/nurse name |
| Role | Doctor / Nurse / Specialist / Technician |
| Specialization | Cardiology, Neurology, Surgery, General, etc. |
| Shift | Morning (6am-2pm) / Afternoon (2pm-10pm) / Night (10pm-6am) |
| Status | Available (green) / Busy (yellow) / Off Duty (gray) |
| Phone | Direct contact |

**Features:**
- **Add Staff:** Modal form with all fields
- **Edit Status:** Quick toggle buttons (Available/Busy/Off)
- **Filter by:** Role, Specialization, Status, Shift
- **Duty Roster View:** Weekly calendar grid showing all staff schedules
- **Auto-count:** Dashboard shows "X Doctors on duty, Y Specialists available" — visible to patients searching hospitals

### 7.5 Feature C — Incoming Patients

**Route:** `/dashboard/hospital/incoming`

- Real-time list of ambulances heading to this hospital
- Each entry shows: Patient name, condition/symptoms, ETA, ambulance type
- Auto-alert with sound when new ambulance is dispatched to this hospital
- Allows staff to prepare for patient arrival (ready bed, notify specialist)

### 7.6 Feature D — Analytics

**Route:** `/dashboard/hospital/analytics`

- Bed occupancy rates over time (line chart, 30 days)
- Average patient stay duration
- Emergency response times (ambulance arrival to admission)
- Staff utilization rates
- Patient satisfaction scores (from reviews)
- Peak hours heatmap
- Export reports as PDF/CSV

---

## 8. ROLE 3 — AMBULANCE DRIVER DASHBOARD

**Route:** `/dashboard/ambulance`

### 8.1 Dashboard Layout

```
+------------------------------------------------------+
| Top Bar: Driver Name | Online/Offline Toggle | Alerts |
+------------------------------------------------------+
| Sidebar            |  Main Content Area               |
| ──────────         |                                   |
| Overview           |  [Active Request / Map View]      |
| Emergency Alerts   |                                   |
| Active Trip        |                                   |
| Navigation         |                                   |
| Trip History       |                                   |
| Earnings           |                                   |
| Vehicle Profile    |                                   |
| Settings           |                                   |
+------------------------------------------------------+
```

### 8.2 Online/Offline Toggle

- Prominent toggle in top bar: **Online** (green, accepting requests) / **Offline** (gray, not available)
- When online, driver's GPS location is broadcast every 5 seconds
- When offline, driver is hidden from patient ambulance search

### 8.3 Feature A — Emergency Request Alerts

**Route:** `/dashboard/ambulance/alerts`

**When patient books ambulance:**
- **Real-time push notification** with loud alert sound (even if tab is not focused, via Web Push API)
- **Full-screen alert overlay** on the dashboard

**Alert Card Shows:**
- Patient name and phone number
- Pickup location (address + mini map preview)
- Distance from driver's current location (km)
- Estimated drive time to patient
- Patient condition/symptoms (from AI consultation if available)
- Emergency level badge (HIGH / CRITICAL)
- Destination hospital (if patient selected one)

**Actions:**
- **ACCEPT** (green, large) — Commits driver, starts trip
- **DECLINE** (red, smaller) — Passes to next nearest driver

**Auto-timeout:** If not responded within 30 seconds, alert dismissed and sent to next driver.

**Priority Queue:** CRITICAL emergencies highlighted in red with pulsing animation.

### 8.4 Feature B — Active Trip & Navigation

**Route:** `/dashboard/ambulance/trip` (shown when trip is active)

**Full-screen Google Maps** with:
- Turn-by-turn directions overlay
- Route: Driver location → Patient pickup location → Hospital destination
- Real-time traffic data integrated for fastest route
- Live ETA display, updated every 30 seconds
- Driver's GPS sent to patient every 5 seconds via WebSocket

**Status Update Buttons (bottom bar):**
Driver taps to progress through stages:
1. `EN_ROUTE` — "I'm on my way" (auto after accept)
2. `ARRIVED` — "I've reached the patient"
3. `PATIENT_PICKED` — "Patient is in ambulance"
4. `EN_ROUTE_HOSPITAL` — "Heading to hospital"
5. `COMPLETED` — "Patient delivered to hospital"

Each status change:
- Updates patient's tracking screen in real-time
- Sends push notification to patient
- When `EN_ROUTE_HOSPITAL`, auto-notifies destination hospital with ETA

### 8.5 Feature C — Trip History

**Route:** `/dashboard/ambulance/history`

- All completed trips in a table/list
- Each entry: Date, patient name, pickup → destination, distance, duration, earnings, rating received
- Filter by date range
- Expandable details with map of route taken

### 8.6 Feature D — Earnings Dashboard

**Route:** `/dashboard/ambulance/earnings`

- **Today's earnings** (prominent card)
- **This week / This month** earnings
- Number of trips completed (daily/weekly/monthly)
- Average rating
- Earnings chart (bar chart, last 30 days)
- Payout history (if payment system implemented)

### 8.7 Feature E — Vehicle Profile

**Route:** `/dashboard/ambulance/vehicle`

- Vehicle registration number
- Vehicle type: Basic Life Support / Advanced Life Support
- Equipment checklist (oxygen, defibrillator, stretcher, etc.)
- Insurance details and expiry
- Driver license number and expiry
- Profile photo upload

### 8.8 Senior Developer Suggestions for Ambulance Module

- **Auto-dispatch algorithm:** Use geofencing — find 3 nearest available drivers, alert sequentially (nearest first), not broadcast to all.
- **SOS Button:** Driver can trigger SOS if vehicle breakdown or accident during trip. Notifies admin + dispatches backup ambulance.
- **Hospital Pre-notification:** When ambulance is en route to hospital, auto-notify that hospital's dashboard with patient details + ETA so they can prepare bed/specialist.
- **Offline Mode:** Cache current trip data (patient info, destination, route) locally using Service Worker. Critical for areas with poor connectivity.
- **Speed Tracking:** Log average speed for analytics and safety monitoring.
- **Fuel/Battery Alert:** Reminder to keep vehicle fueled/charged after shifts.

---

## 9. ROLE 4 — LOCAL MEDICAL STORE DASHBOARD

**Route:** `/dashboard/medical`

### 9.1 Dashboard Layout

```
+------------------------------------------------------+
| Top Bar: Store Name | Open/Closed Toggle | Alerts    |
+------------------------------------------------------+
| Sidebar            |  Main Content Area               |
| ──────────         |                                   |
| Overview           |  [Orders / Alerts Panel]          |
| Emergency Orders   |                                   |
| Standard Orders    |                                   |
| Inventory          |                                   |
| Delivery Tracking  |                                   |
| Analytics          |                                   |
| Store Profile      |                                   |
| Settings           |                                   |
+------------------------------------------------------+
```

### 9.2 Open/Closed Toggle

- Top bar toggle: **Open** (green, receiving orders) / **Closed** (red, not available)
- When closed, store is excluded from emergency/standard order routing

### 9.3 Overview Dashboard

- **Today's stats:** Emergency orders (count + revenue), Standard orders (count + revenue), Pending deliveries
- **Active orders** list with status indicators
- **Low stock alerts** — medicines below threshold quantity
- **Expiring soon alerts** — medicines expiring within 30 days

### 9.4 Feature A — Emergency Order Alerts

**Route:** `/dashboard/medical/emergency`

**When patient requests emergency medicine delivery:**
- **Real-time alert** with urgent sound notification
- **Full-screen alert overlay** (similar to ambulance driver alerts)

**Alert Card Shows:**
- Patient name and location (address + mini map)
- Distance from store (km)
- Required medicines list with quantities
- Urgency level badge
- Prescription image (if uploaded)
- Estimated delivery time expectation (10-15 min)

**Actions:**
- **ACCEPT ORDER** (green) — Commits store to 10-15 min delivery
- **DECLINE** (red) — Passes to next nearest store with stock

**Pre-check:** System only sends alerts to stores that have ALL required medicines in stock (checked against inventory database).

### 9.5 Feature B — Delivery Route & Tracking

**Route:** `/dashboard/medical/delivery`

- Google Maps with route from **store location → patient delivery address**
- Optimized route considering real-time traffic
- Delivery person can update status:
  1. `PREPARING` — Order being packed
  2. `OUT_FOR_DELIVERY` — Delivery person has left store
  3. `DELIVERED` — Order handed to patient
- Each status update sent to patient in real-time
- Delivery person's GPS tracked and shown to patient (optional, for emergency orders)

### 9.6 Feature C — Inventory Management

**Route:** `/dashboard/medical/inventory`

**Full medicine inventory system:**

| Column | Details |
|--------|---------|
| Medicine Name | Brand name |
| Generic Name | Scientific/generic name |
| Category | Tablet, Syrup, Injection, Capsule, Ointment, Drops, Surgical, OTC |
| Manufacturer | Company name |
| Price (MRP) | Maximum retail price |
| Stock Quantity | Current units in stock |
| Requires Prescription | Yes/No flag |
| Expiry Date | Date picker |
| Status | Active / Discontinued |

**Features:**
- **Add Medicine:** Modal form with all fields
- **Edit / Delete:** Inline or modal editing
- **Search:** By name, generic name, category, manufacturer
- **Filters:** Category, prescription required, low stock, expiring soon
- **Bulk Import:** Upload CSV file to add multiple medicines at once
- **Low Stock Alerts:** Configurable threshold per medicine (e.g., alert when < 10 units)
- **Expiry Tracking:** Auto-highlight medicines expiring within 30/60/90 days
- **Auto-deduction:** When order is accepted, stock quantities auto-deducted

### 9.7 Feature D — Standard Orders

**Route:** `/dashboard/medical/orders`

- List of all non-emergency orders with filters (date, status, patient)
- Status management workflow: `RECEIVED → PROCESSING → SHIPPED → DELIVERED`
- Order details panel: Medicines, quantities, patient info, delivery address, prescription
- Print invoice/receipt button
- Order notes for internal communication

### 9.8 Feature E — Analytics

**Route:** `/dashboard/medical/analytics`

- Daily/weekly/monthly sales revenue (line chart)
- Most ordered medicines (top 10 bar chart)
- Emergency vs Standard order ratio (pie chart)
- Average delivery time for emergency orders
- Revenue trends over time
- Inventory turnover rates
- Export as PDF/CSV

### 9.9 Senior Developer Suggestions for Medical Store Module

- **Auto-inventory deduction:** When order accepted, auto-deduct stock. When order cancelled, auto-restore stock.
- **Multi-store order splitting:** If one store doesn't have ALL medicines, split order across multiple nearby stores. Patient gets combined delivery.
- **Prescription AI Verification:** Use OpenAI Vision API to OCR and validate prescription — check doctor name, registration number, date validity, medicine legibility.
- **Reorder Suggestions:** AI analyzes sales patterns and suggests which medicines to restock and in what quantities.
- **Price Comparison:** For standard orders, show patients prices from multiple nearby stores.
- **Digital Prescription Storage:** Store accepts digital prescriptions from AI Doctor consultations directly — no photo needed.

---

## 10. ROLE 5 — ADMIN DASHBOARD

**Route:** `/dashboard/admin`

### 10.1 Why Admin Role is Essential

The Admin is the **super-user** who oversees the entire Apna Medico platform. They:
- Verify and approve new registrations (hospitals, drivers, stores)
- Monitor platform health and performance
- Handle disputes and complaints
- Manage platform settings and configurations
- Ensure quality of service across all roles

**Access:** Invite-only. Set via Clerk dashboard manually or seed script. Hidden from public role selection.

### 10.2 Dashboard Layout

```
+------------------------------------------------------+
| Top Bar: Admin Panel | System Alerts | Admin Profile  |
+------------------------------------------------------+
| Sidebar            |  Main Content Area               |
| ──────────         |                                   |
| Overview           |  [Platform-wide Stats & Maps]     |
| User Management    |                                   |
| Hospital Mgmt      |                                   |
| Ambulance Mgmt     |                                   |
| Store Management   |                                   |
| Analytics          |                                   |
| Reports            |                                   |
| Moderation         |                                   |
| Platform Settings  |                                   |
| Audit Logs         |                                   |
+------------------------------------------------------+
```

### 10.3 Feature A — Platform Overview

**Route:** `/dashboard/admin`

**Stats Cards (real-time):**
- Total Users (with breakdown by role)
- Active Ambulances Right Now (online count)
- Live Emergency Requests in progress
- Today: Consultations, Bookings, Deliveries, Revenue

**Charts:**
- User growth over time (line chart, segmented by role)
- Daily active users
- Emergency response time trend

**Live Map:**
- Single Google Map showing ALL active entities:
  - Blue pins: Hospitals (with bed availability tooltip)
  - Red pins: Available ambulances (moving in real-time)
  - Green pins: Open medical stores
  - Orange markers: Active emergency requests

**System Health:**
- API uptime percentage
- Average API response time
- Error rate (last 24h)
- Database size and query performance

### 10.4 Feature B — User Management

**Route:** `/dashboard/admin/users`

- **All users table** with columns: Name, Email, Role, Status, Verified, Joined Date
- **Search** by name or email
- **Filter** by role, status (active/suspended), verified (yes/no)
- **Actions per user:**
  - View full profile and activity
  - Verify/Approve (for new hospital staff, drivers, stores — KYC verification)
  - Suspend/Ban user (with reason)
  - Change role
  - Reset account
  - Delete account
- **Bulk actions:** Approve multiple, export user list

### 10.5 Feature C — Hospital Management

**Route:** `/dashboard/admin/hospitals`

- All registered hospitals in searchable/filterable table
- **Verification workflow:** New hospital registers → Admin reviews license/documents → Approve/Reject
- View real-time bed data across ALL hospitals (aggregate view)
- Comparative analytics: Occupancy rates, ratings, response times across hospitals
- Flag underperforming hospitals (low ratings, always "0 beds available")
- Edit hospital details if needed

### 10.6 Feature D — Ambulance Management

**Route:** `/dashboard/admin/ambulances`

- All registered drivers and vehicles
- **Verification:** Review driver license, vehicle registration, insurance documents
- Real-time tracking of ALL ambulances on a single map
- Performance metrics: Average response time, trip completion rate, acceptance rate
- Driver ratings and complaints review
- Suspend drivers with poor performance or complaints

### 10.7 Feature E — Medical Store Management

**Route:** `/dashboard/admin/stores`

- All registered stores with license verification workflow
- Delivery performance metrics: Average delivery time, order completion rate
- Inventory audit capability
- Complaint handling for store-related issues
- Price monitoring (flag unusually high prices)

### 10.8 Feature F — Platform Analytics

**Route:** `/dashboard/admin/analytics`

**Comprehensive platform-wide analytics:**
- User growth trends (daily/weekly/monthly, by role)
- Emergency response time trends (target: < 10 min)
- Medicine delivery time trends (emergency target: < 15 min)
- Revenue analytics (if payments enabled)
- Geographic heatmaps: Where are most emergency requests coming from?
- Peak usage hours
- AI consultation metrics: Average session length, common diagnoses, emergency detection rate
- Exportable as PDF/CSV

### 10.9 Feature G — Platform Settings

**Route:** `/dashboard/admin/settings`

- Emergency search radius (default 10km) — configurable
- Delivery fee structure
- Commission rates (if applicable)
- Alert timeout duration (default 30 seconds)
- Notification templates (customize alert messages)
- Feature flags: Enable/disable specific features across the platform
- Maintenance mode toggle

### 10.10 Feature H — Moderation & Audit

**Route:** `/dashboard/admin/moderation`

- **Complaints/Tickets:** Users can file complaints → Admin reviews and resolves
- **Dispute Resolution:** Between patients and stores/drivers
- **Review Moderation:** Flag/remove inappropriate reviews
- **Audit Logs:** Every admin action logged with: Admin name, action, target, timestamp, details. Immutable log for accountability.

---

## 11. DATABASE SCHEMA DESIGN

### Full Prisma Schema (~15 models)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ──────────────────────────────────
// USER & ROLES
// ──────────────────────────────────

model User {
  id              String    @id @default(cuid())
  clerkId         String    @unique
  email           String    @unique
  name            String
  phone           String?
  avatar          String?
  role            Role      @default(GUEST)
  isVerified      Boolean   @default(false)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  patient         Patient?
  hospitalStaff   HospitalStaff?
  ambulanceDriver AmbulanceDriver?
  medicalStore    MedicalStore?
  notifications   Notification[]
  reviews         Review[]
}

enum Role {
  PATIENT
  HOSPITAL_STAFF
  AMBULANCE_DRIVER
  MEDICAL_STORE
  ADMIN
  GUEST
}

// ──────────────────────────────────
// PATIENT
// ──────────────────────────────────

model Patient {
  id               String    @id @default(cuid())
  userId           String    @unique
  user             User      @relation(fields: [userId], references: [id])
  dateOfBirth      DateTime?
  gender           String?
  bloodGroup       String?
  allergies        String[]
  currentMedications String[]
  medicalHistory   String?
  emergencyContact String?
  latitude         Float?
  longitude        Float?

  consultations    Consultation[]
  ambulanceBookings AmbulanceBooking[]
  medicineOrders   MedicineOrder[]
  healthRecords    HealthRecord[]
}

// ──────────────────────────────────
// AI CONSULTATION
// ──────────────────────────────────

model Consultation {
  id              String    @id @default(cuid())
  patientId       String
  patient         Patient   @relation(fields: [patientId], references: [id])
  type            ConsultationType @default(CHAT)
  messages        Json      // Full conversation history [{role, content, timestamp}]
  report          Json?     // Generated patient report JSON
  diagnosis       String?
  medicines       Json?     // Recommended medicines array
  emergencyLevel  EmergencyLevel @default(NONE)
  status          ConsultationStatus @default(ACTIVE)
  durationMinutes Int?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum ConsultationType {
  CHAT
  VIDEO
}

enum EmergencyLevel {
  NONE
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum ConsultationStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}

// ──────────────────────────────────
// HOSPITAL
// ──────────────────────────────────

model Hospital {
  id              String    @id @default(cuid())
  name            String
  address         String
  latitude        Float
  longitude       Float
  phone           String
  email           String?
  license         String?
  specialties     String[]
  rating          Float     @default(0)
  totalRatings    Int       @default(0)
  isVerified      Boolean   @default(false)
  isActive        Boolean   @default(true)
  imageUrl        String?

  bedInfo         BedInfo?
  staff           HospitalStaff[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model BedInfo {
  id                     String    @id @default(cuid())
  hospitalId             String    @unique
  hospital               Hospital  @relation(fields: [hospitalId], references: [id])
  totalEmergencyBeds     Int       @default(0)
  availableEmergencyBeds Int       @default(0)
  totalIcuBeds           Int       @default(0)
  availableIcuBeds       Int       @default(0)
  totalGeneralBeds       Int       @default(0)
  availableGeneralBeds   Int       @default(0)
  ventilators            Int       @default(0)
  lastUpdatedBy          String?
  updatedAt              DateTime  @updatedAt
}

model HospitalStaff {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  hospitalId      String
  hospital        Hospital  @relation(fields: [hospitalId], references: [id])
  designation     String    // Doctor, Nurse, Admin, Technician
  specialization  String?
  shiftStart      String?
  shiftEnd        String?
  isOnDuty        Boolean   @default(false)
}

// ──────────────────────────────────
// AMBULANCE
// ──────────────────────────────────

model AmbulanceDriver {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  vehicleNumber   String
  vehicleType     VehicleType @default(BASIC)
  licenseNumber   String
  insuranceExpiry DateTime?
  isOnline        Boolean   @default(false)
  isAvailable     Boolean   @default(true)
  latitude        Float?
  longitude       Float?
  rating          Float     @default(0)
  totalTrips      Int       @default(0)
  totalEarnings   Float     @default(0)

  bookings        AmbulanceBooking[]
}

enum VehicleType {
  BASIC
  ADVANCED
}

model AmbulanceBooking {
  id               String    @id @default(cuid())
  patientId        String
  patient          Patient   @relation(fields: [patientId], references: [id])
  driverId         String?
  driver           AmbulanceDriver? @relation(fields: [driverId], references: [id])
  pickupLat        Float
  pickupLng        Float
  pickupAddress    String
  destLat          Float?
  destLng          Float?
  destAddress      String?
  hospitalId       String?
  status           BookingStatus @default(REQUESTED)
  emergencyLevel   EmergencyLevel @default(HIGH)
  patientCondition String?
  fare             Float?
  rating           Int?
  ratingComment    String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

enum BookingStatus {
  REQUESTED
  ACCEPTED
  EN_ROUTE
  ARRIVED
  PATIENT_PICKED
  EN_ROUTE_HOSPITAL
  COMPLETED
  CANCELLED
}

// ──────────────────────────────────
// MEDICAL STORE
// ──────────────────────────────────

model MedicalStore {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id])
  storeName       String
  address         String
  latitude        Float
  longitude       Float
  phone           String
  license         String?
  isOpen          Boolean   @default(false)
  isVerified      Boolean   @default(false)
  deliveryRadius  Float     @default(5.0) // km
  rating          Float     @default(0)
  totalRatings    Int       @default(0)

  inventory       Medicine[]
  orders          MedicineOrder[]
}

model Medicine {
  id                    String    @id @default(cuid())
  storeId               String
  store                 MedicalStore @relation(fields: [storeId], references: [id])
  name                  String
  genericName           String?
  manufacturer          String?
  category              MedicineCategory @default(TABLET)
  price                 Float
  quantity              Int       @default(0)
  lowStockThreshold     Int       @default(10)
  requiresPrescription  Boolean   @default(false)
  expiryDate            DateTime?
  isActive              Boolean   @default(true)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

enum MedicineCategory {
  TABLET
  SYRUP
  INJECTION
  CAPSULE
  OINTMENT
  DROPS
  SURGICAL
  OTC
  OTHER
}

model MedicineOrder {
  id                String    @id @default(cuid())
  patientId         String
  patient           Patient   @relation(fields: [patientId], references: [id])
  storeId           String?
  store             MedicalStore? @relation(fields: [storeId], references: [id])
  items             Json      // [{medicineId, name, quantity, price}]
  totalAmount       Float
  deliveryType      DeliveryType @default(STANDARD)
  status            OrderStatus @default(PENDING)
  prescriptionUrl   String?
  deliveryAddress   String
  deliveryLat       Float
  deliveryLng       Float
  estimatedDelivery DateTime?
  rating            Int?
  ratingComment     String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum DeliveryType {
  EMERGENCY
  STANDARD
}

enum OrderStatus {
  PENDING
  ACCEPTED
  PREPARING
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
  REFUNDED
}

// ──────────────────────────────────
// HEALTH RECORDS
// ──────────────────────────────────

model HealthRecord {
  id          String     @id @default(cuid())
  patientId   String
  patient     Patient    @relation(fields: [patientId], references: [id])
  type        RecordType
  title       String
  description String?
  data        Json?
  fileUrl     String?
  createdAt   DateTime   @default(now())
}

enum RecordType {
  CONSULTATION
  PRESCRIPTION
  LAB_REPORT
  AMBULANCE_TRIP
  MEDICINE_ORDER
}

// ──────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  title     String
  message   String
  type      String   // emergency, order, booking, system, alert
  data      Json?    // Additional context data
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

// ──────────────────────────────────
// RATINGS & REVIEWS
// ──────────────────────────────────

model Review {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  targetType String   // hospital, ambulance_driver, medical_store
  targetId   String
  rating     Int      // 1-5
  comment    String?
  createdAt  DateTime @default(now())

  @@index([targetType, targetId])
}

// ──────────────────────────────────
// AUDIT LOG (Admin)
// ──────────────────────────────────

model AuditLog {
  id         String   @id @default(cuid())
  adminId    String
  action     String   // user_verified, user_suspended, bed_updated, etc.
  targetType String
  targetId   String
  details    Json?
  createdAt  DateTime @default(now())

  @@index([adminId])
  @@index([targetType, targetId])
}

// ──────────────────────────────────
// BED UPDATE LOG (Hospital audit trail)
// ──────────────────────────────────

model BedUpdateLog {
  id           String   @id @default(cuid())
  hospitalId   String
  updatedBy    String   // staff user ID
  field        String   // availableEmergencyBeds, availableIcuBeds, etc.
  oldValue     Int
  newValue     Int
  createdAt    DateTime @default(now())

  @@index([hospitalId])
}
```

---

## 12. REAL-TIME ARCHITECTURE

### WebSocket Events Map (Pusher / Socket.IO Channels)

```
AMBULANCE CHANNEL (ambulance:{bookingId})
  |-- ambulance:location-update      Driver -> Patient (GPS every 5s)
  |-- ambulance:new-request          System -> Nearest Drivers (booking alert)
  |-- ambulance:request-accepted     Driver -> Patient (acceptance notification)
  |-- ambulance:status-change        Driver -> Patient (status progression)
  |-- ambulance:trip-completed       Driver -> Patient (trip done)
  |-- ambulance:request-timeout      System -> Next Driver (30s timeout, escalate)

HOSPITAL CHANNEL (hospital:{hospitalId})
  |-- hospital:bed-update            Staff -> All (bed availability changed)
  |-- hospital:staff-update          Staff -> All (staff availability changed)
  |-- hospital:incoming-emergency    System -> Staff (ambulance en route to this hospital)
  |-- hospital:patient-arrived       Driver -> Staff (ambulance arrived)

MEDICINE CHANNEL (medicine:{orderId})
  |-- medicine:emergency-order       System -> Matching Stores (emergency order alert)
  |-- medicine:order-accepted        Store -> Patient (store accepted the order)
  |-- medicine:delivery-update       Store -> Patient (preparing, out for delivery)
  |-- medicine:order-delivered       Store -> Patient (delivery complete)
  |-- medicine:order-declined        Store -> System (decline, route to next store)

NOTIFICATION CHANNEL (user:{userId})
  |-- notification:new               System -> Specific User (any notification)
  |-- notification:emergency         System -> User (high-priority emergency alert)

AI DOCTOR CHANNEL (consultation:{consultationId})
  |-- ai:chat-stream                 Server -> Patient (streaming AI response tokens)
  |-- ai:emergency-detected          Server -> Patient (trigger emergency UI flow)
  |-- ai:report-generated            Server -> Patient (consultation report ready)
```

### Implementation: Pusher (Recommended for Simplicity)

```ts
// Server-side: Trigger event
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "ap2",
  useTLS: true,
});

// Example: Send ambulance location update
await pusher.trigger(`ambulance-${bookingId}`, "location-update", {
  lat: driverLat,
  lng: driverLng,
  timestamp: new Date().toISOString(),
});

// Example: Send emergency alert to driver
await pusher.trigger(`driver-${driverId}`, "new-request", {
  bookingId,
  patientName,
  pickupAddress,
  distance,
  emergencyLevel,
});
```

```ts
// Client-side: Subscribe to events
import Pusher from "pusher-js";

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: "ap2",
});

// Patient subscribes to ambulance tracking
const channel = pusher.subscribe(`ambulance-${bookingId}`);
channel.bind("location-update", (data: { lat: number; lng: number }) => {
  updateAmbulanceMarkerOnMap(data.lat, data.lng);
});
channel.bind("status-change", (data: { status: string }) => {
  updateBookingStatus(data.status);
});
```

---

## 13. AI/ML ARCHITECTURE

### 13.1 Medical Knowledge Base — RAG Pipeline

```
DATA INGESTION (One-time setup + periodic updates):

+------------------+    +------------------+    +------------------+
| Medical PDFs &   |    | Drug Database     |    | Emergency        |
| Clinical         |    | (OpenFDA, WHO)    |    | Protocols &      |
| Guidelines       |    | ICD-11 Codes      |    | First Aid        |
+--------+---------+    +--------+---------+    +--------+---------+
         |                       |                       |
         v                       v                       v
+------------------------------------------------------------------+
|  Text Extraction & Chunking                                       |
|  - PDF parsing (pdf-parse library)                                |
|  - Chunk size: 1000 tokens with 200 token overlap                |
|  - Metadata: source, category, last_updated                      |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|  Embedding Generation                                             |
|  - Model: OpenAI text-embedding-3-small                          |
|  - 1536 dimensions per chunk                                     |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|  Vector Storage: Pinecone                                         |
|  - Index: "apna-medico-medical-kb"                               |
|  - Namespace: "diseases", "drugs", "emergency", "guidelines"     |
|  - ~50,000+ vectors for comprehensive coverage                   |
+------------------------------------------------------------------+

QUERY FLOW (Per patient message during consultation):

Patient Message: "I have chest pain and shortness of breath"
         |
         v
+------------------------------------------------------------------+
|  1. Embed patient query using text-embedding-3-small             |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|  2. Search Pinecone: top 5 most relevant medical chunks          |
|     Filter by namespace if symptom category is identifiable      |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|  3. Build Context for GPT-4o:                                    |
|     [System Prompt: Dr. Medico medical AI persona]               |
|     [Retrieved Medical Context: relevant chunks]                 |
|     [Patient Profile: allergies, history, medications]           |
|     [Conversation History: all previous messages]                |
|     [Current Message: patient's new message]                     |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|  4. GPT-4o generates response with streaming                     |
|     - Follows one-question-at-a-time behavior                    |
|     - Checks for emergency indicators                            |
|     - Cross-references allergies before suggesting medicines     |
+------------------------------------------------------------------+
         |
         v
+------------------------------------------------------------------+
|  5. If emergency detected:                                       |
|     - Set emergency_level = "high" or "critical"                 |
|     - Trigger ambulance booking suggestion in UI                 |
|     - Provide first-aid instructions immediately                 |
+------------------------------------------------------------------+
```

### 13.2 Data Sources for Medical Knowledge Base

| Source | Content | Access |
|--------|---------|--------|
| **WHO ICD-11** | Disease classifications, symptom mappings | Open data (free) |
| **OpenFDA Drug Labels** | Drug info, interactions, side effects, dosages | REST API (free) |
| **MedlinePlus** | Patient-friendly medical encyclopedia | Open data (free) |
| **DrugBank Open Data** | Comprehensive drug information | Open data (free) |
| **BNF (British National Formulary)** | Drug dosage guidelines | Reference |
| **Clinical Practice Guidelines** | Treatment protocols by specialty | Medical literature |
| **First Aid Protocols** | Emergency procedures (CPR, bleeding, burns, etc.) | Curated content |
| **Common Allergies Database** | Drug-allergy cross-reference | Curated content |

### 13.3 LangChain.js Implementation

```ts
// lib/ai/medical-chain.ts
import { ChatOpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

// Initialize
const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.3, // Lower temperature for medical accuracy
  streaming: true,
});

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
});

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pinecone.Index("apna-medico-medical-kb");

const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
  pineconeIndex: index,
});

// Query function
export async function consultWithAI(
  patientMessage: string,
  conversationHistory: Message[],
  patientProfile: PatientProfile
) {
  // 1. Retrieve relevant medical knowledge
  const relevantDocs = await vectorStore.similaritySearch(patientMessage, 5);
  const medicalContext = relevantDocs.map(doc => doc.pageContent).join("\n\n");

  // 2. Build messages array
  const messages = [
    { role: "system", content: buildSystemPrompt(patientProfile, medicalContext) },
    ...conversationHistory,
    { role: "user", content: patientMessage },
  ];

  // 3. Stream response
  const stream = await llm.stream(messages);
  return stream;
}
```

### 13.4 AI Doctor Video Call Architecture

```
OPTION 1: OpenAI Realtime API (Recommended)
============================================

Patient Browser                   LiveKit Server              AI Server
+----------------+               +---------------+          +------------------+
| Microphone     |--audio------->|               |--audio-->| OpenAI Realtime  |
| Speaker        |<--audio-------|  WebRTC Relay  |<-audio--| API (GPT-4o)     |
| Camera (PIP)   |               |               |          |                  |
| AI Avatar      |               +---------------+          | Same medical     |
+----------------+                                          | system prompt    |
                                                            | + patient context|
                                                            +------------------+

Setup:
1. Patient clicks "Start Video Call"
2. Frontend connects to LiveKit room
3. Backend creates LiveKit room + connects OpenAI Realtime API agent
4. Patient speaks -> audio goes to OpenAI -> AI responds with voice
5. AI avatar lip-syncs or animates based on audio output
6. Full transcript saved alongside for records

OPTION 2: Pipeline Approach (Fallback)
=======================================

Patient speaks
  |
  v
Browser captures audio via MediaRecorder API
  |
  v
Send audio chunks to server
  |
  v
OpenAI Whisper API (speech-to-text)
  -> Transcribed text
  |
  v
GPT-4o (same medical RAG pipeline as chat)
  -> Medical response text
  |
  v
OpenAI TTS API (text-to-speech)
  -> Voice: "nova" (warm, professional)
  -> Audio buffer
  |
  v
Stream audio back to patient browser
  -> Play through speaker
  -> Animate AI doctor avatar
```

### 13.5 Prescription OCR (for Medicine Orders)

```
Patient uploads prescription photo
  |
  v
OpenAI Vision API (GPT-4o with image input)
  |
  v
Prompt: "Extract all medicine names, dosages, frequencies, and
         quantities from this prescription image. Return as JSON."
  |
  v
Parsed JSON: [{name, dosage, frequency, quantity}]
  |
  v
Auto-populate medicine order form
  |
  v
Cross-reference against medical store inventory
```

---

## 14. SECURITY & COMPLIANCE

### Critical Security Measures

| Area | Implementation |
|------|----------------|
| **Authentication** | Clerk handles auth, JWT tokens, session management. No custom auth. |
| **Authorization** | Role-based middleware on EVERY API route. No route accessible without role check. |
| **Data Encryption** | HTTPS everywhere (Vercel default). Encrypt PII (phone, address) at rest. |
| **API Rate Limiting** | Upstash Redis rate limiter: 100 req/min general, 10 req/min for AI endpoints. |
| **Input Validation** | Zod schemas on ALL API request bodies. Never trust client data. |
| **SQL Injection** | Prisma ORM uses parameterized queries — safe by default. |
| **XSS Prevention** | React's built-in JSX escaping + Content Security Policy headers. |
| **CORS** | Strict origin whitelist in Next.js config. |
| **File Upload Security** | Validate file type (images/PDFs only), max size 10MB, scan for malicious content. |
| **Medical Disclaimer** | Prominent disclaimer on EVERY AI consultation interaction. Cannot be dismissed. |
| **Audit Logging** | All critical actions logged: who, what, when, from where. Immutable logs. |
| **API Key Security** | All keys in `.env.local`, NEVER exposed to client. Server-side only for sensitive keys. |
| **Session Management** | Clerk handles session expiry, refresh tokens, device tracking. |

### Healthcare Data Considerations

- **NOT a replacement** for licensed medical practice — this must be stated clearly everywhere.
- All AI consultations include **prominent, non-dismissible disclaimers**.
- Patient health data handled with strict access controls — only the patient and admin can access.
- Prescription drugs require valid prescription verification before order processing.
- **Emergency fallback:** Always show 108/112 (India) emergency number prominently. App must NEVER be the only option for life-threatening emergencies.
- Consider future HIPAA/local health data regulation compliance as the platform scales.

### API Route Protection Pattern

```ts
// lib/auth.ts — Reusable auth guard for all API routes
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export function requireRole(allowedRoles: string[]) {
  return async () => {
    const { userId, sessionClaims } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = sessionClaims?.metadata?.role;
    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return { userId, role };
  };
}

// Usage in API route:
// const authResult = await requireRole(["hospital_staff", "admin"])();
// if (authResult instanceof NextResponse) return authResult;
```

---

## 15. SENIOR DEVELOPER RECOMMENDATIONS

### MUST-HAVE Improvements (Critical for Production)

1. **Fallback Emergency Number:** Always show 108/112 (India) emergency number prominently on every emergency-related screen. Never rely solely on the app for life-threatening emergencies. Add a persistent SOS bar.

2. **Offline Support (PWA):** Make the app a Progressive Web App using `next-pwa`. Critical features that must work offline: emergency contacts, last known hospital locations, cached patient profile, current trip data for ambulance drivers.

3. **Multi-language Support (i18n):** Healthcare apps MUST support local languages. Use `next-intl` library. Launch with English + Hindi. Add more regional languages post-launch.

4. **Accessibility (a11y):** Follow WCAG 2.1 AA standards. Screen reader support (ARIA labels), keyboard navigation, high contrast mode, large text option. Critical for elderly patients and visually impaired users.

5. **Push Notifications (Web Push):** Use Web Push API + Service Workers for emergency alerts even when browser tab is closed. Critical for ambulance drivers and medical stores who need instant alerts.

6. **SMS Fallback (Twilio):** For emergency ambulance bookings and critical status updates, send SMS as backup. Not everyone has stable internet.

7. **Hospital Pre-Alert System:** When an ambulance is booked heading to a hospital, auto-alert that hospital's dashboard with patient details, condition, and ETA — so they can prepare bed, specialist, and equipment.

8. **Patient Triage System:** AI should classify emergencies into standard triage levels:
   - **Red (Immediate):** Life-threatening, needs ambulance NOW
   - **Yellow (Urgent):** Serious but stable, visit hospital soon
   - **Green (Non-urgent):** Can wait, standard consultation
   This helps prioritize ambulance dispatch when multiple requests come in simultaneously.

9. **Medicine Interaction Checker:** Before AI recommends any medicine, cross-check against:
   - Patient's known allergies
   - Patient's current medications (drug-drug interactions)
   - Patient's age and gender-specific contraindications
   Flag dangerous combinations with prominent warnings.

10. **Feedback Loop:** After every consultation, delivery, and ambulance trip, prompt the user for rating (1-5 stars) + optional text feedback. Use this data to improve services, rank providers, and identify issues.

### NICE-TO-HAVE Enhancements (Post-Launch)

11. **Family Account:** Allow patients to manage health records for family members (elderly parents, children) under one account. Switch between family member profiles.

12. **Health Insurance Integration:** Show insurance-accepted hospitals, estimate out-of-pocket costs, submit claims digitally.

13. **Appointment Booking:** Beyond emergencies — allow scheduling regular appointments at hospitals with specific doctors. Calendar integration.

14. **Lab Test Booking:** Partner with diagnostic labs for home sample collection booking. Results delivered digitally to patient records.

15. **Health Metrics Dashboard:** If patient uses smartwatch/fitness tracker, integrate health data (heart rate, SpO2, blood pressure, steps) via Apple Health / Google Fit APIs.

---

## 16. DEVELOPMENT PHASES

### Phase 1 — Foundation (Week 1-2)

- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Configure Tailwind CSS + shadcn/ui component library
- [ ] Set up Clerk authentication (sign in, sign up, session)
- [ ] Build role selection onboarding page (`/onboarding`)
- [ ] Set up PostgreSQL (Neon) + Prisma ORM with full schema
- [ ] Implement role-based middleware (`middleware.ts`)
- [ ] Build responsive landing page (hero, features, how it works, footer)
- [ ] Create base dashboard layouts for all 5 roles (sidebar + top bar + content area)
- [ ] Set up role-based routing and dashboard shells

### Phase 2 — Patient Core Features (Week 3-4)

- [ ] AI Health Chatbot with GPT-4o (streaming responses)
- [ ] Set up Pinecone vector database + ingest medical knowledge base
- [ ] Implement RAG pipeline with LangChain.js
- [ ] Patient report generation (JSON → styled PDF)
- [ ] Allergy tracking system (CRUD + auto-injection into AI context)
- [ ] Health records page (consultations, prescriptions, timeline)
- [ ] AI Video Call with LiveKit + OpenAI Realtime API (or TTS/Whisper pipeline)

### Phase 3 — Location & Maps (Week 5-6)

- [ ] Google Maps integration (display, markers, directions)
- [ ] Hospital locator with real-time bed data display
- [ ] Distance calculation via Distance Matrix API
- [ ] Ambulance finder with nearest-first sorting
- [ ] Real-time GPS tracking (driver → patient via WebSocket)
- [ ] Ambulance booking flow (request → accept → track → complete)
- [ ] Auto-dispatch algorithm (geofencing, sequential alerts, timeout)

### Phase 4 — Hospital Staff & Ambulance Driver (Week 5-6, parallel)

- [ ] Hospital staff: Bed management with inline editing + auto-broadcast
- [ ] Hospital staff: Staff availability management + duty roster
- [ ] Hospital staff: Incoming patients alert from ambulance system
- [ ] Hospital staff: Analytics dashboard with charts
- [ ] Ambulance driver: Online/offline toggle + GPS broadcasting
- [ ] Ambulance driver: Emergency alert overlay with accept/decline
- [ ] Ambulance driver: Active trip navigation with Google Maps directions
- [ ] Ambulance driver: Status update buttons + patient notification
- [ ] Ambulance driver: Trip history + earnings dashboard

### Phase 5 — Medical Store & Medicine Delivery (Week 7)

- [ ] Medical store: Inventory management (CRUD, search, filter, bulk import)
- [ ] Medical store: Emergency order alerts with accept/decline
- [ ] Medical store: Delivery tracking with map route
- [ ] Medical store: Standard order management
- [ ] Patient: Emergency medicine order flow (prescription → store match → track)
- [ ] Patient: Standard medicine order flow (browse → cart → checkout)
- [ ] Prescription OCR via OpenAI Vision API

### Phase 6 — Admin Dashboard (Week 7, parallel)

- [ ] Admin: Platform overview with real-time stats + live map
- [ ] Admin: User management (search, filter, verify, suspend)
- [ ] Admin: Hospital management + verification workflow
- [ ] Admin: Ambulance management + driver verification
- [ ] Admin: Medical store management
- [ ] Admin: Platform analytics with charts
- [ ] Admin: Settings panel + feature flags
- [ ] Admin: Moderation + audit logs

### Phase 7 — Real-Time & Notifications (Week 8)

- [ ] Set up Pusher for all real-time channels
- [ ] Implement all WebSocket events (ambulance, hospital, medicine, notifications)
- [ ] In-app notification system (bell icon, notification panel, mark as read)
- [ ] Web Push notifications (Service Worker)
- [ ] SMS fallback for emergency events (Twilio)
- [ ] Email notifications for order confirmations (Resend)
- [ ] Sound alerts for emergency notifications

### Phase 8 — Polish & Launch (Week 8+)

- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Loading states, error boundaries, empty states for all pages
- [ ] Medical disclaimers on all AI interaction pages
- [ ] Rate limiting on all API endpoints
- [ ] Performance optimization (lazy loading, image optimization, code splitting)
- [ ] SEO (meta tags, Open Graph, sitemap)
- [ ] Seed script for demo data (hospitals, stores, drivers, patients)
- [ ] End-to-end testing of critical flows
- [ ] Deploy to Vercel + connect Neon DB + Upstash Redis
- [ ] Final QA and launch

---

## 17. FOLDER STRUCTURE

```
apna-medico/
├── .env.local                          # Environment variables (NEVER commit)
├── .env.example                        # Template for env vars
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── prisma/
│   ├── schema.prisma                   # Full database schema
│   ├── seed.ts                         # Seed script for demo data
│   └── migrations/                     # Auto-generated migrations
├── public/
│   ├── images/                         # Static images, illustrations
│   ├── icons/                          # App icons, favicon
│   └── sounds/                         # Alert sounds for notifications
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (Clerk provider, fonts)
│   │   ├── page.tsx                    # Landing page
│   │   ├── globals.css                 # Global styles + Tailwind
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   │   └── sign-up/[[...sign-up]]/page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx                # Role selection after auth
│   │   ├── (public)/
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── terms/page.tsx
│   │   ├── explore/
│   │   │   └── page.tsx                # Guest view (limited)
│   │   ├── dashboard/
│   │   │   ├── patient/
│   │   │   │   ├── layout.tsx          # Patient sidebar layout
│   │   │   │   ├── page.tsx            # Patient overview/home
│   │   │   │   ├── ai-doctor/
│   │   │   │   │   ├── page.tsx        # AI chat consultation
│   │   │   │   │   └── video/page.tsx  # AI video call
│   │   │   │   ├── ambulance/page.tsx  # Ambulance booking + tracking
│   │   │   │   ├── hospitals/page.tsx  # Hospital locator + map
│   │   │   │   ├── medicines/page.tsx  # Medicine ordering
│   │   │   │   ├── records/page.tsx    # Health records
│   │   │   │   ├── notifications/page.tsx
│   │   │   │   └── settings/page.tsx
│   │   │   ├── hospital/
│   │   │   │   ├── layout.tsx          # Hospital staff sidebar layout
│   │   │   │   ├── page.tsx            # Hospital overview
│   │   │   │   ├── beds/page.tsx       # Bed management
│   │   │   │   ├── staff/page.tsx      # Staff management
│   │   │   │   ├── incoming/page.tsx   # Incoming patients
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   └── profile/page.tsx    # Hospital profile settings
│   │   │   ├── ambulance/
│   │   │   │   ├── layout.tsx          # Ambulance driver sidebar layout
│   │   │   │   ├── page.tsx            # Driver overview
│   │   │   │   ├── alerts/page.tsx     # Emergency request alerts
│   │   │   │   ├── trip/page.tsx       # Active trip + navigation
│   │   │   │   ├── history/page.tsx    # Trip history
│   │   │   │   ├── earnings/page.tsx   # Earnings dashboard
│   │   │   │   └── vehicle/page.tsx    # Vehicle profile
│   │   │   ├── medical/
│   │   │   │   ├── layout.tsx          # Medical store sidebar layout
│   │   │   │   ├── page.tsx            # Store overview
│   │   │   │   ├── emergency/page.tsx  # Emergency order alerts
│   │   │   │   ├── orders/page.tsx     # Standard orders
│   │   │   │   ├── inventory/page.tsx  # Inventory management
│   │   │   │   ├── delivery/page.tsx   # Delivery tracking
│   │   │   │   ├── analytics/page.tsx
│   │   │   │   └── profile/page.tsx    # Store profile settings
│   │   │   └── admin/
│   │   │       ├── layout.tsx          # Admin sidebar layout
│   │   │       ├── page.tsx            # Platform overview
│   │   │       ├── users/page.tsx      # User management
│   │   │       ├── hospitals/page.tsx  # Hospital management
│   │   │       ├── ambulances/page.tsx # Ambulance management
│   │   │       ├── stores/page.tsx     # Store management
│   │   │       ├── analytics/page.tsx  # Platform analytics
│   │   │       ├── moderation/page.tsx # Complaints + audit logs
│   │   │       └── settings/page.tsx   # Platform settings
│   │   └── api/
│   │       ├── set-role/route.ts       # Set user role after onboarding
│   │       ├── webhooks/
│   │       │   └── clerk/route.ts      # Clerk webhook (user created/updated)
│   │       ├── ai/
│   │       │   ├── chat/route.ts       # AI chat consultation (streaming)
│   │       │   ├── video-token/route.ts # LiveKit token generation
│   │       │   └── report/route.ts     # Generate consultation report
│   │       ├── patients/
│   │       │   ├── route.ts            # CRUD patient profile
│   │       │   ├── allergies/route.ts  # Manage allergies
│   │       │   └── records/route.ts    # Health records
│   │       ├── hospitals/
│   │       │   ├── route.ts            # List/search hospitals
│   │       │   ├── [id]/route.ts       # Get hospital details
│   │       │   └── beds/route.ts       # Update bed availability
│   │       ├── ambulance/
│   │       │   ├── booking/route.ts    # Create/manage bookings
│   │       │   ├── drivers/route.ts    # List available drivers
│   │       │   ├── location/route.ts   # Update driver GPS
│   │       │   └── status/route.ts     # Update booking status
│   │       ├── medicine/
│   │       │   ├── orders/route.ts     # Create/manage orders
│   │       │   ├── inventory/route.ts  # Store inventory CRUD
│   │       │   ├── search/route.ts     # Search medicines
│   │       │   └── prescription/route.ts # OCR prescription
│   │       ├── notifications/route.ts  # Get/mark notifications
│   │       ├── reviews/route.ts        # Create/list reviews
│   │       └── admin/
│   │           ├── users/route.ts      # Admin user management
│   │           ├── verify/route.ts     # Verify entities
│   │           ├── analytics/route.ts  # Platform analytics data
│   │           └── settings/route.ts   # Platform settings
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components (auto-generated)
│   │   ├── layout/
│   │   │   ├── Navbar.tsx              # Public navbar
│   │   │   ├── Footer.tsx              # Public footer
│   │   │   ├── DashboardSidebar.tsx    # Reusable dashboard sidebar
│   │   │   └── DashboardTopBar.tsx     # Reusable top bar
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Stats.tsx
│   │   │   └── Testimonials.tsx
│   │   ├── auth/
│   │   │   └── RoleSelector.tsx        # Role selection cards
│   │   ├── patient/
│   │   │   ├── AIChatInterface.tsx     # Chat UI with streaming
│   │   │   ├── AIVideoCall.tsx         # Video call UI
│   │   │   ├── AmbulanceMap.tsx        # Map with ambulance markers
│   │   │   ├── AmbulanceTracker.tsx    # Live tracking view
│   │   │   ├── HospitalCard.tsx        # Hospital info card
│   │   │   ├── HospitalMap.tsx         # Hospital locator map
│   │   │   ├── MedicineOrderForm.tsx   # Order form
│   │   │   ├── PrescriptionUpload.tsx  # Upload + OCR
│   │   │   ├── HealthTimeline.tsx      # Health records timeline
│   │   │   └── SOSButton.tsx           # Emergency SOS button
│   │   ├── hospital/
│   │   │   ├── BedManagement.tsx       # Bed edit interface
│   │   │   ├── StaffTable.tsx          # Staff management table
│   │   │   ├── IncomingPatients.tsx    # Ambulance alert list
│   │   │   └── BedStats.tsx            # Bed availability stats
│   │   ├── ambulance/
│   │   │   ├── EmergencyAlert.tsx      # Full-screen alert overlay
│   │   │   ├── TripNavigation.tsx      # Google Maps navigation
│   │   │   ├── StatusButtons.tsx       # Trip status progression
│   │   │   ├── OnlineToggle.tsx        # Online/offline toggle
│   │   │   └── EarningsChart.tsx       # Earnings visualization
│   │   ├── medical/
│   │   │   ├── EmergencyOrderAlert.tsx # Order alert overlay
│   │   │   ├── InventoryTable.tsx      # Inventory management table
│   │   │   ├── DeliveryMap.tsx         # Delivery route map
│   │   │   └── OrderCard.tsx           # Order details card
│   │   ├── admin/
│   │   │   ├── UserTable.tsx           # User management table
│   │   │   ├── LivePlatformMap.tsx     # All entities on one map
│   │   │   ├── StatsCards.tsx          # Platform stats overview
│   │   │   └── VerificationPanel.tsx   # KYC verification UI
│   │   └── shared/
│   │       ├── GoogleMap.tsx           # Reusable Google Maps wrapper
│   │       ├── NotificationBell.tsx    # Notification icon + dropdown
│   │       ├── RatingStars.tsx         # Star rating component
│   │       ├── StatusBadge.tsx         # Color-coded status badges
│   │       ├── DataTable.tsx           # Reusable data table
│   │       ├── Charts.tsx             # Reusable chart components (Recharts)
│   │       ├── EmptyState.tsx          # Empty state illustrations
│   │       ├── LoadingSpinner.tsx      # Loading states
│   │       └── MedicalDisclaimer.tsx   # AI consultation disclaimer
│   ├── lib/
│   │   ├── db.ts                       # Prisma client singleton
│   │   ├── auth.ts                     # Auth helpers (requireRole, etc.)
│   │   ├── pusher.ts                   # Pusher server instance
│   │   ├── pusher-client.ts            # Pusher client instance
│   │   ├── redis.ts                    # Upstash Redis client
│   │   ├── uploadthing.ts              # Uploadthing config
│   │   ├── utils.ts                    # General utilities (cn, formatDate, etc.)
│   │   ├── validators.ts              # Zod schemas for all API inputs
│   │   └── ai/
│   │       ├── medical-chain.ts        # LangChain medical RAG pipeline
│   │       ├── system-prompt.ts        # Dr. Medico system prompt builder
│   │       ├── embeddings.ts           # Pinecone + OpenAI embeddings
│   │       ├── report-generator.ts     # Patient report JSON builder
│   │       └── prescription-ocr.ts     # OpenAI Vision prescription parser
│   ├── hooks/
│   │   ├── use-location.ts             # Browser geolocation hook
│   │   ├── use-pusher.ts               # Pusher subscription hook
│   │   ├── use-notifications.ts        # Notification state hook
│   │   └── use-google-maps.ts          # Google Maps loader hook
│   ├── stores/
│   │   ├── notification-store.ts       # Zustand notification state
│   │   └── location-store.ts           # Zustand user location state
│   └── types/
│       ├── index.ts                    # Shared TypeScript types
│       ├── api.ts                      # API request/response types
│       └── prisma.ts                   # Extended Prisma types
├── scripts/
│   ├── seed-db.ts                      # Seed demo data
│   └── ingest-medical-data.ts          # Ingest medical knowledge into Pinecone
└── README.md                           # Project documentation
```

---

## SUMMARY: FULL DEVELOPMENT PROMPT

**To build Apna Medico, use this document as the single source of truth.** Feed each section to your AI coding assistant or development team as context. The document covers:

- **Complete tech stack** with specific libraries and versions
- **All 12 API keys** needed with setup instructions
- **Single Clerk login modal** with 5 roles + Skip, role-based routing
- **5 complete role dashboards** with every feature specified in detail
- **Full Prisma database schema** with 15+ models ready to copy-paste
- **Real-time WebSocket architecture** with every event mapped
- **AI/ML pipeline** with medical RAG, system prompts, video call architecture
- **Security measures** for a healthcare platform
- **15 senior developer recommendations** for production readiness
- **8-week phased development roadmap**
- **Complete folder structure** with 100+ files mapped

**Start with Phase 1 (Foundation) and work through each phase sequentially. Each feature in this document should be fully functional — not just UI mockups.**

---

> **DISCLAIMER:** Apna Medico is an AI-assisted healthcare platform. It is NOT a replacement for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider. In case of medical emergency, always call 108/112 (India) or your local emergency number FIRST.

---

*Document Version: 1.0 | Created: February 2026 | Author: Senior Full-Stack Developer & AI/ML Engineer*
