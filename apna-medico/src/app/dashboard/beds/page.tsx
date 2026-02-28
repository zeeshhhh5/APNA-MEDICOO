import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HospitalDashboard from "@/components/dashboard/hospital/hospital-overview";
import type { DashboardUser } from "@/types/dashboard";

export default async function BedsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      patient: true,
      hospitalStaff: { include: { hospital: { include: { bedInfo: true } } } },
      ambulanceDriver: true,
      medicalStore: true,
    },
  });

  if (!user) redirect("/sign-in");
  return <HospitalDashboard user={user as unknown as DashboardUser} />;
}
