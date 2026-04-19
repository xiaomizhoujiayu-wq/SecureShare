import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Shield,
  Lock,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Eye,
} from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* navigation Section */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 sm:px-10 sm:py-6">
        {/* logo */}
        <div className="font-display text-xl font-bold tracking-tighter">
          SECURE<span className="text-emerald-500">SHARE</span>
        </div>

        {/* sign & sign up */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white transition-colors text-sm sm:text-base"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </Button>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 sm:px-8 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 sm:pt-20 pb-16 sm:pb-20 px-4">
        {/* Gradient Background */}
        <div className="absolute inset-0 gradient-primary opacity-40" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 sm:top-20 right-5 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-10 sm:bottom-20 left-5 sm:left-10 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="mb-4 sm:mb-6 inline-block">
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-medium">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              Zero Trust Security
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl mb-4 sm:mb-6 leading-tight">
            Secure File Sharing with
            <span className="gradient-text"> Advanced Encryption</span>
          </h1>

          <p className="text-sm sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience next-generation file security combining AES encryption with Attribute-Based Encryption (ABE). Share files with granular, policy-based access control.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16">
            <Button
              onClick={() => navigate("/signin")}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg rounded-xl transition-smooth hover-lift"
            >
              Ready to share files safely
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg rounded-xl transition-smooth"
            >
              Learn More
            </Button>
          </div>

          {/* Hero Image */}
          <div className="relative mx-auto max-w-3xl">
            <div className="glass rounded-lg sm:rounded-2xl p-4 sm:p-8 border border-emerald-500/20">
              <img
                src="/img/home1.png"
                alt="SecureShare Dashboard"
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">
              Why choose us
            </h2>
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Built on Zero Trust principles with cutting-edge encryption technology
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Feature 1: AES Encryption */}
            <div className="glass rounded-lg sm:rounded-2xl p-4 sm:p-8 hover-lift group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-smooth">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-display text-lg sm:text-xl mb-2 sm:mb-3">AES Encryption</h3>
              <p className="text-sm sm:text-base text-slate-300 mb-3 sm:mb-4">
                Military-grade symmetric encryption ensures your files remain secure with efficient processing and minimal overhead.
              </p>
              <div className="flex items-center text-emerald-400 text-xs sm:text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                256-bit encryption
              </div>
            </div>

            {/* Feature 2: ABE Policy */}
            <div className="glass rounded-lg sm:rounded-2xl p-4 sm:p-8 hover-lift group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-smooth">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-display text-lg sm:text-xl mb-2 sm:mb-3">
                Attribute-Based Encryption
              </h3>
              <p className="text-sm sm:text-base text-slate-300 mb-3 sm:mb-4">
                Fine-grained access control using attributes like Department, Role, and Team for one-to-many secure sharing.
              </p>
              <div className="flex items-center text-emerald-400 text-xs sm:text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                Policy-based access
              </div>
            </div>

            {/* Feature 3: Zero Trust */}
            <div className="glass rounded-lg sm:rounded-2xl p-4 sm:p-8 hover-lift group sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-emerald-500 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-smooth">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-display text-lg sm:text-xl mb-2 sm:mb-3">Zero Trust Model</h3>
              <p className="text-sm sm:text-base text-slate-300 mb-3 sm:mb-4">
                Never trust, always verify. Every access request requires explicit authorization with continuous validation.
              </p>
              <div className="flex items-center text-emerald-400 text-xs sm:text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                Continuous verification
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Principles Section */}
      <section className="py-12 sm:py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="font-display text-2xl sm:text-4xl mb-4 sm:mb-6">
                Built on Zero Trust Principles
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base mb-1">Never Trust</h4>
                    <p className="text-xs sm:text-sm text-slate-400">
                      All users and devices are treated as untrusted by default
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base mb-1">Always Verify</h4>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Continuous authentication and authorization checks
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base mb-1">Least Privilege</h4>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Users get minimum access needed for their role
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="glass rounded-lg sm:rounded-2xl p-4 sm:p-8">
                <img
                  src="/img/home2.png"
                  alt="Zero Trust Architecture"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-lg sm:rounded-2xl p-6 sm:p-12 text-center border border-emerald-500/20">
            <h2 className="font-display text-2xl sm:text-4xl mb-3 sm:mb-4">
              Ready to Secure Your Files?
            </h2>
            <p className="text-sm sm:text-lg text-slate-300 mb-6 sm:mb-8">
              Experience the future of secure file sharing with Zero Trust Architecture
            </p>
            <Button
              onClick={() => navigate("/signin")}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg rounded-xl transition-smooth hover-lift"
            >
              Get Started Now
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-6 sm:py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-slate-400 text-xs sm:text-sm">
          <p>
            © 2026 Group 16 teams
          </p>
        </div>
      </footer>
    </div>
  );
}
