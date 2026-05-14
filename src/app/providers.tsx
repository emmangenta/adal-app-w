"use client";

import { AppProvider } from "@/app/context/AppContext";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { Toaster } from "@/app/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AppProvider>
        {children}
        <Toaster />
      </AppProvider>
    </ThemeProvider>
  );
}
