'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Brain,
  Upload,
  MessageSquare,
  Layers,
  HelpCircle,
  GitBranch,
  Calendar,
  BarChart3,
  ArrowLeft,
  FileText,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStudyStore } from '@/lib/store';
import { ActiveView } from '@/lib/types';

export interface SidebarProps {
  onNavigate?: () => void;
}

interface NavItemConfig {
  id: ActiveView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: 'documents';
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'upload', label: 'Upload', icon: Upload, badge: 'documents' },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  { id: 'mindmap', label: 'Mind Map', icon: GitBranch },
  { id: 'study-plan', label: 'Study Plan', icon: Calendar },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
];

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { activeView, setActiveView, documents } = useStudyStore();
  const mounted = useIsMounted();

  const handleSelectView = (view: ActiveView) => {
    setActiveView(view);
    if (onNavigate) {
      onNavigate();
    }
  };

  const documentCount = mounted ? documents.length : 0;

  return (
    <aside className="w-64 h-screen bg-[#0b0d14]/95 backdrop-blur-xl border-r border-white/[0.08] flex flex-col justify-between shrink-0 select-none">
      {/* Top Section: Logo & Branding */}
      <div className="flex flex-col">
        <div className="p-5 border-b border-white/[0.08] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/25 shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                StudyBuddy
              </span>
              <span className="text-blue-400 font-bold text-base tracking-tight">AI</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>AI Study Companion</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          <div className="px-3 py-1.5 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
            Workspace
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectView(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? 'bg-blue-600/15 border-l-4 border-blue-500 text-white font-medium shadow-sm'
                    : 'border-l-4 border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>

                {/* Document count badge for Upload item */}
                {item.badge === 'documents' && (
                  <span
                    className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                      isActive
                        ? 'bg-blue-500/25 text-blue-200 border-blue-400/40'
                        : 'bg-white/[0.04] text-slate-400 border-white/[0.08] group-hover:text-blue-300 group-hover:border-blue-500/30'
                    }`}
                  >
                    {documentCount}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Document Status & Back to Home */}
      <div className="p-4 flex flex-col gap-3 border-t border-white/[0.08]">
        {/* Document Status Mini-Card */}
        <div className="studio-card p-3 rounded-xl border border-white/[0.08] bg-[#12141e] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-200 truncate">
                {documentCount === 0
                  ? 'No documents'
                  : documentCount === 1
                  ? '1 document'
                  : `${documentCount} documents`}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {documentCount === 0 ? 'Upload study notes' : 'Active knowledge base'}
              </span>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 text-[11px] font-mono font-semibold rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25">
            {documentCount}
          </span>
        </div>

        {/* Back to Home Link */}
        <Link
          href="/"
          onClick={onNavigate}
          className="min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:-translate-x-1 transition-all duration-200 shrink-0" />
          <span>Back to Home</span>
        </Link>
      </div>
    </aside>
  );
}
