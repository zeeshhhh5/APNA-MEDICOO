import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { hospitalStaff: true },
    });

    if (!user?.hospitalStaff) return NextResponse.json({ staff: [] });

    const staff = await prisma.hospitalStaff.findMany({
      where: { hospitalId: user.hospitalStaff.hospitalId },
      include: { user: true },
      orderBy: { isOnDuty: "desc" },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("[HOSPITAL_STAFF_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { hospitalStaff: true },
    });

    if (!user?.hospitalStaff) return NextResponse.json({ error: "Not a hospital staff member" }, { status: 403 });

    const { name, email, designation, specialization, shiftStart, shiftEnd } = await req.json();

    if (!name || !email || !designation) {
      return NextResponse.json({ error: "Name, email, and designation are required" }, { status: 400 });
    }

    // Create mock user and staff member
    const newUser = await prisma.user.create({
      data: {
        clerkId: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name,
        role: "HOSPITAL_STAFF",
      },
    });

    const staffMember = await prisma.hospitalStaff.create({
      data: {
        userId: newUser.id,
        hospitalId: user.hospitalStaff.hospitalId,
        designation,
        specialization: specialization || null,
        shiftStart: shiftStart || null,
        shiftEnd: shiftEnd || null,
        isOnDuty: true,
      },
      include: { user: true },
    });

    return NextResponse.json({ staff: staffMember }, { status: 201 });
  } catch (error) {
    console.error("[HOSPITAL_STAFF_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { staffId, isOnDuty } = await req.json();

    if (!staffId || typeof isOnDuty !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const updated = await prisma.hospitalStaff.update({
      where: { id: staffId },
      data: { isOnDuty },
    });

    return NextResponse.json({ staff: updated });
  } catch (error) {
    console.error("[HOSPITAL_STAFF_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
