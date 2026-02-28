import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { role, name, phone } = body;

    const validRoles = ["PATIENT", "HOSPITAL_STAFF", "AMBULANCE_DRIVER", "MEDICAL_STORE", "ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const clerkUser = await (await clerkClient()).users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

    console.log("[ONBOARDING] Processing user:", { userId, email, role });

    // Check if user exists by clerkId first
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (user) {
      // Update existing user
      console.log("[ONBOARDING] Updating existing user:", user.id);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          role, 
          name: name.trim(), 
          phone: phone?.trim() || null,
          avatar: clerkUser.imageUrl,
        },
      });
    } else {
      // Check if email already exists (edge case)
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmailUser) {
        // Email exists but different clerkId - update clerkId
        console.log("[ONBOARDING] Email exists, updating clerkId");
        user = await prisma.user.update({
          where: { id: existingEmailUser.id },
          data: {
            clerkId: userId,
            role,
            name: name.trim(),
            phone: phone?.trim() || null,
            avatar: clerkUser.imageUrl,
          },
        });
      } else {
        // Create new user
        console.log("[ONBOARDING] Creating new user");
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email,
            name: name.trim(),
            phone: phone?.trim() || null,
            role,
            avatar: clerkUser.imageUrl,
          },
        });
      }
    }

    // Create role-specific profile (NO upsert — Neon HTTP doesn't support transactions)
    switch (role) {
      case "PATIENT": {
        const existingPatient = await prisma.patient.findUnique({ where: { userId: user.id } });
        if (!existingPatient) {
          await prisma.patient.create({ data: { userId: user.id } });
          console.log("[ONBOARDING] Created patient profile");
        } else {
          console.log("[ONBOARDING] Patient profile already exists");
        }
        break;
      }

      case "HOSPITAL_STAFF": {
        const hospitalName = body.hospitalName?.trim() || "General Hospital";
        const designation = body.designation?.trim() || "Staff";
        let hospital = await prisma.hospital.findFirst({
          where: { name: { equals: hospitalName, mode: "insensitive" } },
        });
        if (!hospital) {
          hospital = await prisma.hospital.create({
            data: {
              name: hospitalName,
              address: body.hospitalAddress?.trim() || "Address pending",
              latitude: 0,
              longitude: 0,
              phone: phone?.trim() || "N/A",
            },
          });
          await prisma.bedInfo.create({ data: { hospitalId: hospital.id } });
        }
        const existingStaff = await prisma.hospitalStaff.findUnique({ where: { userId: user.id } });
        if (existingStaff) {
          await prisma.hospitalStaff.update({ where: { userId: user.id }, data: { designation } });
        } else {
          await prisma.hospitalStaff.create({
            data: { userId: user.id, hospitalId: hospital.id, designation },
          });
        }
        console.log("[ONBOARDING] Hospital staff profile ready");
        break;
      }

      case "AMBULANCE_DRIVER": {
        const vehicleNumber = body.vehicleNumber?.trim() || "XX-00-XX-0000";
        const licenseNumber = body.licenseNumber?.trim() || "DL-0000000000";
        const vehicleType = body.vehicleType === "ADVANCED" ? "ADVANCED" : "BASIC";
        const existingDriver = await prisma.ambulanceDriver.findUnique({ where: { userId: user.id } });
        if (existingDriver) {
          await prisma.ambulanceDriver.update({
            where: { userId: user.id },
            data: { vehicleNumber, licenseNumber, vehicleType },
          });
        } else {
          await prisma.ambulanceDriver.create({
            data: { userId: user.id, vehicleNumber, licenseNumber, vehicleType },
          });
        }
        console.log("[ONBOARDING] Ambulance driver profile ready");
        break;
      }

      case "MEDICAL_STORE": {
        const storeName = body.storeName?.trim() || "My Medical Store";
        const storeAddress = body.storeAddress?.trim() || "Address pending";
        const existingStore = await prisma.medicalStore.findUnique({ where: { userId: user.id } });
        if (existingStore) {
          await prisma.medicalStore.update({
            where: { userId: user.id },
            data: { storeName, address: storeAddress },
          });
        } else {
          await prisma.medicalStore.create({
            data: {
              userId: user.id, storeName, address: storeAddress,
              latitude: 0, longitude: 0, phone: phone?.trim() || "N/A",
            },
          });
        }
        console.log("[ONBOARDING] Medical store profile ready");
        break;
      }

      case "ADMIN":
        console.log("[ONBOARDING] Admin role — no sub-profile needed");
        break;
    }

    // Set role in Clerk public metadata so middleware can read it
    await (await clerkClient()).users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    console.log("[ONBOARDING] Success - user created/updated:", user.id);
    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("[ONBOARDING] Critical error:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      const target = error.meta?.target || [];
      if (target.includes('email')) {
        return NextResponse.json({ 
          error: "Email already registered", 
          details: "This email is already in use. Please contact support if you believe this is an error." 
        }, { status: 409 });
      }
      if (target.includes('clerkId')) {
        return NextResponse.json({ 
          error: "Account already exists", 
          details: "This account has already been registered." 
        }, { status: 409 });
      }
    }
    
    // Handle Clerk API errors
    if (error.message?.includes('Clerk')) {
      return NextResponse.json({ 
        error: "Authentication service error", 
        details: "Unable to verify your account. Please try again." 
      }, { status: 503 });
    }
    
    // Generic error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Failed to complete onboarding", 
      details: errorMessage 
    }, { status: 500 });
  }
}
