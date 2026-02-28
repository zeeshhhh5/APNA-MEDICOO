import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (admin?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const store = await prisma.medicalStore.update({
      where: { id },
      data: { isVerified: true },
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("[STORE_VERIFY]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
