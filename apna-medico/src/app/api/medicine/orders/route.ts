import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { sortByDistance } from "@/lib/geocoding";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true },
    });
    if (!user?.patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const { items, deliveryType, deliveryAddress, deliveryLat, deliveryLng, prescriptionUrl } = await req.json();

    const totalAmount = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);

    let storeId: string | null = null;
    if (deliveryType === "EMERGENCY" && deliveryLat && deliveryLng) {
      const stores = await prisma.medicalStore.findMany({
        where: { isOpen: true, isVerified: true },
      });
      if (stores.length > 0) {
        const sorted = sortByDistance(stores, deliveryLat, deliveryLng);
        storeId = sorted[0].id;
      }
    }

    const order = await prisma.medicineOrder.create({
      data: {
        patientId: user.patient.id,
        storeId,
        items,
        totalAmount,
        deliveryType: deliveryType ?? "STANDARD",
        deliveryAddress,
        deliveryLat: deliveryLat ?? 0,
        deliveryLng: deliveryLng ?? 0,
        prescriptionUrl,
        estimatedDelivery: new Date(
          Date.now() + (deliveryType === "EMERGENCY" ? 15 * 60 * 1000 : 2 * 24 * 60 * 60 * 1000)
        ),
      },
    });

    if (storeId) {
      const store = await prisma.medicalStore.findUnique({
        where: { id: storeId },
        include: { user: true },
      });
      if (store) {
        await pusherServer.trigger(`store-${storeId}`, "new-order", {
          orderId: order.id,
          patientName: user.name,
          items,
          deliveryType,
          deliveryAddress,
          totalAmount,
          isEmergency: deliveryType === "EMERGENCY",
        });
        await prisma.notification.create({
          data: {
            userId: store.userId,
            title: deliveryType === "EMERGENCY" ? "🚨 Emergency Medicine Order!" : "New Medicine Order",
            message: `${user.name} ordered medicines. Amount: ₹${totalAmount}`,
            type: "ORDER",
            data: { orderId: order.id },
          },
        });
      }
    }

    await pusherServer.trigger(`patient-${user.patient.id}`, "order-created", {
      orderId: order.id,
      status: "PENDING",
      estimatedDelivery: order.estimatedDelivery,
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[MEDICINE_ORDER_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { patient: true, medicalStore: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (user.patient) {
      const orders = await prisma.medicineOrder.findMany({
        where: { patientId: user.patient.id },
        include: { store: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
      return NextResponse.json({ orders });
    }

    if (user.medicalStore) {
      const orders = await prisma.medicineOrder.findMany({
        where: { storeId: user.medicalStore.id },
        include: { patient: { include: { user: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ orders: [] });
  } catch (error) {
    console.error("[MEDICINE_ORDER_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
