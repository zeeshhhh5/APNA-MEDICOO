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
    if (!user?.medicalStore) return NextResponse.json({ medicines: [] });

    const medicines = await prisma.medicine.findMany({
      where: { storeId: user.medicalStore.id, isActive: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error("[INVENTORY_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { medicalStore: true },
    });
    if (!user?.medicalStore) return NextResponse.json({ error: "Not a store owner" }, { status: 403 });

    const body = await req.json();
    const medicine = await prisma.medicine.create({
      data: { ...body, storeId: user.medicalStore.id },
    });

    return NextResponse.json({ medicine });
  } catch (error) {
    console.error("[INVENTORY_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
