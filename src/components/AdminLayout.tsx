import { useLocation } from "wouter";
import { Folder, Home, Menu, X, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeTogglle"; 
import {SecureShareLogo} from "@/components/logo";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const username = localStorage.getItem("username") || "Admin";
  const userRole = localStorage.getItem('user_role') || "ADMIN";

  const navItems = [
    { label: "Upload & Encrypt", icon: Home, href: "/dashboard" },
    { label: "File explorer", icon: Folder, href: "/explorer" },
    { label: "Profile", icon: User, href: "/profile" },
    { label: "Admin", icon: User, href: "/admin" },
  ];

  const isActive = (href: string) => location === href;

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_attributes");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");
    navigate("/"); 
  };   

  const getInitials = (name: string) => {
    if (!name) return "A";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-300">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-slate-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-700/50 flex flex-col z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Close Button (Mobile) */}
        <div className="lg:hidden p-4 flex justify-end">
          <button
            onClick={closeSidebar}
            className="p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 cursor-pointer" onClick={() => navigate("/admin")}>
          <div className="flex items-center gap-3">
              <SecureShareLogo className="w-9 h-9 drop-shadow-sm"/>
            <div>
              {/* title*/}
              <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              <span className="font-extrabold gradient-text">Secure</span>
              <span className="font-light opacity-90 gradient-text">Share</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
                    closeSidebar();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 shadow-sm"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0 tracking-widest shadow-inner">
                {getInitials(username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">{username}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userRole}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-xs"
            >
              <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
              Settings
            </Button>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500/50 transition-colors text-xs bg-transparent"
          >
            <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
            Sign Out
          </Button>
        </div>

      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col bg-white dark:bg-slate-950 transition-colors duration-300">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-700/50 p-4 flex items-center justify-between transition-colors duration-300">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">SecureShare</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        

        <div className="flex justify-end items-center gap-3 p-4">
          <ThemeToggle />
          <button 
            onClick={()=>navigate('/')} 
            className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
