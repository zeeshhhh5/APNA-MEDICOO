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

    return NextResponse.json({
      profile: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.patient?.dateOfBirth,
        gender: user.patient?.gender,
        bloodGroup: user.patient?.bloodGroup,
        height: user.patient?.height,
        weight: user.patient?.weight,
        allergies: user.patient?.allergies ?? [],
        currentMedications: user.patient?.currentMedications ?? [],
        medicalHistory: user.patient?.medicalHistory,
        emergencyContact: user.patient?.emergencyContact,
        language: user.patient?.language ?? "en",
      },
    });
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });
    if (!user?.patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const body = await req.json();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name || user.name,
        phone: body.phone || user.phone,
      },
    });

    const patient = await prisma.patient.update({
      where: { id: user.patient.id },
      data: {
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : user.patient.dateOfBirth,
        gender: body.gender ?? user.patient.gender,
        bloodGroup: body.bloodGroup ?? user.patient.bloodGroup,
        height: body.height ? parseFloat(body.height) : user.patient.height,
        weight: body.weight ? parseFloat(body.weight) : user.patient.weight,
        allergies: body.allergies ?? user.patient.allergies,
        currentMedications: body.currentMedications ?? user.patient.currentMedications,
        medicalHistory: body.medicalHistory ?? user.patient.medicalHistory,
        emergencyContact: body.emergencyContact ?? user.patient.emergencyContact,
        language: body.language ?? user.patient.language,
      },
    });

    return NextResponse.json({ patient });
  } catch (error) {
    console.error("[PROFILE_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
