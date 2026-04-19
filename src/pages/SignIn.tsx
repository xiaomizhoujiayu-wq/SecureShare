import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { navigate } from "wouter/use-browser-location";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { handleLoginSuccess } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      handleLoginSuccess(result, email);
    } catch (err) {
      alert("Login failed! Check console.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Animated background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl border border-slate-700/50 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-4">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="font-display text-3xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Sign In
            </h1>

          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4 mb-6">
            {/* Email Input */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:bg-slate-800/80 transition-all rounded-lg h-11"
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-emerald-500/50 focus:bg-slate-800/80 transition-all rounded-lg h-11"
              />
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-900 text-slate-500"></span>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <button onClick={()=>navigate("/")} className="hover:text-emerald-400 transition-colors">
              Come back to home page
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{" "}
            <button onClick={()=>navigate("/signup")} className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
              Sign up
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}