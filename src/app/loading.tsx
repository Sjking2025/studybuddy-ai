import { Loader2, Brain } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col items-center justify-center p-4">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin absolute -bottom-2 -right-2" />
      </div>
      <p className="text-slate-300 font-medium text-sm tracking-wide">
        Loading StudyBuddy AI...
      </p>
    </div>
  );
}
