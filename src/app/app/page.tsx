import { redirect } from "next/navigation";
import { DashboardLayout } from "@/app/components/layouts/DashboardLayout";

export default function AppPage() {
  // This would normally check authentication, but for now just render the dashboard
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="text-muted-foreground">Start studying or create a new deck.</p>
      </div>
    </DashboardLayout>
  );
}
