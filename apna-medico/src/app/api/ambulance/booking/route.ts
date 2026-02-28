import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { reverseGeocode, sortByDistance } from "@/lib/geocoding";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("[AMBULANCE_BOOKING] Unauthorized - no userId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });

    if (!user?.patient) {
      console.error("[AMBULANCE_BOOKING] Patient profile not found for userId:", userId);
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 });
    }

    const { pickupLat, pickupLng, pickupAddress, destLat, destLng, destAddress, emergencyLevel, patientCondition, hospitalId } = await req.json();

    // Make reverseGeocode optional with fallback
    let address = pickupAddress;
    if (!address) {
      try {
        address = await reverseGeocode(pickupLat, pickupLng);
      } catch (geoError) {
        console.warn("[AMBULANCE_BOOKING] Reverse geocode failed, using coordinates:", geoError);
        address = `Emergency Location (${pickupLat.toFixed(4)}, ${pickupLng.toFixed(4)})`;
      }
    }

    console.log("[AMBULANCE_BOOKING] Creating booking for patient:", user.patient.id);

    const booking = await prisma.ambulanceBooking.create({
      data: {
        patientId: user.patient.id,
        pickupLat,
        pickupLng,
        pickupAddress: address,
        destLat: destLat || null,
        destLng: destLng || null,
        destAddress: destAddress || null,
        hospitalId: hospitalId || null,
        emergencyLevel: emergencyLevel ?? "HIGH",
        patientCondition: patientCondition || "Emergency",
        status: "REQUESTED",
      },
    });

    // Find available drivers (non-blocking)
    try {
      const availableDrivers = await prisma.ambulanceDriver.findMany({
        where: { isOnline: true, isAvailable: true, latitude: { not: null }, longitude: { not: null } },
      });

      if (availableDrivers.length > 0) {
        const driversWithLoc = (availableDrivers as Array<typeof availableDrivers[0] & { latitude: number; longitude: number }>)
          .filter((d) => d.latitude != null && d.longitude != null);
        const sorted = sortByDistance(driversWithLoc, pickupLat, pickupLng);
        const nearestDriver = sorted[0];

        try {
          await pusherServer.trigger(`driver-${nearestDriver.id}`, "new-booking", {
            booking: {
              id: booking.id,
              patientName: user.name,
              pickupAddress: address,
              pickupLat,
              pickupLng,
              emergencyLevel,
              patientCondition,
              distance: nearestDriver.distance,
            },
          });
        } catch (pusherError) {
          console.warn("[AMBULANCE_BOOKING] Pusher driver notification failed:", pusherError);
        }
      }
    } catch (driverError) {
      console.warn("[AMBULANCE_BOOKING] Failed to find drivers:", driverError);
    }

    // Send patient notification (non-blocking)
    try {
      await pusherServer.trigger(`patient-${user.patient.id}`, "booking-created", {
        bookingId: booking.id,
        status: "REQUESTED",
        message: "Searching for nearest ambulance...",
      });
    } catch (pusherError) {
      console.warn("[AMBULANCE_BOOKING] Pusher patient notification failed:", pusherError);
    }

    // Create notification record (non-blocking)
    try {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Ambulance Requested",
          message: "Your ambulance request has been sent. We are finding the nearest driver.",
          type: "AMBULANCE",
          data: { bookingId: booking.id },
        },
      });
    } catch (notifError) {
      console.warn("[AMBULANCE_BOOKING] Failed to create notification:", notifError);
    }

    console.log("[AMBULANCE_BOOKING] Booking created successfully:", booking.id);
    return NextResponse.json({ booking });
  } catch (error) {
    console.error("[AMBULANCE_BOOKING] Critical error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ 
      error: "Failed to create ambulance booking", 
      details: errorMessage 
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true, ambulanceDriver: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.patient) {
      const bookings = await prisma.ambulanceBooking.findMany({
        where: { patientId: user.patient.id },
        include: { driver: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ bookings });
    }

    if (user.ambulanceDriver) {
      const bookings = await prisma.ambulanceBooking.findMany({
        where: { driverId: user.ambulanceDriver.id },
        include: { patient: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ bookings });
    }

    return NextResponse.json({ bookings: [] });
  } catch (error) {
    console.error("[AMBULANCE_BOOKING_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
