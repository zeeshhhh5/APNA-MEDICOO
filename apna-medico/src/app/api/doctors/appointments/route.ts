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
    if (!user?.patient) return NextResponse.json({ appointments: [] });

    const appointments = await prisma.doctorAppointment.findMany({
      where: { patientId: user.patient.id },
      include: { doctor: true },
      orderBy: { date: "desc" },
      take: 20,
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("[APPOINTMENTS_GET]", error);
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

    const { doctorId, date, timeSlot, reason } = await req.json();

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json({ error: "Doctor, date, and time slot are required" }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const appointment = await prisma.doctorAppointment.create({
      data: {
        patientId: user.patient.id,
        doctorId,
        date: new Date(date),
        timeSlot,
        reason: reason || null,
        status: "PENDING",
      },
    });

    // Create notification for patient (non-blocking)
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Appointment Booked",
          message: `Your appointment with Dr. ${doctor.name} (${doctor.specialty}) is scheduled for ${new Date(date).toLocaleDateString("en-IN")} at ${timeSlot}.`,
          type: "APPOINTMENT",
          data: { appointmentId: appointment.id, doctorId },
        },
      });
    } catch (notifError) {
      console.warn("[APPOINTMENTS_POST] Failed to create notification:", notifError);
    }

    // Fetch the doctor details for response
    const appointmentWithDoctor = {
      ...appointment,
      doctor,
    };

    return NextResponse.json({ appointment: appointmentWithDoctor }, { status: 201 });
  } catch (error) {
    console.error("[APPOINTMENTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
