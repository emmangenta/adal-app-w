import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { cn } from "../ui/utils";
import {
  LayoutDashboard,
  Upload,
  BookOpen,
  Brain,
  Timer,
  Gift,
  Library,
  Settings,
  LogOut,
  Coins,
} from "lucide-react";

export function DashboardLayout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    navigate("/login");
    return null;
  }

  const xpProgress = (user.xp % 100);
  const xpNeeded = 100;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/app" },
    { icon: Upload, label: "Upload", path: "/app/upload" },
    { icon: BookOpen, label: "Study", path: "/app/study" },
    { icon: Brain, label: "Feynman Mode", path: "/app/feynman" },
    { icon: Timer, label: "Pomodoro", path: "/app/pomodoro" },
    { icon: Gift, label: "Gacha", path: "/app/gacha" },
    { icon: Library, label: "Collection", path: "/app/collection" },
    { icon: Settings, label: "Settings", path: "/app/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            ADAL
          </h1>
        </div>

        <div className="p-4 border-b border-border">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Level {user.level}</span>
              <span className="text-sm font-medium">{xpProgress}/{xpNeeded} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Coins className="size-5 text-amber-500" />
            <span className="font-semibold text-amber-600 dark:text-amber-400">{user.coins}</span>
            <span className="text-sm text-muted-foreground">Adal Coins</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "bg-secondary"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="mb-3 px-3 py-2 rounded-lg bg-muted">
            <p className="text-sm font-medium">{user.username}</p>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={handleLogout}
          >
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
