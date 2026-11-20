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
    <aside className="w-64 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col justify-between shrink-0 select-none">
      {/* Top Section: Logo & Branding */}
      <div className="flex flex-col">
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight gradient-text">
                StudyBuddy
              </span>
              <span className="text-white font-bold text-base tracking-tight">AI</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
              <span>AI Study Companion</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 text-left group ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-l-4 border-purple-500 text-white font-medium shadow-sm'
                    : 'border-l-4 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'text-purple-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>

                {/* Document count badge for Upload item */}
                {item.badge === 'documents' && (
                  <span
                    className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border transition-colors ${
                      isActive
                        ? 'bg-purple-500/30 text-purple-200 border-purple-400/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700/60 group-hover:text-purple-300 group-hover:border-purple-500/30'
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
      <div className="p-4 flex flex-col gap-3 border-t border-slate-800/80">
        {/* Document Status Mini-Card */}
        <div className="glass-card p-3 rounded-xl border border-slate-700/40 bg-slate-800/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-200 truncate">
                {documentCount === 0
                  ? 'No documents'
                  : documentCount === 1
                  ? '1 document'
                  : `${documentCount} documents`}
              </span>
              <span className="text-[10px] text-slate-400">
                {documentCount === 0 ? 'Upload study notes' : 'Active knowledge base'}
              </span>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {documentCount}
          </span>
        </div>

        {/* Back to Home Link */}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-200 group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-purple-400 group-hover:-translate-x-1 transition-all duration-200 shrink-0" />
          <span>Back to Home</span>
        </Link>
      </div>
    </aside>
  );
}
