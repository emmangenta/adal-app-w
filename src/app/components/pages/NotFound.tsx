import Link from "next/link";
import { Button } from "../ui/button";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-xl text-muted-foreground">Page not found</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/app">
            <Button>Back to dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Marketing home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
