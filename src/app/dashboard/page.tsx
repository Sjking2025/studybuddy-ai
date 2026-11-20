'use client';

import React, { useState } from 'react';
import { useStudyStore } from '@/lib/store';
import Sidebar from '@/components/dashboard/Sidebar';
import UploadZone from '@/components/dashboard/UploadZone';
import ChatInterface from '@/components/dashboard/ChatInterface';
import FlashCards from '@/components/dashboard/FlashCards';
import QuizMode from '@/components/dashboard/QuizMode';
import MindMap from '@/components/dashboard/MindMap';
import StudyPlan from '@/components/dashboard/StudyPlan';
import ProgressDashboard from '@/components/dashboard/ProgressDashboard';
import { Menu, X, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0a1a] text-slate-100 antialiased selection:bg-purple-500/30 selection:text-purple-200">
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-indigo-900/30 bg-[#0a0a1a]/85 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight gradient-text">
            StudyBuddy AI
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-slate-900/60 text-slate-300 transition-colors hover:bg-slate-800/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          type="button"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-purple-400" />
          ) : (
            <Menu className="h-5 w-5 text-purple-400" />
          )}
        </button>
      </header>

      {/* Mobile Overlay Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0a0a1a] shadow-2xl border-r border-indigo-900/30 lg:hidden flex flex-col"
            >
              <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Static Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col border-r border-indigo-950/40 bg-[#0a0a1a]/70 backdrop-blur-xl min-h-screen sticky top-0">
        <Sidebar onNavigate={() => {}} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 animated-gradient overflow-y-auto min-h-[calc(100vh-65px)] lg:min-h-screen">
        <div className="mx-auto max-w-7xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
