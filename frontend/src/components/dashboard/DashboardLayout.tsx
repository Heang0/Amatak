"use client";

import { useState } from "react";
import { Sidebar, SidebarItem } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  title: string;
}

export function DashboardLayout({ children, sidebarItems, title }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#050505] flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        items={sidebarItems} 
        title={title}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar 
          pageTitle={title} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        
        <main id="dashboard-main" className="flex-1 overflow-y-auto py-6 flex flex-col">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
