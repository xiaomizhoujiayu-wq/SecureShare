// ============================================================================
// DashboardLayout.tsx - Main layout wrapper for authenticated pages
// ============================================================================

import { SecureShareLogo } from "@/components/logo";
import ThemeToggle from "@/components/ThemeTogglle";
import { Button } from "@/components/ui/button";
import {
  Folder,
  Home,
  LogOut,
  Menu,
  Settings,
  Upload,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

// ----------------------------------------------------------------------------
// Type definitions
// ----------------------------------------------------------------------------

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// ----------------------------------------------------------------------------
// Main DashboardLayout component
// ----------------------------------------------------------------------------
export function DashboardLayout({ children }: DashboardLayoutProps) {
  // Routing
  const [location, navigate] = useLocation();
  // Sidebar state (open/closed on mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Display name of the logged-in user
  const [username, setUsername] = useState("User");
  // Role from localStorage: ADMIN, SUB_ADMIN, or USER
  const userRole = localStorage.getItem("user_role");

  // Navigation items based on user role
  const navItems = [
    { label: "Home", icon: Home, href: "/home" },
    { label: "Upload & Encrypt", icon: Upload, href: "/dashboard" },
    { label: "File explorer", icon: Folder, href: "/explorer" },
    { label: "Profile", icon: User, href: "/profile" },
  ];
  // Add Admin panel for ADMIN role
  if (userRole === "ADMIN") {
    navItems.push({ label: "Admin", icon: Settings, href: "/admin" });
  }
  // Add Sub-Admin panel for SUB_ADMIN role
  if (userRole === "SUB_ADMIN") {
    navItems.push({ label: "Sub_Admin", icon: User, href: "/sub_admin" });
  }

  // Check if a nav item is currently active
  const isActive = (href: string) => location === href;

  // Close sidebar (used on mobile)
  const closeSidebar = () => setSidebarOpen(false);

  // Debug log (kept as original)
  console.log(userRole);

  // Load username from localStorage after mount
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setTimeout(() => setUsername(storedName), 0);
    }
  }, []);

  // Generate user initials from full name (max 2 letters)
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Logout handler - clear all localStorage and redirect to sign-in page
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_attributes");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_id");

    // Force a full page reload to clear all React state and history
    window.location.replace("/");
  };

  // --------------------------------------------------------------------------
  // Render JSX
  // --------------------------------------------------------------------------
  return (
    <div className="relative flex h-screen bg-slate-100 dark:bg-transparent text-foreground overflow-hidden transition-colors duration-300">
      {/* Mobile Overlay - darkens background when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar (aside) - collapsible on mobile */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64 bg-slate-50 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border-r border-slate-200 dark:border-slate-700/50 flex flex-col z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Close Button (visible only on mobile) */}
        <div className="lg:hidden p-4 flex justify-end">
          <button
            onClick={closeSidebar}
            className="p-2 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Logo Section - click navigates to dashboard */}
        <div
          className="p-6 border-b border-slate-200 dark:border-slate-700/50 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="flex items-center gap-3">
            <SecureShareLogo className="w-9 h-9 drop-shadow-sm" />
            <div>
              {/* Brand title */}
              <h1 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                <span className="font-extrabold gradient-text">Secure</span>
                <span className="font-light opacity-90 ">Share</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
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

        {/* User Profile Section (bottom of sidebar) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
          <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg p-4 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-3 mb-4">
              {/* User avatar with initials */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold flex-shrink-0 tracking-widest shadow-inner">
                {getInitials(username)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">
                  {username}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {userRole || "User"}
                </p>
              </div>
            </div>
            {/* Settings button (currently not functional, kept as original) */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-xs"
            >
              <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
              Settings
            </Button>
          </div>

          {/* Sign Out button */}
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

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_50%_0%,_rgba(16,185,129,0.05)_0%,_transparent_50%),_radial-gradient(circle_at_0%_0%,_rgba(59,130,246,0.03)_0%,_transparent_30%)]">
        {/* Top Header with actions */}
        <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white/80 dark:bg-slate-900 px-4 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0B0F19]/80 lg:px-8">
          <div className="flex items-center gap-4"></div>

          {/* Right side header controls */}
          <div className="flex items-center gap-3">
            {/* Theme toggle (dark/light mode) */}
            <ThemeToggle />
            {/* Home button */}
            <button
              onClick={() => navigate("/home")}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm transition-colors hover:bg-emerald-600"
              title="Go Home"
            >
              <Home className="w-5 h-5" />
            </button>

            {/* Mobile menu button (hamburger) */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content - renders children passed to layout */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
