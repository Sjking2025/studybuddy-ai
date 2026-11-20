'use client';

import React, { useState, useSyncExternalStore, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  AlertCircle,
  Loader2,
  Flag,
} from 'lucide-react';
import { useStudyStore } from '@/lib/store';
import { StudyPlanItem } from '@/lib/types';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

type FilterType = 'all' | 'todo' | 'completed' | 'high-priority';

export default function StudyPlan() {
  const isMounted = useIsMounted();
  const {
    studyPlan,
    setStudyPlan,
    toggleStudyPlanItem,
    documents,
    getDocumentContent,
    setActiveView,
  } = useStudyStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');

  // Handle generation of study plan
  const handleGenerateStudyPlan = async () => {
    const content = getDocumentContent();
    if (!content || !content.trim()) {
      setErrorMessage(
        'No study notes found. Please upload at least one document to generate a personalized study plan.'
      );
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to generate study plan (Server responded with status ${response.status})`
        );
      }

      const data: { plan: StudyPlanItem[] } = await response.json();

      if (data && Array.isArray(data.plan)) {
        setStudyPlan(data.plan);
      } else {
        throw new Error(
          'Received an invalid response format from the study plan service.'
        );
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while communicating with the AI service.';
      setErrorMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculations
  const planItems = isMounted ? studyPlan : [];
  const totalCount = planItems.length;
  const completedCount = planItems.filter((item) => item.completed).length;
  const highPriorityCount = planItems.filter(
    (item) => item.priority === 'high' && !item.completed
  ).length;
  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered items
  const filteredItems = useMemo(() => {
    switch (currentFilter) {
      case 'todo':
        return planItems.filter((item) => !item.completed);
      case 'completed':
        return planItems.filter((item) => item.completed);
      case 'high-priority':
        return planItems.filter((item) => item.priority === 'high');
      default:
        return planItems;
    }
  }, [planItems, currentFilter]);

  // Priority badge helper
  const renderPriorityBadge = (priority: StudyPlanItem['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm shadow-rose-950/20">
            <Flag className="w-3 h-3 text-rose-400 shrink-0" />
            <span>High</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-950/20">
            <Flag className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Medium</span>
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-950/20">
            <Flag className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Low</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700/40 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                <span className="gradient-text">Personalized</span> Study Plan
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                AI-structured roadmap and milestone checklist built from your study materials
              </p>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleGenerateStudyPlan}
            disabled={isGenerating}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] shadow-lg shadow-purple-900/30 border border-purple-400/30 transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                <span>Crafting Your Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>{totalCount > 0 ? 'Regenerate Plan' : 'Generate Study Plan'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 flex items-start gap-3.5 shadow-lg shadow-rose-950/30 text-rose-200"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {errorMessage}
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-400 hover:text-rose-200 underline underline-offset-2 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Warning Notice when no documents uploaded */}
      {isMounted && documents.length === 0 && (
        <div className="glass-card p-4 rounded-xl border border-amber-500/30 bg-amber-950/15 flex items-center justify-between gap-4 text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="text-xs md:text-sm font-medium">
              You haven&apos;t uploaded any study materials yet. Upload notes or PDFs to create a tailored schedule.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('upload')}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-100 transition-colors cursor-pointer"
          >
            Upload Notes
          </button>
        </div>
      )}

      {/* Progress & Stats Bar (Shown when items exist) */}
      {totalCount > 0 && (
        <div className="glass-card p-5 md:p-6 border border-slate-700/40 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Plan Progress
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {progressPercentage}% Completed
                </span>
              </div>
              <p className="text-xs text-slate-400">
                <span className="font-semibold text-slate-200">{completedCount}</span> of{' '}
                <span className="font-semibold text-slate-200">{totalCount}</span> milestones completed
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-2 text-xs">
              <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{completedCount} Done</span>
              </div>
              {highPriorityCount > 0 && (
                <div className="px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-rose-400" />
                  <span>{highPriorityCount} High Priority Remaining</span>
                </div>
              )}
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="relative w-full h-3 rounded-full bg-slate-900/80 p-0.5 border border-slate-700/50 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-emerald-400 rounded-full shadow-sm shadow-purple-500/30"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pt-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setCurrentFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              All Tasks ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setCurrentFilter('todo')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentFilter === 'todo'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              To Do ({totalCount - completedCount})
            </button>
            <button
              type="button"
              onClick={() => setCurrentFilter('completed')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentFilter === 'completed'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setCurrentFilter('high-priority')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                currentFilter === 'high-priority'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                  : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              High Priority ({planItems.filter((i) => i.priority === 'high').length})
            </button>
          </div>
        </div>
      )}

      {/* Main Checklist / Timeline Area */}
      {totalCount === 0 ? (
        /* Empty State */
        <div className="glass-card p-10 md:p-14 text-center border border-slate-700/40 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h3 className="text-xl font-bold text-white">No Study Plan Yet</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Generate an intelligent step-by-step study syllabus organized by topic, priority,
              and estimated duration based on your uploaded materials.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerateStudyPlan}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 shadow-lg shadow-purple-900/40 border border-purple-400/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                  <span>Generating Timeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>Generate Study Plan</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        /* No items match current filter */
        <div className="glass-card p-8 text-center border border-slate-800 text-slate-400 space-y-2">
          <p className="text-sm">No study plan items match the selected filter.</p>
          <button
            type="button"
            onClick={() => setCurrentFilter('all')}
            className="text-xs text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
          >
            Show All Tasks
          </button>
        </div>
      ) : (
        /* Vertical Checklist & Timeline */
        <div className="relative pl-7 sm:pl-10">
          {/* Vertical Timeline Guide Line */}
          <div
            className="absolute left-[15px] sm:left-[21px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-purple-500/50 via-indigo-500/30 to-purple-500/10 -translate-x-1/2 pointer-events-none"
            aria-hidden="true"
          />

          {/* Staggered Motion List */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {filteredItems.map((item, index) => {
              const isItemDone = item.completed;

              return (
                <motion.div
                  key={item.id || `plan-item-${index}`}
                  variants={itemVariants}
                  className="relative group"
                >
                  {/* Timeline Interactive Toggle Node */}
                  <button
                    type="button"
                    onClick={() => toggleStudyPlanItem(item.id)}
                    className="absolute -left-[27px] sm:-left-[33px] top-5 -translate-x-1/2 z-10 p-0.5 rounded-full bg-[#0a0a1a] transition-transform duration-200 hover:scale-115 focus:outline-none focus:ring-2 focus:ring-purple-500/50 cursor-pointer"
                    aria-label={
                      isItemDone
                        ? `Mark "${item.topic}" as incomplete`
                        : `Mark "${item.topic}" as complete`
                    }
                  >
                    {isItemDone ? (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 fill-emerald-500/20 transition-colors" />
                    ) : (
                      <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500 group-hover:text-purple-400 transition-colors" />
                    )}
                  </button>

                  {/* Card Body */}
                  <div
                    onClick={() => toggleStudyPlanItem(item.id)}
                    role="checkbox"
                    aria-checked={isItemDone}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        toggleStudyPlanItem(item.id);
                      }
                    }}
                    className={`glass-card p-5 sm:p-6 transition-all duration-300 border cursor-pointer select-none ${
                      isItemDone
                        ? 'border-emerald-500/20 bg-emerald-950/10 shadow-sm opacity-80'
                        : 'border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-900/40 hover:shadow-lg hover:shadow-purple-500/5'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      {/* Left: Checkbox Icon + Topic + Description */}
                      <div className="space-y-1.5 flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-base sm:text-lg font-bold transition-all duration-200 ${
                              isItemDone
                                ? 'line-through text-slate-400/70'
                                : 'text-white'
                            }`}
                          >
                            {item.topic}
                          </h3>
                        </div>
                        <p
                          className={`text-xs sm:text-sm leading-relaxed transition-colors duration-200 ${
                            isItemDone ? 'text-slate-500' : 'text-slate-300'
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>

                      {/* Right: Badges Row */}
                      <div
                        className="flex flex-wrap items-center gap-2 shrink-0 pt-1 md:pt-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Duration Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-sm">
                          <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>{item.duration}</span>
                        </div>

                        {/* Priority Badge */}
                        {renderPriorityBadge(item.priority)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}
    </div>
  );
}
