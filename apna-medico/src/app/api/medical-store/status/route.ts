import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { medicalStore: true },
    });
    if (!user?.medicalStore) return NextResponse.json({ error: "Not a store owner" }, { status: 403 });

    const { isOpen } = await req.json();

    const store = await prisma.medicalStore.update({
      where: { id: user.medicalStore.id },
      data: { isOpen },
    });

    await pusherServer.trigger("stores-channel", "store-status", {
      storeId: store.id,
      isOpen,
    });

    return NextResponse.json({ store });
  } catch (error) {
    console.error("[STORE_STATUS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
