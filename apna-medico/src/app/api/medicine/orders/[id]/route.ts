import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await req.json();

    const order = await prisma.medicineOrder.update({
      where: { id },
      data: { status },
      include: { patient: { include: { user: true } } },
    });

    await pusherServer.trigger(`patient-${order.patientId}`, "order-update", {
      orderId: id,
      status,
      message: getStatusMessage(status),
    });

    await prisma.notification.create({
      data: {
        userId: order.patient.userId,
        title: "Order Update",
        message: getStatusMessage(status),
        type: "ORDER",
        data: { orderId: id, status },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("[ORDER_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    ACCEPTED: "Your order has been accepted by the store",
    PREPARING: "Your medicines are being prepared",
    OUT_FOR_DELIVERY: "Your order is out for delivery",
    DELIVERED: "Your order has been delivered",
    CANCELLED: "Your order has been cancelled",
  };
  return messages[status] ?? "Order status updated";
}
