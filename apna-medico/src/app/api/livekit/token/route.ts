import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createLiveKitToken } from "@/lib/livekit";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomName } = await req.json();
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const token = await createLiveKitToken(roomName ?? `consultation-${userId}`, user.name);
    return NextResponse.json({ token, url: process.env.NEXT_PUBLIC_LIVEKIT_URL });
  } catch (error) {
    console.error("[LIVEKIT_TOKEN]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
