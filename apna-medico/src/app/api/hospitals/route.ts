import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sortByDistance } from "@/lib/geocoding";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get("lat") ?? "0");
    const lng = parseFloat(searchParams.get("lng") ?? "0");
    const limit = parseInt(searchParams.get("limit") ?? "10");

    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      include: { bedInfo: true },
      take: 50,
    });

    if (lat && lng) {
      const sorted = sortByDistance(hospitals, lat, lng).slice(0, limit);
      return NextResponse.json({ hospitals: sorted });
    }

    return NextResponse.json({ hospitals: hospitals.slice(0, limit) });
  } catch (error) {
    console.error("[HOSPITALS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const hospital = await prisma.hospital.create({
      data: {
        ...body,
        bedInfo: {
          create: {
            totalEmergencyBeds: body.totalEmergencyBeds ?? 10,
            availableEmergencyBeds: body.availableEmergencyBeds ?? 10,
            totalIcuBeds: body.totalIcuBeds ?? 5,
            availableIcuBeds: body.availableIcuBeds ?? 5,
            totalGeneralBeds: body.totalGeneralBeds ?? 50,
            availableGeneralBeds: body.availableGeneralBeds ?? 50,
          },
        },
      },
      include: { bedInfo: true },
    });
    return NextResponse.json({ hospital });
  } catch (error) {
    console.error("[HOSPITALS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
