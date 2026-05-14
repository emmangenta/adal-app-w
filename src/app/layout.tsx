import type { Metadata } from "next";
import { Providers } from "./providers";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "ADAL",
  description: "Gamified learning platform with AI-powered study tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
