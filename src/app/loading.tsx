import { Loader2, Brain } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#090A0F] flex flex-col items-center justify-center p-4">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10 animate-pulse">
          <Brain className="w-8 h-8 text-blue-400" />
        </div>
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin absolute -bottom-2 -right-2" />
      </div>
      <p className="text-slate-300 font-medium text-sm tracking-wide">
        Loading StudyBuddy AI...
      </p>
    </div>
  );
}
