import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { userId: targetUserId, isVerified } = await req.json();

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { isVerified },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: isVerified ? "VERIFY" : "UNVERIFY",
        targetType: "USER",
        targetId: targetUserId,
        details: { isVerified },
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[ADMIN_VERIFY]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
