import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import { DashboardLayout } from "./components/layouts/DashboardLayout";
import { LandingPage } from "./components/pages/LandingPage";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { Dashboard } from "./components/pages/Dashboard";
import { UploadPage } from "./components/pages/UploadPage";
import { StudyMode } from "./components/pages/StudyMode";
import { FeynmanMode } from "./components/pages/FeynmanMode";
import { PomodoroTimer } from "./components/pages/PomodoroTimer";
import { GachaPage } from "./components/pages/GachaPage";
import { CollectionPage } from "./components/pages/CollectionPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { NotFound } from "./components/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      {
        path: "app",
        Component: DashboardLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "upload", Component: UploadPage },
          { path: "study", Component: StudyMode },
          { path: "feynman", Component: FeynmanMode },
          { path: "pomodoro", Component: PomodoroTimer },
          { path: "gacha", Component: GachaPage },
          { path: "collection", Component: CollectionPage },
          { path: "settings", Component: SettingsPage },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
