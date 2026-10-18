import React, { Component, ErrorInfo, ReactNode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = window.location.pathname;
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center text-2xl font-bold">
              !
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Terjadi Kendala Memuat Aplikasi
            </h1>
            <p className="text-sm text-slate-400 mb-4">
              Sistem telah dipulihkan. Anda dapat memuat ulang halaman sekarang atau mereset cache jika diperlukan.
            </p>
            {this.state.error && (
              <pre className="text-xs bg-slate-950 p-3 rounded-lg text-red-300 overflow-x-auto text-left mb-5 border border-slate-800 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleResetStorage}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition"
              >
                Reset Cache & Mulai Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
