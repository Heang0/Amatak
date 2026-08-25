'use client';

import { useState } from 'react';
import { Sidebar, SidebarItem } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  title: string;
}

export function DashboardLayout({ children, sidebarItems, title }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-[#F8F9FA] dark:bg-[#0E1117] flex overflow-hidden font-sans">
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
        
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-6 sm:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
