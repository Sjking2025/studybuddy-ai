'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import {
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useStudyStore } from '@/lib/store';
import { Flashcard } from '@/lib/types';

export default function FlashCards() {
  const {
    flashcards,
    setFlashcards,
    toggleFlashcardMastered,
    documents,
    getDocumentContent,
    setActiveView,
  } = useStudyStore();

  const [mounted, setMounted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [direction, setDirection] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalCards = flashcards.length;
  const hasDocuments = mounted ? documents.length > 0 : false;

  // Ensure currentIndex stays within bounds
  useEffect(() => {
    if (totalCards === 0) {
      setCurrentIndex(0);
      setIsFlipped(false);
    } else if (currentIndex >= totalCards) {
      setCurrentIndex(totalCards - 1);
      setIsFlipped(false);
    }
  }, [totalCards, currentIndex]);

  const currentCard: Flashcard | undefined = flashcards[currentIndex];

  const masteredCount = useMemo(() => {
    return flashcards.filter((card) => card.mastered).length;
  }, [flashcards]);

  const progressPercentage = useMemo(() => {
    if (totalCards === 0) return 0;
    return Math.round((masteredCount / totalCards) * 100);
  }, [masteredCount, totalCards]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setDirection(1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalCards]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleResetSession = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setDirection(0);
  }, []);

  // Keyboard navigation: Left, Right, Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is interacting with form controls
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (totalCards === 0 || isLoading) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, totalCards, isLoading]);

  // Generate flashcards from documents
  const handleGenerateFlashcards = async () => {
    const content = getDocumentContent();
    if (!content || !content.trim()) {
      setError('Please upload documents with study content first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/flashcards', {
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
            `Failed to generate flashcards (HTTP ${response.status})`
        );
      }

      const data: { flashcards: Flashcard[] } = await response.json();

      if (data.flashcards && Array.isArray(data.flashcards) && data.flashcards.length > 0) {
        setFlashcards(data.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setDirection(0);
      } else {
        throw new Error('No flashcards were returned by the AI. Please try again.');
      }
    } catch (err: unknown) {
      console.error('Error generating flashcards:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while generating flashcards.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyBadge = (difficulty: Flashcard['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            Easy
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            Medium
          </span>
        );
      case 'hard':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
            Hard
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
            Normal
          </span>
        );
    }
  };

  const cardVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : dir < 0 ? -80 : 0,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.28,
        ease: 'easeOut',
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : dir < 0 ? 80 : 0,
      opacity: 0,
      scale: 0.96,
      transition: {
        duration: 0.2,
        ease: 'easeIn',
      },
    }),
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI <span className="brand-title">Flashcards</span>
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
              Active Recall
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Master complex concepts through AI-generated questions and spaced repetition.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {totalCards > 0 && (
            <button
              type="button"
              onClick={handleResetSession}
              disabled={isLoading}
              title="Restart session from first card"
              className="min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-[#12141e] hover:bg-[#161926] border border-white/[0.08] transition-all shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-blue-400" />
              <span>Restart</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleGenerateFlashcards}
            disabled={isLoading || (!hasDocuments && totalCards === 0)}
            className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>{totalCards > 0 ? 'Regenerate Flashcards' : 'Generate Flashcards'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Warning if no documents uploaded */}
      {mounted && !hasDocuments && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="studio-card p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-100">
                No study documents uploaded yet
              </p>
              <p className="text-xs text-amber-300/80">
                Upload your study materials, lecture slides, or notes to generate customized AI flashcards.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('upload')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors shrink-0 cursor-pointer"
          >
            Go to Upload
          </button>
        </motion.div>
      )}

      {/* Error Banner */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="studio-card p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between gap-3 text-rose-200"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs text-rose-300 hover:text-white underline shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Progress Bar (when cards exist) */}
      {totalCards > 0 && (
        <div className="studio-card p-4 rounded-xl border border-white/[0.08] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Mastery Progress:</span>
              <span className="text-white font-semibold">
                {masteredCount} of {totalCards} Mastered
              </span>
            </div>
            <span className="text-blue-400 font-bold font-mono">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#090A0F] rounded-full overflow-hidden border border-white/[0.08] p-0.5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 shadow-sm shadow-blue-500/30"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Main Flashcard Stage */}
      {isLoading ? (
        /* Loading State */
        <div className="studio-card min-h-[380px] sm:min-h-[420px] rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-blue-500/20 bg-[#12141e]">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-blue-400" />
            </div>
            <Loader2 className="w-7 h-7 text-blue-400 animate-spin absolute -bottom-2 -right-2 bg-[#090A0F] rounded-full p-0.5" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Synthesizing Flashcards...
          </h3>
          <p className="text-sm text-slate-400 max-w-md leading-relaxed">
            Our AI model is extracting key concepts, active-recall questions, and core definitions from your study documents.
          </p>
        </div>
      ) : totalCards > 0 && currentCard ? (
        /* Flashcard Active View */
        <div className="flex flex-col items-center gap-6">
          {/* Large Centered Card Container with AnimatePresence */}
          <div className="relative w-full max-w-2xl min-h-[360px] sm:min-h-[400px] flex items-center justify-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentCard.id}
                custom={direction}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full h-full flex justify-center"
              >
                {/* 3D Flip Card Shell using globals.css classes */}
                <div
                  className="flashcard-flip w-full h-[360px] sm:h-[400px] cursor-pointer select-none group"
                  onClick={handleFlip}
                  role="button"
                  tabIndex={0}
                  aria-label={`Flashcard ${currentIndex + 1} of ${totalCards}. ${
                    isFlipped ? 'Showing answer' : 'Showing question'
                  }. Click or press space to flip.`}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleFlip();
                    }
                  }}
                >
                  <div
                    className={`flashcard-inner relative w-full h-full rounded-2xl ${
                      isFlipped ? 'flipped' : ''
                    }`}
                  >
                    {/* Front Side: Question */}
                    <div className="flashcard-front studio-card-elevated rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-white/[0.1] bg-[#12141e] shadow-2xl shadow-black/50">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
                            Question
                          </span>
                          {getDifficultyBadge(currentCard.difficulty)}
                        </div>

                        {/* Mastered Status Indicator */}
                        {currentCard.mastered && (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                            <Check className="w-3.5 h-3.5" />
                            <span>Mastered</span>
                          </div>
                        )}
                      </div>

                      {/* Middle: Question Text */}
                      <div className="my-auto py-4 overflow-y-auto max-h-[220px] pr-2">
                        <p className="text-lg sm:text-xl md:text-2xl font-medium text-slate-100 leading-relaxed text-center">
                          {currentCard.front}
                        </p>
                      </div>

                      {/* Bottom Hint Bar */}
                      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.08] pt-3">
                        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-blue-300 transition-colors">
                          <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                          <span>Click card or press Space to reveal answer</span>
                        </div>
                        <span className="font-mono text-slate-500 text-[11px]">
                          Front Side
                        </span>
                      </div>
                    </div>

                    {/* Back Side: Answer */}
                    <div className="flashcard-back studio-card-elevated rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-amber-500/30 bg-[#14161f] shadow-2xl shadow-black/50">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                            Answer
                          </span>
                          {getDifficultyBadge(currentCard.difficulty)}
                        </div>

                        {/* Mastered Status Indicator */}
                        {currentCard.mastered && (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                            <Check className="w-3.5 h-3.5" />
                            <span>Mastered</span>
                          </div>
                        )}
                      </div>

                      {/* Middle: Answer Text */}
                      <div className="my-auto py-4 overflow-y-auto max-h-[220px] pr-2">
                        <p className="text-base sm:text-lg text-slate-200 leading-relaxed text-center sm:text-left">
                          {currentCard.back}
                        </p>
                      </div>

                      {/* Bottom Hint Bar */}
                      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-white/[0.08] pt-3">
                        <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-amber-300 transition-colors">
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Click card or press Space to view question</span>
                        </div>
                        <span className="font-mono text-slate-500 text-[11px]">
                          Back Side
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation & Controls Bar */}
          <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl studio-card border border-white/[0.08]">
            {/* Previous Card Button */}
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-[#161926] hover:bg-[#1a1e2e] disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.08] transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Previous flashcard"
            >
              <ChevronLeft className="w-4 h-4 text-blue-400" />
              <span>Previous</span>
            </button>

            {/* Middle Group: Card Counter + Mastered Toggle */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-slate-300 select-none">
                Card <strong className="text-white font-bold">{currentIndex + 1}</strong> of{' '}
                <strong className="text-white font-bold">{totalCards}</strong>
              </span>

              {/* Mark Mastered Toggle Button */}
              <button
                type="button"
                onClick={() => toggleFlashcardMastered(currentCard.id)}
                className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  currentCard.mastered
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 shadow-md shadow-emerald-950/20'
                    : 'bg-[#161926] text-slate-300 border border-white/[0.08] hover:bg-[#1a1e2e] hover:text-white'
                }`}
              >
                <Check
                  className={`w-3.5 h-3.5 ${
                    currentCard.mastered ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                />
                <span>{currentCard.mastered ? 'Mastered' : 'Mark Mastered'}</span>
              </button>
            </div>

            {/* Next Card Button */}
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex === totalCards - 1}
              className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-[#161926] hover:bg-[#1a1e2e] disabled:opacity-40 disabled:cursor-not-allowed border border-white/[0.08] transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Next flashcard"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-blue-400" />
            </button>
          </div>

          {/* Keyboard Shortcuts Hint Bar */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 select-none">
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-[#090A0F] border border-white/[0.1] text-slate-300 font-mono text-[11px] shadow-sm">
                ←
              </kbd>
              <span>Previous</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-[#090A0F] border border-white/[0.1] text-slate-300 font-mono text-[11px] shadow-sm">
                Space
              </kbd>
              <span>Flip Card</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-2 py-0.5 rounded bg-[#090A0F] border border-white/[0.1] text-slate-300 font-mono text-[11px] shadow-sm">
                →
              </kbd>
              <span>Next</span>
            </span>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="studio-card min-h-[380px] sm:min-h-[420px] rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-white/[0.08]">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400 shadow-md shadow-blue-500/5">
            <Sparkles className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            No Flashcards Generated Yet
          </h3>

          <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
            Generate high-yield flashcards with tailored difficulty levels from your uploaded documents to boost memory retention with active recall.
          </p>

          {hasDocuments ? (
            <button
              type="button"
              onClick={handleGenerateFlashcards}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md shadow-blue-600/25 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Generate Flashcards Now</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView('upload')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#161926] hover:bg-[#1a1e2e] border border-white/[0.08] transition-all active:scale-95 cursor-pointer"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Upload Documents First</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
