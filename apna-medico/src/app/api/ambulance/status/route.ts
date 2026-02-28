import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { ambulanceDriver: true },
    });

    const { bookingId, status, driverId } = await req.json();

    const booking = await prisma.ambulanceBooking.findUnique({
      where: { id: bookingId },
      include: { patient: { include: { user: true } } },
    });
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const updatedBooking = await prisma.ambulanceBooking.update({
      where: { id: bookingId },
      data: {
        status,
        driverId: driverId ?? booking.driverId,
      },
      include: { driver: { include: { user: true } }, patient: { include: { user: true } } },
    });

    if (status === "ACCEPTED" && user?.ambulanceDriver) {
      await prisma.ambulanceDriver.update({
        where: { id: user.ambulanceDriver.id },
        data: { isAvailable: false },
      });
    }

    if (status === "COMPLETED" && user?.ambulanceDriver) {
      await prisma.ambulanceDriver.update({
        where: { id: user.ambulanceDriver.id },
        data: { isAvailable: true, totalTrips: { increment: 1 } },
      });
    }

    await pusherServer.trigger(`patient-${booking.patientId}`, "booking-update", {
      bookingId,
      status,
      driverName: updatedBooking.driver?.user?.name,
      message: getStatusMessage(status),
    });

    if (user?.ambulanceDriver) {
      await pusherServer.trigger(`driver-${user.ambulanceDriver.id}`, "booking-update", {
        bookingId,
        status,
      });
    }

    await prisma.notification.create({
      data: {
        userId: booking.patient.userId,
        title: "Ambulance Update",
        message: getStatusMessage(status),
        type: "AMBULANCE",
        data: { bookingId, status },
      },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error("[AMBULANCE_STATUS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    ACCEPTED: "Driver accepted your request and is on the way!",
    EN_ROUTE: "Ambulance is on its way to your location",
    ARRIVED: "Ambulance has arrived at your location",
    PATIENT_PICKED: "Patient picked up, heading to hospital",
    EN_ROUTE_HOSPITAL: "En route to hospital",
    COMPLETED: "Trip completed successfully",
    CANCELLED: "Booking was cancelled",
  };
  return messages[status] ?? "Status updated";
}
