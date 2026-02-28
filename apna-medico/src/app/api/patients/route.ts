import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user, patient: user.patient });
  } catch (error) {
    console.error("[PATIENTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { name, phone, dateOfBirth, gender, bloodGroup, allergies, currentMedications, medicalHistory, emergencyContact } = body;

    if (name || phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: name ?? user.name, phone: phone ?? user.phone },
      });
    }

    if (user.patient) {
      const patient = await prisma.patient.update({
        where: { userId: user.id },
        data: {
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          gender: gender ?? undefined,
          bloodGroup: bloodGroup ?? undefined,
          allergies: allergies ?? undefined,
          currentMedications: currentMedications ?? undefined,
          medicalHistory: medicalHistory ?? undefined,
          emergencyContact: emergencyContact ?? undefined,
        },
      });
      return NextResponse.json({ patient });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATIENTS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
