"use client";

import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
