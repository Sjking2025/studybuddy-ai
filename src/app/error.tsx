'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 border border-rose-500/30 text-center shadow-[0_0_30px_rgba(244,63,94,0.15)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Something went wrong!</h2>
        <p className="text-slate-400 text-sm mb-6">
          An unexpected error occurred while rendering this view. Your saved documents and study sessions are safe.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/30"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white glass-card border border-slate-700/50 hover:border-purple-500/30 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
