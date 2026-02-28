import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const stores = await prisma.medicalStore.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { createdAt: "desc" } },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error("[ADMIN_STORES]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
