import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PatientDashboard from "@/components/dashboard/patient/patient-overview";
import HospitalDashboard from "@/components/dashboard/hospital/hospital-overview";
import DriverDashboard from "@/components/dashboard/driver/driver-overview";
import StoreDashboard from "@/components/dashboard/store/store-overview";
import AdminDashboard from "@/components/dashboard/admin/admin-overview";
import type { DashboardUser } from "@/types/dashboard";

export default async function DashboardPage() {
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

  const dashUser = user as unknown as DashboardUser;

  switch (user.role) {
    case "PATIENT":
      return <PatientDashboard user={dashUser} />;
    case "HOSPITAL_STAFF":
      return <HospitalDashboard user={dashUser} />;
    case "AMBULANCE_DRIVER":
      return <DriverDashboard user={dashUser} />;
    case "MEDICAL_STORE":
      return <StoreDashboard user={dashUser} />;
    case "ADMIN":
      return <AdminDashboard user={dashUser} />;
    default:
      redirect("/onboarding");
  }
}
