import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { latitude, longitude, bookingId } = await req.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { ambulanceDriver: true },
    });

    if (!user?.ambulanceDriver) {
      return NextResponse.json({ error: "Not authorized as driver" }, { status: 403 });
    }

    await prisma.ambulanceDriver.update({
      where: { id: user.ambulanceDriver.id },
      data: { latitude, longitude },
    });

    if (bookingId) {
      const booking = await prisma.ambulanceBooking.findUnique({ where: { id: bookingId } });
      if (booking) {
        await pusherServer.trigger(`patient-${booking.patientId}`, "driver-location", {
          latitude,
          longitude,
          driverId: user.ambulanceDriver.id,
          driverName: user.name,
          bookingId,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DRIVER_LOCATION]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
