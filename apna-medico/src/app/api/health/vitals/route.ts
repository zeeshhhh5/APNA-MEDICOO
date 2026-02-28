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
    if (!user?.patient) return NextResponse.json({ vitals: [] });

    const vitals = await prisma.healthVitals.findMany({
      where: { patientId: user.patient.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ vitals });
  } catch (error) {
    console.error("[VITALS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });
    if (!user?.patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const body = await req.json();

    const vital = await prisma.healthVitals.create({
      data: {
        patientId: user.patient.id,
        systolicBP: body.systolicBP ? parseInt(body.systolicBP) : null,
        diastolicBP: body.diastolicBP ? parseInt(body.diastolicBP) : null,
        heartRate: body.heartRate ? parseInt(body.heartRate) : null,
        oxygenSaturation: body.oxygenSaturation ? parseFloat(body.oxygenSaturation) : null,
        temperature: body.temperature ? parseFloat(body.temperature) : null,
        glucoseLevel: body.glucoseLevel ? parseFloat(body.glucoseLevel) : null,
        weight: body.weight ? parseFloat(body.weight) : null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ vital }, { status: 201 });
  } catch (error) {
    console.error("[VITALS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
