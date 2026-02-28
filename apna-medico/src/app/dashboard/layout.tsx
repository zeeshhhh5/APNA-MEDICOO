import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import type { DashboardUser } from "@/types/dashboard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  if (!user || user.role === "GUEST") redirect("/onboarding");

  return <DashboardShell user={user as unknown as DashboardUser}>{children}</DashboardShell>;
}
