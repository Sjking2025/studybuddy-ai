import Link from 'next/link';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090A0F] flex items-center justify-center p-4">
      <div className="studio-card max-w-md w-full p-8 border border-white/[0.1] text-center shadow-[0_0_30px_rgba(37,99,235,0.1)]">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-200 mb-2">Page Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">
          The educational resource or view you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/20 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
