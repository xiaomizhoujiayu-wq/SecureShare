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
// ============================================================================
// ErrorBoundary.tsx - React error boundary for catching runtime errors
// ============================================================================

import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component } from "react";
import type { ReactNode } from "react";

// ----------------------------------------------------------------------------
// Type definitions
// ----------------------------------------------------------------------------

interface Props {
  children: ReactNode; // Child components to be wrapped by the error boundary
}

interface State {
  hasError: boolean; // Whether an error has been caught
  error: Error | null; // The caught error object (if any)
}

// ----------------------------------------------------------------------------
// ErrorBoundary Class Component
// ----------------------------------------------------------------------------
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Initialize state: no error detected initially
    this.state = { hasError: false, error: null };
  }

  // React lifecycle method that updates state when an error occurs in a child component
  static getDerivedStateFromError(error: Error): State {
    // Return new state to trigger fallback UI rendering
    return { hasError: true, error };
  }

  // Render fallback UI when an error has been caught
  render() {
    if (this.state.hasError) {
      // Display error message and stack trace with a page reload button
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            {/* Warning icon */}
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            {/* Error heading */}
            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>

            {/* Stack trace display area */}
            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            {/* Reload button - allows user to recover by refreshing the page */}
            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer",
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    // No error: render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
