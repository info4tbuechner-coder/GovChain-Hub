
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  // Fix: Adding an explicit constructor to ensure the 'props' property is correctly initialized and recognized by TypeScript as inherited from Component
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console or a reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI when an error is caught
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans pb-safe">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">System-Integritätsfehler</h1>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Ein unerwarteter Fehler ist aufgetreten. Die Sitzung wurde aus Sicherheitsgründen isoliert.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-8 text-left font-mono text-xs text-red-500 overflow-auto max-h-32 scrollbar-hide">
              {this.state.error?.message || "Unbekannter Fehler"}
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center py-3 px-4 bg-gov-blue text-white rounded-xl font-bold hover:bg-slate-800 transition-colors active-scale"
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> System neu starten
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors active-scale"
              >
                Zurück zur Startseite
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Default: render children by accessing the props property correctly
    return this.props.children;
  }
}

export default ErrorBoundary;
