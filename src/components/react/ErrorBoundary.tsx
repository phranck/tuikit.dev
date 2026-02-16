import React, { Component, type ReactNode, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary to catch React errors and prevent full app crashes.
 *
 * Wraps critical components (Dashboard, HeroTerminal) to show fallback UI
 * instead of white screen when errors occur.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error caught by boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-background px-6">
            <div className="max-w-md text-center">
              <h1 className="mb-4 text-2xl font-bold text-foreground">Something went wrong</h1>
              <p className="mb-6 text-muted">
                The component encountered an error. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-accent px-6 py-3 font-medium text-background transition-colors hover:bg-foreground"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
