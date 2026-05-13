"use client";

import OverviewCards from "@/components/dashboard/overview-cards";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { role } = useAuth();

  if (!role) return null;

  return <OverviewCards role={role} />;
}
