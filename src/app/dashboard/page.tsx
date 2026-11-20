'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useStudyStore } from '@/lib/store';
import Sidebar from '@/components/dashboard/Sidebar';
import UploadZone from '@/components/dashboard/UploadZone';
import { Menu, X, Brain, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Loading Skeleton for dynamically imported modules
function ComponentFallback({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full h-96 flex flex-col items-center justify-center studio-card border border-white/[0.08] rounded-2xl"
    >
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
      <span className="text-slate-400 text-sm font-medium">Loading {label}...</span>
    </div>
  );
}

// Optimized dynamic imports for bundle splitting & efficiency
const ChatInterface = dynamic(() => import('@/components/dashboard/ChatInterface'), {
  loading: () => <ComponentFallback label="AI Chat Tutor" />,
});

const FlashCards = dynamic(() => import('@/components/dashboard/FlashCards'), {
  loading: () => <ComponentFallback label="Flashcards" />,
});

const QuizMode = dynamic(() => import('@/components/dashboard/QuizMode'), {
  loading: () => <ComponentFallback label="Practice Quiz" />,
});

const MindMap = dynamic(() => import('@/components/dashboard/MindMap'), {
  loading: () => <ComponentFallback label="Mind Map" />,
});

const StudyPlan = dynamic(() => import('@/components/dashboard/StudyPlan'), {
  loading: () => <ComponentFallback label="Study Plan" />,
});

const ProgressDashboard = dynamic(() => import('@/components/dashboard/ProgressDashboard'), {
  loading: () => <ComponentFallback label="Analytics Dashboard" />,
});

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeView = useStudyStore((state) => state.activeView);

  const renderView = () => {
    switch (activeView) {
      case 'upload':
        return <UploadZone />;
      case 'chat':
        return <ChatInterface />;
      case 'flashcards':
        return <FlashCards />;
      case 'quiz':
        return <QuizMode />;
      case 'mindmap':
        return <MindMap />;
      case 'study-plan':
        return <StudyPlan />;
      case 'progress':
        return <ProgressDashboard />;
      default:
        return <UploadZone />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#090a0f] text-slate-100 antialiased selection:bg-blue-500/30 selection:text-blue-200">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.08] bg-[#090a0f]/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-600/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
            StudyBuddy <span className="text-blue-400">AI</span>
          </span>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-white/[0.05] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 z-50 w-64 shadow-2xl"
            >
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Main Workspace Dynamic Area */}
      <main id="main-content" className="flex-1 overflow-x-hidden min-w-0" role="main" aria-label="Active Study Module">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
