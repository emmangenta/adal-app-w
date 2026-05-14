"use client";

import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";
import { PomodoroProvider } from "@/app/context/PomodoroContext";

export default function AppSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PomodoroProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </PomodoroProvider>
  );
}
