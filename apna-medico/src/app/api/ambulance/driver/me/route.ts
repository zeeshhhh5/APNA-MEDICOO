import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { ambulanceDriver: true },
    });

    if (!user?.ambulanceDriver) return NextResponse.json({ error: "Not a driver" }, { status: 404 });

    return NextResponse.json({ driverId: user.ambulanceDriver.id, driver: user.ambulanceDriver });
  } catch (error) {
    console.error("[DRIVER_ME]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
