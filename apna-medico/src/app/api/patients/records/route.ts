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
    if (!user?.patient) return NextResponse.json({ records: [] });

    const records = await prisma.healthRecord.findMany({
      where: { patientId: user.patient.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("[RECORDS_GET]", error);
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

    const { type, title, description } = await req.json();

    if (!type || !title) {
      return NextResponse.json({ error: "Type and title are required" }, { status: 400 });
    }

    const record = await prisma.healthRecord.create({
      data: {
        patientId: user.patient.id,
        type,
        title,
        description: description || null,
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("[RECORDS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
