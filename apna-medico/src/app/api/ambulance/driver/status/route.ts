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
    if (!user?.ambulanceDriver) return NextResponse.json({ error: "Not a driver" }, { status: 403 });

    const { isOnline } = await req.json();

    const driver = await prisma.ambulanceDriver.update({
      where: { id: user.ambulanceDriver.id },
      data: { isOnline, isAvailable: isOnline },
    });

    await pusherServer.trigger("drivers-channel", "driver-status", {
      driverId: driver.id,
      isOnline,
    });

    return NextResponse.json({ driver });
  } catch (error) {
    console.error("[DRIVER_STATUS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
