import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-8 border border-purple-500/20 text-center shadow-[0_0_30px_rgba(139,92,246,0.15)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-200 mb-2">Page Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          The educational resource or view you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 transition-all shadow-lg shadow-purple-600/30"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
