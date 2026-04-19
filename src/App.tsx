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



function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/signin"} component={SignIn} />
      <Route path={"/signup"} component={SignUp} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/explorer"} component={FileExplorer} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/admin"} component={admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider
          defaultTheme="dark"
          // switchable
        >
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
