import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { medicalStore: true },
    });

    if (!user?.medicalStore) return NextResponse.json({ error: "Not a store" }, { status: 404 });

    return NextResponse.json({ storeId: user.medicalStore.id, store: user.medicalStore });
  } catch (error) {
    console.error("[STORE_ME]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
