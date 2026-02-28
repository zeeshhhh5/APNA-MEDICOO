import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });
    if (!user?.patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const { type } = await req.json();

    const consultation = await prisma.consultation.create({
      data: {
        patientId: user.patient.id,
        type: type ?? "CHAT",
        messages: [],
      },
    });

    return NextResponse.json({ consultation });
  } catch (error) {
    console.error("[CONSULTATIONS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });
    if (!user?.patient) return NextResponse.json({ consultations: [] });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Single consultation fetch (for chat history reload)
    if (id) {
      const consultation = await prisma.consultation.findFirst({
        where: { id, patientId: user.patient.id },
      });
      if (!consultation) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ consultation });
    }

    // List all consultations
    const consultations = await prisma.consultation.findMany({
      where: { patientId: user.patient.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ consultations });
  } catch (error) {
    console.error("[CONSULTATIONS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
