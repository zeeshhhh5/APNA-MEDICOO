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
      include: { hospitalStaff: true },
    });

    if (!user?.hospitalStaff) {
      return NextResponse.json({ error: "Not authorized as hospital staff" }, { status: 403 });
    }

    const body = await req.json();
    const { hospitalId, ...bedData } = body;

    const existing = await prisma.bedInfo.findUnique({ where: { hospitalId } });
    if (!existing) return NextResponse.json({ error: "Hospital not found" }, { status: 404 });

    const updatedBedInfo = await prisma.bedInfo.update({
      where: { hospitalId },
      data: { ...bedData, lastUpdatedBy: user.id },
    });

    await prisma.bedUpdateLog.create({
      data: {
        hospitalId,
        updatedBy: user.id,
        field: Object.keys(bedData).join(","),
        oldValue: 0,
        newValue: 0,
      },
    });

    await pusherServer.trigger(`hospital-${hospitalId}`, "bed-update", {
      bedInfo: updatedBedInfo,
      updatedBy: user.name,
      timestamp: new Date().toISOString(),
    });

    await pusherServer.trigger("hospitals-public", "bed-update", {
      hospitalId,
      bedInfo: updatedBedInfo,
    });

    return NextResponse.json({ bedInfo: updatedBedInfo });
  } catch (error) {
    console.error("[BEDS_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
