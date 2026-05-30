import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import FileExplorer from "@/pages/FileExplorer";
import Profile from "@/pages/Profile";
import admin from "@/pages/admin";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import SubAdmin from "@/pages/Sub_admin";

import Homepage from "@/pages/homepage";

import { useLocation } from "wouter";
import { useEffect } from "react";

const ProtectedRoute = ({ component: Component }: { component: any }) => {
  const [, setLocation] = useLocation();
  const token = localStorage.getItem("auth_token");

  useEffect(() => {
    if (!token) {
      setLocation("/signin");
    }
  }, [token, setLocation]);

  return token ? <Component /> : null;
};

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/signin"} component={SignIn} />
      <Route path={"/signup"} component={SignUp} />
      
      {/* Protected Routes */}
      <Route path={"/dashboard"}>
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path={"/explorer"}>
        <ProtectedRoute component={FileExplorer} />
      </Route>
      <Route path={"/profile"}>
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path={"/admin"}>
        <ProtectedRoute component={admin} />
      </Route>
      <Route path={"/sub_admin"}>
        <ProtectedRoute component={SubAdmin} />
      </Route>
      <Route path={"/home"}>
        <ProtectedRoute component={Homepage} />
      </Route>

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider switchable={true} defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
