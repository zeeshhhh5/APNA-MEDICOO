import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MEDICINES_DATABASE } from "@/data/medicinesDB";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { medicalStore: true },
    });

    if (!user?.medicalStore) {
      return NextResponse.json({ error: "Medical store not found" }, { status: 404 });
    }

    const storeId = user.medicalStore.id;

    const existingCount = await prisma.medicine.count({ where: { storeId } });
    if (existingCount >= 100) {
      return NextResponse.json({ message: `Store already has ${existingCount} medicines. Skipping seed.` });
    }

    const medicinesToCreate = MEDICINES_DATABASE.map(med => ({
      storeId,
      name: med.name,
      genericName: med.genericName,
      manufacturer: med.manufacturer,
      ingredients: med.ingredients,
      category: med.category as any,
      price: med.price,
      quantity: Math.floor(Math.random() * 200) + 50,
      lowStockThreshold: 10,
      requiresPrescription: med.requiresPrescription,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    }));

    const result = await prisma.medicine.createMany({
      data: medicinesToCreate,
      skipDuplicates: true,
    });

    return NextResponse.json({
      message: `Seeded ${result.count} medicines successfully`,
      total: existingCount + result.count,
    });
  } catch (error) {
    console.error("[SEED_MEDICINES]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
