import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SEED_DOCTORS = [
  { name: "Rajesh Kumar", specialty: "Cardiologist", experience: 15, hospital: "Lilavati Hospital, Mumbai", fees: 800, languages: ["English", "Hindi"], availability: "Mon-Sat 10AM-6PM", phone: "+91-9876543001", rating: 4.8 },
  { name: "Priya Sharma", specialty: "Cardiologist", experience: 12, hospital: "Ruby Hall Clinic, Pune", fees: 700, languages: ["English", "Hindi", "Marathi"], availability: "Mon-Fri 9AM-5PM", phone: "+91-9876543002", rating: 4.7 },
  { name: "Anjali Desai", specialty: "Pediatrician", experience: 10, hospital: "Kokilaben Ambani Hospital, Mumbai", fees: 600, languages: ["English", "Hindi", "Gujarati"], availability: "Mon-Sat 11AM-7PM", phone: "+91-9876543003", rating: 4.9 },
  { name: "Vikram Patel", specialty: "Orthopedic Surgeon", experience: 18, hospital: "Jehangir Hospital, Pune", fees: 900, languages: ["English", "Hindi"], availability: "Tue-Sat 2PM-8PM", phone: "+91-9876543004", rating: 4.6 },
  { name: "Meera Reddy", specialty: "Dermatologist", experience: 8, hospital: "Wockhardt Hospital, Nagpur", fees: 550, languages: ["English", "Hindi", "Telugu"], availability: "Mon-Fri 10AM-6PM", phone: "+91-9876543005", rating: 4.5 },
  { name: "Arjun Singh", specialty: "Neurologist", experience: 20, hospital: "Fortis Hospital, Mumbai", fees: 1000, languages: ["English", "Hindi", "Punjabi"], availability: "Mon-Sat 9AM-4PM", phone: "+91-9876543006", rating: 4.9 },
  { name: "Kavita Joshi", specialty: "Gynecologist", experience: 14, hospital: "Sahyadri Hospital, Pune", fees: 750, languages: ["English", "Hindi", "Marathi"], availability: "Mon-Sat 10AM-6PM", phone: "+91-9876543007", rating: 4.8 },
  { name: "Suresh Nair", specialty: "General Physician", experience: 25, hospital: "Apollo Hospital, Nashik", fees: 500, languages: ["English", "Hindi", "Malayalam"], availability: "Mon-Sun 8AM-10PM", phone: "+91-9876543008", rating: 4.7 },
  { name: "Deepak Gupta", specialty: "ENT Specialist", experience: 11, hospital: "Lilavati Hospital, Mumbai", fees: 650, languages: ["English", "Hindi"], availability: "Mon-Fri 9AM-5PM", phone: "+91-9876543009", rating: 4.6 },
  { name: "Sunita Rao", specialty: "Ophthalmologist", experience: 16, hospital: "L V Prasad Eye Institute, Pune", fees: 700, languages: ["English", "Hindi", "Telugu"], availability: "Mon-Sat 10AM-5PM", phone: "+91-9876543010", rating: 4.7 },
  { name: "Manish Tiwari", specialty: "Psychiatrist", experience: 13, hospital: "NIMHANS Outreach, Mumbai", fees: 800, languages: ["English", "Hindi"], availability: "Mon-Fri 11AM-7PM", phone: "+91-9876543011", rating: 4.5 },
  { name: "Nandini Kulkarni", specialty: "Dentist", experience: 9, hospital: "Dental Care Clinic, Pune", fees: 400, languages: ["English", "Hindi", "Marathi"], availability: "Mon-Sat 9AM-6PM", phone: "+91-9876543012", rating: 4.8 },
  { name: "Ramesh Iyer", specialty: "Pulmonologist", experience: 17, hospital: "Kokilaben Ambani Hospital, Mumbai", fees: 850, languages: ["English", "Hindi", "Tamil"], availability: "Mon-Fri 10AM-5PM", phone: "+91-9876543013", rating: 4.6 },
  { name: "Pooja Mehta", specialty: "Oncologist", experience: 14, hospital: "Tata Memorial Hospital, Mumbai", fees: 1200, languages: ["English", "Hindi", "Gujarati"], availability: "Tue-Sat 9AM-4PM", phone: "+91-9876543014", rating: 4.9 },
  { name: "Anil Patil", specialty: "Gastroenterologist", experience: 12, hospital: "Ruby Hall Clinic, Pune", fees: 750, languages: ["English", "Hindi", "Marathi"], availability: "Mon-Sat 10AM-6PM", phone: "+91-9876543015", rating: 4.7 },
  { name: "Shalini Verma", specialty: "Urologist", experience: 10, hospital: "Fortis Hospital, Mumbai", fees: 800, languages: ["English", "Hindi"], availability: "Mon-Fri 2PM-8PM", phone: "+91-9876543016", rating: 4.5 },
  { name: "Kiran Bhatt", specialty: "Endocrinologist", experience: 15, hospital: "Jehangir Hospital, Pune", fees: 900, languages: ["English", "Hindi", "Marathi"], availability: "Mon-Sat 9AM-3PM", phone: "+91-9876543017", rating: 4.8 },
  { name: "Harsh Pandey", specialty: "General Physician", experience: 8, hospital: "City Hospital, Nagpur", fees: 350, languages: ["English", "Hindi"], availability: "Mon-Sun 8AM-8PM", phone: "+91-9876543018", rating: 4.4 },
  { name: "Sneha Deshmukh", specialty: "Pediatrician", experience: 7, hospital: "Sahyadri Hospital, Pune", fees: 500, languages: ["English", "Marathi"], availability: "Mon-Sat 10AM-5PM", phone: "+91-9876543019", rating: 4.6 },
  { name: "Raghav Mishra", specialty: "Cardiologist", experience: 22, hospital: "Breach Candy Hospital, Mumbai", fees: 1500, languages: ["English", "Hindi"], availability: "Mon-Fri 9AM-3PM", phone: "+91-9876543020", rating: 4.9 },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get("specialty");

    const where: Record<string, unknown> = { isActive: true };
    if (specialty && specialty !== "all") {
      where.specialty = specialty;
    }

    let doctors = await prisma.doctor.findMany({
      where,
      orderBy: { rating: "desc" },
    });

    // Auto-seed doctors if the table is empty (first time access)
    if (doctors.length === 0 && (!specialty || specialty === "all")) {
      const totalCount = await prisma.doctor.count();
      if (totalCount === 0) {
        await prisma.doctor.createMany({ data: SEED_DOCTORS });
        doctors = await prisma.doctor.findMany({
          where: { isActive: true },
          orderBy: { rating: "desc" },
        });
      }
    }

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("[DOCTORS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
