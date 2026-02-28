import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (adminUser?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, name: true, email: true, role: true, isVerified: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[ADMIN_USERS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
