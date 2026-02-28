import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [totalUsers, hospitals, drivers, stores, activeBookings] = await Promise.all([
      prisma.user.count(),
      prisma.hospital.count(),
      prisma.ambulanceDriver.count(),
      prisma.medicalStore.count(),
      prisma.ambulanceBooking.count({
        where: { status: { in: ["REQUESTED", "ACCEPTED", "EN_ROUTE", "ARRIVED"] } },
      }),
    ]);

    const pendingVerifications =
      (await prisma.hospital.count({ where: { isVerified: false } })) +
      (await prisma.medicalStore.count({ where: { isVerified: false } }));

    return NextResponse.json({
      stats: { totalUsers, hospitals, drivers, stores, pendingVerifications, activeBookings },
    });
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
