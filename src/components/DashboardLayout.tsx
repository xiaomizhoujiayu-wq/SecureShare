import { useLocation} from "wouter";
import { LogOut, FileText, BarChart3, User, Settings, Folder, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useState, useEffect } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const userRole = localStorage.getItem('user_role');

  const navItems = [
    { label: "Upload & Encrypt", icon: Home, href: "/dashboard" },
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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 flex flex-col z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Close Button (Mobile) */}
        <div className="lg:hidden p-4 flex justify-end">
          <button
            onClick={closeSidebar}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/50" onClick={handleLogout}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold">SecureShare</h1>
              <p className="text-xs text-slate-400">Zero Trust Security</p>
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                    active
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
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
        <div className="p-4 border-t border-slate-700/50 space-y-3">
          <div className="glass rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0 tracking-widest">
                {getInitials(username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{username}</p>
    
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 text-xs"
            >
              <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
              Settings
            </Button>
          </div>
          
          <Button
            onClick={handleLogout} // 
            variant="outline"
            size="sm"
            className="w-full border-slate-600 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-colors text-xs"
          >
            <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
            Sign Out
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-700/50 p-4 flex items-center justify-between">
          <h2 className="font-display text-lg">SecureShare</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        {/* Home Logo Section */}
        <div className="flex justify-end p-4">
          <button onClick={handleLogout} 
          className="        
          w-10 h-10 rounded-full
          bg-emerald-500 hover:bg-emerald-600
          text-white
          flex items-center justify-center">
          <Home className="w-5 h-5" />
          </button>
        </div>
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
