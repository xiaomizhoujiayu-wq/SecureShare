/*
 * Copyright (C) 2026 Yumi/acdd233/puchen-star
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import ScrollToTop from "@/components/ScrollTotop";
import ThemeToggle from "@/components/ThemeTogglle";
import { SecureShareLogo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowRight,
  Building,
  CheckCircle,
  File,
  Key,
  LayoutDashboard,
  Lock,
  Shield,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-x-hidden transition-colors duration-300">
      {/* Navigation Section */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-1.5 sm:px-10 sm:py-3 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <SecureShareLogo className="w-9 h-9 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          <div>
            <h1 className="font-display text-xl tracking-tight text-slate-900 dark:text-white">
              <span className="font-extrabold gradient-text">Secure</span>
              <span className="font-light opacity-90 gradient-text">Share</span>
            </h1>
          </div>
        </div>

        {/* Sign In & Sign Up */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Button
            variant="ghost"
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm sm:text-base"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </Button>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold px-5 sm:px-8 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>

          <ThemeToggle />
        </div>
      </nav>

      {/* Scroll to Top Section */}
      <div>
        <ScrollToTop />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 pb-16 sm:pb-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
        {/* Gradient Background */}
        <div className="absolute inset-0 opacity-20 dark:opacity-10" />

        {/* Animated Background Elements - Light Mode */}
        <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-emerald-400 dark:bg-emerald-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-15 dark:opacity-10 animate-pulse" />
        <div className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-400 dark:bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-15 dark:opacity-10 animate-pulse" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="mb-4 sm:mb-6 inline-block">
            <span className="inline-flex animate-shimmer items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-medium">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              CP-ABE Secured
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl mb-4 sm:mb-6 leading-tight bg-gradient-to-r from-slate-900 via-emerald-600 to-cyan-600 dark:from-white dark:via-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Secure File Sharing with
            <span className="gradient-text"> Advanced Encryption</span>
          </h1>

          <p className="text-sm sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience next-generation file security combining AES encryption
            with Attribute-Based Encryption (ABE). Share files with granular,
            policy-based access control.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16">
            <Button
              onClick={() => navigate("/signin")}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 dark:shadow-emerald-500/20"
            >
              Ready to share files safely
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg rounded-xl transition-all hover:scale-105 active:scale-95"
                >
                  Start on Github
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-48 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800">
                <DropdownMenuItem
                  className="cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 focus:bg-emerald-50 dark:focus:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400 font-medium py-2 rounded-lg"
                  onClick={() =>
                    window.open(
                      "https://github.com/xiaomizhoujiayu-wq/SecureShare",
                      "_blank",
                    )
                  }
                >
                  Frontend
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 focus:bg-emerald-50 dark:focus:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400 font-medium py-2 rounded-lg"
                  onClick={() =>
                    window.open(
                      "https://github.com/ACDD233/ABE-Cloud-Storage",
                      "_blank",
                    )
                  }
                >
                  Backend
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* short description of our platform (compare with traditional platform) */}
      {/* left: content about how we work */}
      <div className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* explanation of our platform */}
            <div className="space-y-8">
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                Redefine file share security with{" "}
                <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-[linear-gradient(110deg,#059669,45%,#6ee7b7,55%,#059669)] dark:bg-[linear-gradient(110deg,#10b981,45%,#ffffff,55%,#10b981)] animate-shimmer bg-[length:200%_auto]">
                  Attribute-Based Policies.
                </span>
              </h2>

              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                In corporate environments, sensitive files is constantly at risk
                from forwarded links, shared passwords, and rigid access lists.
                Traditional platforms secure the storage, but lose control the
                moment a file is shared across teamates.
              </p>

              <div className="space-y-5 text-base text-slate-500 dark:text-slate-400">
                <p>
                  Powered by{" "}
                  <strong className="text-slate-900 dark:text-slate-100">
                    Advanced Encryption Standard (AES)
                  </strong>{" "}
                  and{" "}
                  <strong className="text-slate-900 dark:text-slate-100">
                    Attribute-Based Encryption (ABE)
                  </strong>
                  , your files enforce their own security. Set a policy like{" "}
                  <span className="font-mono text-xs px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-emerald-600 dark:text-emerald-400">
                    "Dept: IT"
                  </span>{" "}
                  <span className="font-mono text-xs px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded text-emerald-600 dark:text-emerald-400">
                    {" "}
                    "Manager"
                  </span>
                  , and only teammates matching those exact credentials can
                  download and descrypt the files.
                </p>
              </div>
            </div>

            {/* right: show example of the dashboard */}
            <div className="relative group">
              {/* background light */}
              <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 blur-3xl rounded-full transform group-hover:scale-105 transition-transform duration-700"></div>

              {/* attribute card */}
              <div className="relative w-full max-w-lg mx-auto bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600/50 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/50 p-8 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <File className="text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        Q3_Financial_Report.pdf
                      </h4>
                      <p className="text-xs text-slate-500">28/04/2026</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full">
                    Secured
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Define access policy:
                  </p>

                  {/* mok attribute tag */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-mono flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      Dept: IT
                    </span>

                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 font-mono flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      Role: Manager
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* how it works*/}
      <section className="py-12 sm:py-20 px-4 relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* pictures */}
            <div className="relative w-full max-w-xl mx-auto">
              <div className="bg-white dark:bg-slate-700/70 rounded-lg sm:rounded-2xl p-4 sm:p-8 border border-slate-200 dark:border-slate-600/50 shadow-lg dark:shadow-lg dark:shadow-emerald-500/5">
                <img
                  src="/img/home4.svg"
                  alt="Zero Trust Architecture"
                  className="w-full rounded-lg"
                />
              </div>
            </div>

            {/* word contents */}
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                How does SecureShare protect your files?
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* Step 1 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base mb-1 text-slate-900 dark:text-white">
                      Upload & Select
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Choose the file you want to share. Encryption happens
                      instantly and locally in your browser before any data
                      leaves your device.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base mb-1 text-slate-900 dark:text-white">
                      Set Policy
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Define who can access it (e.g., "Developers AND
                      Managers"). No complicated policy creation required.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base mb-1 text-slate-900 dark:text-white">
                      Share Safely
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                      Distribute the file freely. To authorized users, it feels
                      like a standard download. To everyone else, it's
                      impenetrable noise.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Section - Redesigned */}
      <section className="py-24 bg-gradient-to-b from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 dark:bg-emerald-500/5 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-100 dark:bg-cyan-500/5 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-block mb-4"></div>
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Why choose{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400 bg-clip-text text-transparent">
                SecureShare?
              </span>
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              We built SecureShare from the ground up with advanced cryptography
              and enterprise-grade role management.
            </p>
          </div>

          {/* Features Grid - 3 Columns with Staggered Animation */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1: Zero-Knowledge */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-emerald-500/5 group-hover:to-emerald-500/0 rounded-2xl transition-all duration-300" />
              <div className="relative p-8 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 hover:border-emerald-500/50 dark:hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/5 hover:-translate-y-2 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-500/20 dark:to-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Shield className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-3xl opacity-10 group-hover:opacity-20 transition-opacity">
                    🔒
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Zero-Knowledge
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Files are encrypted locally in your browser. We never see your
                  plaintext file or access your decryption keys.
                </p>
                <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mr-2" />
                  Complete Privacy
                </div>
              </div>
            </div>

            {/* Feature 2: ABE */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/10 group-hover:via-cyan-500/5 group-hover:to-cyan-500/0 rounded-2xl transition-all duration-300" />
              <div className="relative p-8 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 hover:border-cyan-500/50 dark:hover:border-cyan-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 dark:hover:shadow-cyan-500/5 hover:-translate-y-2 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-500/20 dark:to-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Key className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="text-3xl opacity-10 group-hover:opacity-20 transition-opacity">
                    🔑
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Attribute Policies
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Ditch rigid passwords. Use ABE to restrict access based on
                  user attributes like department, role, or clearance level.
                </p>
                <div className="flex items-center text-cyan-600 dark:text-cyan-400 text-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 mr-2" />
                  Granular Control
                </div>
              </div>
            </div>

            {/* Feature 3: AES Performance */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:via-orange-500/5 group-hover:to-orange-500/0 rounded-2xl transition-all duration-300" />
              <div className="relative p-8 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 hover:border-orange-500/50 dark:hover:border-orange-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/10 dark:hover:shadow-orange-500/5 hover:-translate-y-2 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-500/20 dark:to-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Zap className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-3xl opacity-10 group-hover:opacity-20 transition-opacity">
                    ⚡
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  AES Speed
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Experience lightning-fast uploads and downloads. Symmetric AES
                  handles the heavy lifting without compromising security.
                </p>
                <div className="flex items-center text-orange-600 dark:text-orange-400 text-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 dark:bg-orange-400 mr-2" />
                  Lightning Fast
                </div>
              </div>
            </div>

            {/* Feature 4: Hierarchical Admin */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-purple-500/0 rounded-2xl transition-all duration-300" />
              <div className="relative p-8 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 hover:border-purple-500/50 dark:hover:border-purple-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 dark:hover:shadow-purple-500/5 hover:-translate-y-2 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-500/20 dark:to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-3xl opacity-10 group-hover:opacity-20 transition-opacity">
                    👥
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Hierarchical Admin
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Global admins can define organizational attributes, provision
                  sub-admins, and securely delegate attribute pools for
                  efficient scaling.
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 mr-2" />
                  Scalable Structure
                </div>
              </div>
            </div>

            {/* Feature 5: Departmental Isolation */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:via-pink-500/5 group-hover:to-pink-500/0 rounded-2xl transition-all duration-300" />
              <div className="relative p-8 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 hover:border-pink-500/50 dark:hover:border-pink-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/10 dark:hover:shadow-pink-500/5 hover:-translate-y-2 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-500/20 dark:to-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <Building className="w-7 h-7 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div className="text-3xl opacity-10 group-hover:opacity-20 transition-opacity">
                    🏢
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Departmental Isolation
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Sub-admins are strictly confined to assigning attributes
                  within their scope, eliminating the risk of cross-departmental
                  data leaks.
                </p>
                <div className="flex items-center text-pink-600 dark:text-pink-400 text-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-600 dark:bg-pink-400 mr-2" />
                  Secure Boundaries
                </div>
              </div>
            </div>

            {/* Feature 6: Seamless Control */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/10 group-hover:via-indigo-500/5 group-hover:to-indigo-500/0 rounded-2xl transition-all duration-300" />
              <div className="relative p-8 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/30 hover:border-indigo-500/50 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 hover:-translate-y-2 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-500/20 dark:to-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    <LayoutDashboard className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="text-3xl opacity-10 group-hover:opacity-20 transition-opacity">
                    📊
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  Seamless Control
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Manage your shared files, monitor access policies, and revoke
                  permissions instantly through an intuitive dashboard on any
                  device.
                </p>
                <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 mr-2" />
                  Full Visibility
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 relative bg-white dark:bg-slate-900/50 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-lg sm:rounded-2xl p-6 sm:p-12 text-center border border-emerald-200 dark:border-emerald-500/20 backdrop-blur-sm">
            <h2 className="font-display text-2xl sm:text-4xl mb-3 sm:mb-4 text-slate-900 dark:text-white">
              Ready to Secure Your Files?
            </h2>
            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 mb-6 sm:mb-8">
              Experience the future of secure file sharing with Zero Trust
              Architecture
            </p>
            <Button
              onClick={() => navigate("/signin")}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 dark:from-emerald-600 dark:to-cyan-600 dark:hover:from-emerald-700 dark:hover:to-cyan-700 text-white font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30 dark:shadow-emerald-500/20"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/50 py-6 sm:py-8 px-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-6xl mx-auto text-center text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
          <p>© 2026 Group 16 teams</p>
        </div>
      </footer>
    </div>
  );
}
