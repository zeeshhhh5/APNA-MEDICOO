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
    if (!user?.patient) return NextResponse.json({ reminders: [] });

    const reminders = await prisma.medicineReminder.findMany({
      where: { patientId: user.patient.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error("[REMINDERS_GET]", error);
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

    const { medicineName, dosage, frequency, times, endDate } = await req.json();

    if (!medicineName || !dosage) {
      return NextResponse.json({ error: "Medicine name and dosage are required" }, { status: 400 });
    }

    const reminder = await prisma.medicineReminder.create({
      data: {
        patientId: user.patient.id,
        medicineName,
        dosage,
        frequency: frequency || "daily",
        times: times || ["08:00"],
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error("[REMINDERS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reminderId, isActive } = await req.json();

    const reminder = await prisma.medicineReminder.update({
      where: { id: reminderId },
      data: { isActive },
    });

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error("[REMINDERS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const reminderId = searchParams.get("id");

    if (!reminderId) return NextResponse.json({ error: "Reminder ID required" }, { status: 400 });

    await prisma.medicineReminder.delete({ where: { id: reminderId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REMINDERS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
