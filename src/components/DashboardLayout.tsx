import { useLocation} from "wouter";
import { LogOut, FileText, BarChart3, User, Settings, Folder, Home, Upload, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeTogglle"; 
import { useState, useEffect } from "react";
import {SecureShareLogo} from "@/components/logo";
import { navigate } from "wouter/use-browser-location";
interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const userRole = localStorage.getItem('user_role');

  const navItems = [
    { label: "Home", icon: Home, href: "/home" },
    { label: "Upload & Encrypt", icon: Upload, href: "/dashboard" },
    { label: "File explorer", icon: Folder, href: "/explorer" },
    { label: "Profile", icon: User, href: "/profile" },
  ];
  if (userRole === 'ADMIN') {
    navItems.push({ label: "Admin", icon: Settings, href: "/admin" });
  }
   if (userRole === 'SUB_ADMIN') {
    navItems.push({ label: "Sub_Admin", icon: User, href: "/sub_admin" });
  } 
     
  
  const isActive = (href: string) => location === href;

  const closeSidebar = () => setSidebarOpen(false);
  console.log(userRole)

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    
    
    if (storedName) setUsername(storedName);
  }, []);

  const getInitials = (name: string) => {
      if (!name) return "U";
      const parts = name.split(" ");
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    };

// 4. sign out
  const handleLogout = () => {

    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_attributes");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");

    //
    navigate("/"); 
  };   

  return (
    <div className="relative flex h-screen bg-slate-50 dark:bg-[#0A0E17] text-foreground overflow-hidden transition-colors duration-300">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
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
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 cursor-pointer" onClick={handleLogout}>
          <div className="flex items-center gap-3">
              <SecureShareLogo className="w-9 h-9 drop-shadow-sm"/>
            <div>
              {/* title*/}
              <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              <span className="font-extrabold gradient-text">Secure</span>
              <span className="font-light opacity-90 ">Share</span>
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
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userRole || 'User'}</p>
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
      <main className="relative z-10 flex-1 overflow-auto flex flex-col bg-transparent">
        {/* Mobile Header */}
        <div className="relative z-20 lg:hidden sticky top-0 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between transition-colors duration-300 shadow-sm dark:shadow-none">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">SecureShare</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Home Logo Section (Top Right Controls) */}
        <div className="flex justify-end items-center gap-3 p-4">
          <ThemeToggle  />
          <button 
            onClick={() => navigate("/home")} 
            className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
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
