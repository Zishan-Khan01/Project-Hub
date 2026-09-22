import {
  useState,
  type ReactNode,
} from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: AppLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">

      {/* Fixed Sidebar */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() =>
          setMobileSidebarOpen(false)
        }
      />

      {/* Main Application Area */}
      <div className="flex min-h-screen min-w-0 flex-col lg:ml-64">

        {/* Topbar */}
        <Topbar
          onMenuClick={() =>
            setMobileSidebarOpen(true)
          }
        />

        {/* Page Content */}
        <main className="min-w-0 flex-1 overflow-x-hidden">
          {children}
        </main>

      </div>

    </div>
  );
}