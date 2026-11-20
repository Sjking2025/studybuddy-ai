'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Layers,
  Trophy,
  TrendingUp,
  BarChart3,
  Target,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  BookOpen,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useStudyStore } from '@/lib/store';
import { QuizResult } from '@/lib/types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
      score: number;
      rawScore: number;
      total: number;
      dateFormatted: string;
      timeTakenFormatted?: string;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-card bg-slate-950/95 border border-purple-500/30 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <span className="font-semibold text-slate-100">{data.name}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {data.score}%
          </span>
        </div>
        <p className="text-slate-300">
          Result:{' '}
          <span className="font-bold text-white">
            {data.rawScore} / {data.total}
          </span>{' '}
          correct
        </p>
        <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-4">
          <span>{data.dateFormatted}</span>
          {data.timeTakenFormatted && <span>{data.timeTakenFormatted}</span>}
        </div>
      </div>
    );
  }
  return null;
};

export default function ProgressDashboard() {
  const [mounted, setMounted] = useState(false);

  const { documents, flashcards, quizResults, studyPlan, setActiveView } =
    useStudyStore();

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Calculate Flashcards Mastery Stats
  const totalFlashcards = flashcards.length;
  const masteredFlashcards = useMemo(
    () => flashcards.filter((card) => card.mastered).length,
    [flashcards]
  );
  const flashcardMasteryRate = useMemo(
    () =>
      totalFlashcards > 0
        ? Math.round((masteredFlashcards / totalFlashcards) * 100)
        : 0,
    [totalFlashcards, masteredFlashcards]
  );

  const flashcardsDifficultyBreakdown = useMemo(() => {
    const breakdown = {
      easy: { total: 0, mastered: 0 },
      medium: { total: 0, mastered: 0 },
      hard: { total: 0, mastered: 0 },
    };
    flashcards.forEach((card) => {
      const diff = card.difficulty || 'medium';
      if (breakdown[diff]) {
        breakdown[diff].total += 1;
        if (card.mastered) breakdown[diff].mastered += 1;
      }
    });
    return breakdown;
  }, [flashcards]);

  // Calculate Quiz Stats
  const totalQuizzes = quizResults.length;
  const avgQuizScore = useMemo(() => {
    if (quizResults.length === 0) return 0;
    const totalPercentage = quizResults.reduce((acc, q) => {
      const pct =
        typeof q.percentage === 'number'
          ? q.percentage
          : q.totalQuestions > 0
          ? Math.round((q.score / q.totalQuestions) * 100)
          : 0;
      return acc + pct;
    }, 0);
    return Math.round(totalPercentage / quizResults.length);
  }, [quizResults]);

  // Calculate Study Plan Completion Stats
  const totalStudyPlanItems = studyPlan.length;
  const completedStudyPlanItems = useMemo(
    () => studyPlan.filter((item) => item.completed).length,
    [studyPlan]
  );
  const studyPlanCompletionRate = useMemo(
    () =>
      totalStudyPlanItems > 0
        ? Math.round((completedStudyPlanItems / totalStudyPlanItems) * 100)
        : 0,
    [totalStudyPlanItems, completedStudyPlanItems]
  );

  // Format Recharts Chart Data (chronological order)
  const chartData = useMemo(() => {
    if (!quizResults || quizResults.length === 0) return [];

    return quizResults.map((result: QuizResult, index: number) => {
      const dateObj = new Date(result.date);
      const formattedDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })
        : `Quiz #${index + 1}`;

      const fullDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : `Attempt ${index + 1}`;

      const pct =
        typeof result.percentage === 'number'
          ? result.percentage
          : result.totalQuestions > 0
          ? Math.round((result.score / result.totalQuestions) * 100)
          : 0;

      const formattedTime =
        result.timeTaken && result.timeTaken > 0
          ? `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`
          : undefined;

      return {
        name: `Q${index + 1}`,
        fullLabel: `Quiz ${index + 1}`,
        score: pct,
        rawScore: result.score,
        total: result.totalQuestions,
        dateFormatted: fullDate,
        displayDate: formattedDate,
        timeTakenFormatted: formattedTime,
      };
    });
  }, [quizResults]);

  // Recent Quizzes (sorted most recent first)
  const recentQuizzes = useMemo(() => {
    return [...quizResults]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [quizResults]);

  // Calculate total pages across uploaded documents
  const totalPages = useMemo(
    () => documents.reduce((sum, doc) => sum + (doc.pageCount || 1), 0),
    [documents]
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-4 md:p-6 lg:p-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider uppercase text-purple-400">
              Analytics & Overview
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Progress <span className="gradient-text">Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor your study materials, knowledge retention, and quiz performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">
              {documents.length > 0 ? 'Active Study Session' : 'Workspace Ready'}
            </span>
          </div>
        </div>
      </div>

      {/* 4-Column Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Stat 1: Documents Uploaded */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="glass-card p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Documents Uploaded
            </span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {documents.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {documents.length === 1 ? 'file' : 'files'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
            <span>{totalPages} total pages</span>
            <button
              onClick={() => setActiveView('upload')}
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors"
            >
              Manage <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Stat 2: Flashcards Mastered */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="glass-card p-5 relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Flashcards Mastered
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {masteredFlashcards}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {totalFlashcards} cards
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
            <span className="text-indigo-300 font-medium">
              {flashcardMasteryRate}% mastered
            </span>
            <button
              onClick={() => setActiveView('flashcards')}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
            >
              Practice <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Stat 3: Quizzes Taken */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="glass-card p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Quizzes Taken
            </span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {totalQuizzes}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {totalQuizzes === 1 ? 'completed' : 'completed'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
            <span>
              {totalQuizzes > 0
                ? `${quizResults[quizResults.length - 1]?.score || 0}/${
                    quizResults[quizResults.length - 1]?.totalQuestions || 0
                  } on last test`
                : 'No tests yet'}
            </span>
            <button
              onClick={() => setActiveView('quiz')}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
            >
              Start Quiz <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Stat 4: Avg Quiz Score */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="glass-card p-5 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 -mt-3 -mr-3 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Avg Quiz Score
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {totalQuizzes > 0 ? `${avgQuizScore}%` : '—'}
            </span>
            <span className="text-xs text-slate-400 font-medium">overall</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60">
            <span
              className={
                avgQuizScore >= 80
                  ? 'text-emerald-400 font-medium'
                  : avgQuizScore >= 60
                  ? 'text-amber-400 font-medium'
                  : 'text-slate-400'
              }
            >
              {totalQuizzes === 0
                ? 'Take a quiz to score'
                : avgQuizScore >= 80
                ? 'Excellent mastery'
                : avgQuizScore >= 60
                ? 'Good progress'
                : 'Needs review'}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              {totalQuizzes > 0 ? `${totalQuizzes} tests` : '0 tests'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid: Quiz Score Chart & Mastery Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Score Chart (2 cols on large screen) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="lg:col-span-2 glass-card p-5 md:p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Quiz Score History
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Chronological progression of scores across all completed quizzes
                </p>
              </div>

              {chartData.length > 0 && (
                <div className="flex items-center gap-3 self-start sm:self-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="w-3 h-3 rounded bg-gradient-to-t from-indigo-500 to-purple-500 inline-block" />
                    <span>Score (%)</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                    {chartData.length} records
                  </span>
                </div>
              )}
            </div>

            {/* Recharts Container / Empty State */}
            <div className="w-full h-72 md:h-80 flex items-center justify-center">
              {chartData.length > 0 && mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="purpleBarGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient
                        id="purpleBarHighlight"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#c084fc" stopOpacity={1} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.85} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(100, 100, 180, 0.12)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(100, 100, 180, 0.2)' }}
                      dy={6}
                    />
                    <YAxis
                      domain={[0, 100]}
                      ticks={[0, 25, 50, 75, 100]}
                      stroke="#94a3b8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(100, 100, 180, 0.2)' }}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }}
                    />
                    <Bar
                      dataKey="score"
                      fill="url(#purpleBarGrad)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={48}
                      animationDuration={1000}
                    >
                      {chartData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={
                            entry.score >= 80
                              ? 'url(#purpleBarHighlight)'
                              : 'url(#purpleBarGrad)'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3 shadow-inner">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    No quiz data yet
                  </h3>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Complete your first quiz to generate comprehensive score analytics, accuracy metrics, and visual performance trends.
                  </p>
                  <button
                    onClick={() => setActiveView('quiz')}
                    className="min-h-[44px] px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md hover:shadow-purple-500/20 transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:scale-95"
                  >
                    Take a Quiz Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chart footer stats */}
          {chartData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wide">
                  Highest Score
                </span>
                <span className="text-sm font-bold text-emerald-400">
                  {Math.max(...chartData.map((d) => d.score))}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wide">
                  Latest Score
                </span>
                <span className="text-sm font-bold text-purple-300">
                  {chartData[chartData.length - 1]?.score}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wide">
                  Average Score
                </span>
                <span className="text-sm font-bold text-indigo-300">
                  {avgQuizScore}%
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Progress & Mastery Column */}
        <div className="space-y-6">
          {/* Flashcard Mastery Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
            className="glass-card p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Flashcard Mastery
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Retention across study decks
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-indigo-300 font-mono">
                {flashcardMasteryRate}%
              </span>
            </div>

            {totalFlashcards > 0 ? (
              <div className="space-y-4">
                {/* Main Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                    <span>
                      {masteredFlashcards} of {totalFlashcards} mastered
                    </span>
                    <span className="text-slate-400">
                      {totalFlashcards - masteredFlashcards} in progress
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-indigo-500/20">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-violet-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${flashcardMasteryRate}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Difficulty Breakdown */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Breakdown by Difficulty
                  </span>
                  {(['easy', 'medium', 'hard'] as const).map((diff) => {
                    const stats = flashcardsDifficultyBreakdown[diff];
                    const pct =
                      stats.total > 0
                        ? Math.round((stats.mastered / stats.total) * 100)
                        : 0;
                    const badgeColor =
                      diff === 'easy'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : diff === 'medium'
                        ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                        : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

                    return (
                      <div
                        key={diff}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/40 border border-slate-800/40"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${badgeColor}`}
                          >
                            {diff}
                          </span>
                          <span className="text-slate-300">
                            {stats.mastered}/{stats.total}
                          </span>
                        </div>
                        <span className="font-mono text-slate-400">{pct}%</span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setActiveView('flashcards')}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Continue Flashcard Review
                </button>
              </div>
            ) : (
              <div className="text-center py-6 px-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-2">
                  <Layers className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-300 mb-1">
                  No flashcards yet
                </p>
                <p className="text-[11px] text-slate-500 mb-3">
                  Generate flashcards from your documents to begin tracking mastery.
                </p>
                <button
                  onClick={() => setActiveView('flashcards')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 transition-colors"
                >
                  Create Flashcards
                </button>
              </div>
            )}
          </motion.div>

          {/* Study Plan Completion Progress Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
            className="glass-card p-5 md:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Study Plan Completion
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Milestones and syllabus progress
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-300 font-mono">
                {studyPlanCompletionRate}%
              </span>
            </div>

            {totalStudyPlanItems > 0 ? (
              <div className="space-y-4">
                {/* Main Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                    <span>
                      {completedStudyPlanItems} of {totalStudyPlanItems} tasks done
                    </span>
                    <span className="text-slate-400">
                      {totalStudyPlanItems - completedStudyPlanItems} pending
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${studyPlanCompletionRate}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Study plan quick status */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  {studyPlan.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/40 border border-slate-800/40 gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 shrink-0 ${
                            item.completed
                              ? 'text-emerald-400'
                              : 'text-slate-600'
                          }`}
                        />
                        <span
                          className={`truncate ${
                            item.completed
                              ? 'text-slate-400 line-through'
                              : 'text-slate-200'
                          }`}
                        >
                          {item.topic}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {item.duration}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setActiveView('study-plan')}
                  className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Target className="w-3.5 h-3.5" />
                  View Full Study Plan
                </button>
              </div>
            ) : (
              <div className="text-center py-6 px-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
                  <Target className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-300 mb-1">
                  No study plan yet
                </p>
                <p className="text-[11px] text-slate-500 mb-3">
                  Generate an AI-powered study roadmap to track your daily goals.
                </p>
                <button
                  onClick={() => setActiveView('study-plan')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 transition-colors"
                >
                  Generate Plan
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Recent Quiz Results List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.4 }}
        className="glass-card p-5 md:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Recent Quiz Results
              </h2>
              <p className="text-xs text-slate-400">
                Detailed breakdown of recent quiz attempts and accuracies
              </p>
            </div>
          </div>

          {recentQuizzes.length > 0 && (
            <button
              onClick={() => setActiveView('quiz')}
              className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium transition-colors self-start sm:self-auto"
            >
              Take another quiz <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {recentQuizzes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3 font-medium">Attempt</th>
                  <th className="py-3 px-3 font-medium">Date & Time</th>
                  <th className="py-3 px-3 font-medium">Score</th>
                  <th className="py-3 px-3 font-medium">Accuracy</th>
                  <th className="py-3 px-3 font-medium">Time Taken</th>
                  <th className="py-3 px-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentQuizzes.map((result, idx) => {
                  const pct =
                    typeof result.percentage === 'number'
                      ? result.percentage
                      : result.totalQuestions > 0
                      ? Math.round((result.score / result.totalQuestions) * 100)
                      : 0;

                  const dateObj = new Date(result.date);
                  const formattedDate = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent';

                  const formattedTime = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  const duration =
                    result.timeTaken && result.timeTaken > 0
                      ? `${Math.floor(result.timeTaken / 60)}m ${
                          result.timeTaken % 60
                        }s`
                      : '—';

                  const badgeClass =
                    pct >= 80
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : pct >= 60
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

                  const statusLabel =
                    pct >= 80 ? 'Mastered' : pct >= 60 ? 'Passed' : 'Needs Work';

                  return (
                    <tr
                      key={result.id || `quiz-${idx}`}
                      className="hover:bg-slate-900/40 transition-colors group"
                    >
                      <td className="py-3.5 px-3 font-medium text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                          #{quizResults.length - idx}
                        </div>
                        <span className="group-hover:text-purple-300 transition-colors">
                          Assessment #{quizResults.length - idx}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                          {formattedTime && (
                            <span className="text-slate-500 text-[10px]">
                              {formattedTime}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-200 font-semibold">
                        {result.score}{' '}
                        <span className="text-slate-500 font-normal">
                          / {result.totalQuestions}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                pct >= 80
                                  ? 'bg-emerald-400'
                                  : pct >= 60
                                  ? 'bg-amber-400'
                                  : 'bg-rose-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono font-medium text-slate-300">
                            {pct}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{duration}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClass}`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              No recent quiz results
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
              You haven&apos;t completed any quizzes yet. Test your knowledge on your study materials to view quiz histories here.
            </p>
            <button
              onClick={() => setActiveView('quiz')}
              className="min-h-[44px] px-5 py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-md transition-all flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:scale-95"
            >
              Start Your First Quiz
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
