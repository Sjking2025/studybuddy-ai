'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudyStore } from '@/lib/store';
import { QuizQuestion, QuizResult } from '@/lib/types';

// Fallback high-yield demo questions for instant testing & resilient offline operation
const DEMO_QUESTIONS: QuizQuestion[] = [
  {
    id: 'demo-q1',
    question: 'What is the primary function of the Self-Attention mechanism in Transformer architectures?',
    options: [
      'Compressing sequence lengths into fixed-size convolutional feature maps',
      'Computing pairwise relationship weights dynamically across all tokens simultaneously',
      'Enforcing strict sequential dependencies through recurrent hidden state updates',
      'Generating synthetic negative training pairs for contrastive loss optimization',
    ],
    correctAnswer: 1,
    explanation:
      'Self-attention calculates attention scores between all positions in a sequence at once, allowing the model to capture long-range contextual relationships without sequential recurrent bottlenecks.',
    topic: 'Machine Learning',
  },
  {
    id: 'demo-q2',
    question: 'What time complexity does searching a balanced Binary Search Tree (such as an AVL or Red-Black Tree) achieve?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 1,
    explanation:
      'Because self-balancing trees maintain a maximum height strictly proportional to log2(n), search, insertion, and deletion operations run in logarithmic time O(log n).',
    topic: 'Data Structures',
  },
  {
    id: 'demo-q3',
    question: 'In the ACID database model, which guarantee ensures that concurrent transactions execute without cross-transaction interference?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctAnswer: 2,
    explanation:
      'Isolation ensures that intermediate states of concurrent transactions are invisible to one another, preventing dirty reads and race conditions.',
    topic: 'Database Systems',
  },
  {
    id: 'demo-q4',
    question: 'What is the primary purpose of React\'s useMemo hook in component optimization?',
    options: [
      'Directly persisting state values across browser session reloads',
      'Attaching custom event listeners to browser window resize events',
      'Caching the computed result of an expensive calculation between renders',
      'Triggering asynchronous data fetching during the initial mount phase',
    ],
    correctAnswer: 2,
    explanation:
      'useMemo memoizes the return value of a computational function, skipping recalculation on subsequent renders unless designated dependency values change.',
    topic: 'Frontend Development',
  },
  {
    id: 'demo-q5',
    question: 'Which HTTP status code communicates that a request lacks valid authentication credentials for the requested resource?',
    options: ['400 Bad Request', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
    correctAnswer: 1,
    explanation:
      'HTTP 401 Unauthorized indicates that the client request has not been completed because it lacks valid authentication credentials, whereas 403 Forbidden means credentials were provided but access is denied.',
    topic: 'Web Protocols',
  },
];

type QuizStage = 'start' | 'in-progress' | 'results';

interface AnswerRecord {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export default function QuizMode() {
  const {
    quizQuestions,
    setQuizQuestions,
    addQuizResult,
    documents,
    getDocumentContent,
  } = useStudyStore();

  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<QuizStage>('start');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<AnswerRecord[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Prevent hydration mismatch with Zustand persist store
  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer handling during the quiz
  useEffect(() => {
    if (stage === 'in-progress') {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [stage]);

  // Format seconds as mm:ss
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate Quiz from Documents via POST /api/quiz
  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    const docContent = getDocumentContent();
    const trimmedContent = docContent?.trim() || '';

    if (!trimmedContent) {
      setErrorMessage(
        'No study material found. Please upload notes or documents in the Upload section first, or start with demo questions below.'
      );
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: trimmedContent }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Quiz generation request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error('AI was unable to extract valid questions from the provided content.');
      }

      setQuizQuestions(data.questions);
      startQuizSession(data.questions);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to generate quiz. Please check your connection and try again.';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Start with existing or custom questions
  const startQuizSession = (questionsToUse: QuizQuestion[]) => {
    if (!questionsToUse || questionsToUse.length === 0) {
      setErrorMessage('No questions are loaded. Generate a quiz or load demo questions first.');
      return;
    }
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setElapsedTime(0);
    setErrorMessage(null);
    setStage('in-progress');
  };

  // Load demo sample questions
  const handleLoadDemoQuestions = () => {
    setQuizQuestions(DEMO_QUESTIONS);
    startQuizSession(DEMO_QUESTIONS);
  };

  // Handle option selection
  const handleSelectOption = (optionIndex: number) => {
    if (selectedOption !== null) return; // Prevent changing answer after selection

    const currentQuestion = quizQuestions[currentIndex];
    if (!currentQuestion) return;

    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const newRecord: AnswerRecord = {
      questionId: currentQuestion.id,
      selectedAnswer: optionIndex,
      isCorrect,
    };

    setUserAnswers((prev) => [...prev, newRecord]);
  };

  // Advance to next question or conclude quiz
  const handleNextQuestion = () => {
    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      finishQuiz();
    }
  };

  // Complete quiz and persist result to store
  const finishQuiz = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const currentQuestions = quizQuestions;
    const totalQuestions = currentQuestions.length;
    const correctCount = userAnswers.filter((a) => a.isCorrect).length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const quizResult: QuizResult = {
      id: `quiz-result-${Date.now()}`,
      score: correctCount,
      totalQuestions,
      percentage,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timeTaken: elapsedTime,
      answers: userAnswers,
    };

    addQuizResult(quizResult);
    setStage('results');
  }, [quizQuestions, userAnswers, elapsedTime, addQuizResult]);

  // Retake current quiz
  const handleRetakeQuiz = () => {
    startQuizSession(quizQuestions);
  };

  // Return to start screen for a new quiz
  const handleNewQuiz = () => {
    setStage('start');
    setCurrentIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setElapsedTime(0);
    setErrorMessage(null);
  };

  // Hydration fallback
  if (!mounted) {
    return (
      <div className="w-full flex items-center justify-center min-h-[450px]">
        <div className="glass-card p-8 flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-sm font-medium">Initializing Quiz Module...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];
  const totalQuestions = quizQuestions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Final score calculations for results screen
  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Determine score circle color: >70%=green, >40%=yellow, <40%=red
  const getScoreCircleStyles = (percentage: number) => {
    if (percentage > 70) {
      return {
        stroke: '#10b981', // green / emerald-500
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        glow: 'rgba(16, 185, 129, 0.35)',
        badge: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40',
        headline: 'Outstanding Mastery!',
        feedback: 'You have demonstrated a stellar understanding of the core concepts.',
      };
    }
    if (percentage > 40) {
      return {
        stroke: '#f59e0b', // yellow / amber-500
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        glow: 'rgba(245, 158, 11, 0.35)',
        badge: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
        headline: 'Solid Progress!',
        feedback: 'Good work! Review the explanations below to turn weak spots into strengths.',
      };
    }
    return {
      stroke: '#f43f5e', // red / rose-500
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      glow: 'rgba(244, 63, 94, 0.35)',
      badge: 'text-rose-300 bg-rose-500/20 border-rose-500/40',
      headline: 'Needs Review',
      feedback: 'Take some time to re-read your uploaded notes and try the quiz again.',
    };
  };

  const scoreTheme = getScoreCircleStyles(scorePercentage);

  // SVG circular progress calculation
  const circleRadius = 56;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (scorePercentage / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ========================================================== */}
      {/* 1. START SCREEN */}
      {/* ========================================================== */}
      {stage === 'start' && (
        <motion.div
          key="start-stage"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Header Banner */}
          <div className="glass-card p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI-Powered Knowledge Check</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
                  Interactive <span className="gradient-text">Quiz Mode</span>
                </h1>
                <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
                  Challenge your comprehension with adaptive multiple choice questions synthesized
                  directly from your study notes and uploaded documents.
                </p>
              </div>

              {/* Status Badge */}
              <div className="glass-card p-4 rounded-xl border border-slate-700/60 bg-slate-900/60 flex flex-col gap-1.5 shrink-0 min-w-[200px]">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Knowledge Base:</span>
                  <span
                    className={`font-semibold ${
                      documents.length > 0 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {documents.length > 0 ? 'Ready' : 'Empty'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      documents.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-sm font-semibold text-white">
                    {documents.length === 0
                      ? '0 Documents'
                      : documents.length === 1
                      ? '1 Document loaded'
                      : `${documents.length} Documents loaded`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error / Warning Alert */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-300 flex items-start gap-3.5 text-sm"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Notice</p>
                <p className="text-rose-300/90 mt-0.5">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          {/* If No Documents Uploaded */}
          {documents.length === 0 && (
            <div className="glass-card p-5 border border-amber-500/30 bg-amber-500/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-200">
                    No study documents uploaded yet
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Upload your class notes, textbooks, or PDFs to generate customized questions, or
                    test out Quiz Mode right now using our built-in sample questions.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLoadDemoQuestions}
                className="shrink-0 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-200 hover:bg-amber-500/30 border border-amber-500/40 transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Try Demo Quiz</span>
              </button>
            </div>
          )}

          {/* Actions & Start Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Generate Quiz Card */}
            <div className="glass-card p-6 flex flex-col justify-between gap-4 border border-purple-500/20 hover:border-purple-500/40 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Generate From Notes</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Analyze your uploaded documents using Google Gemini to construct realistic
                  multiple-choice questions with comprehensive answer explanations.
                </p>
              </div>

              <button
                type="button"
                disabled={isGenerating || documents.length === 0}
                onClick={handleGenerateQuiz}
                className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                    <span>Synthesizing Questions with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-purple-200 group-hover:rotate-12 transition-transform" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>

            {/* Existing Quiz / Instant Demo Card */}
            <div className="glass-card p-6 flex flex-col justify-between gap-4 border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Play className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {quizQuestions.length > 0 ? 'Loaded Quiz Session' : 'Quick Practice Session'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {quizQuestions.length > 0
                    ? `You currently have ${quizQuestions.length} questions prepared and ready in memory. You can jump straight in or generate fresh ones.`
                    : 'Jump straight into an interactive test session immediately with curated computer science and AI practice questions.'}
                </p>
              </div>

              {quizQuestions.length > 0 ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startQuizSession(quizQuestions)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Quiz ({quizQuestions.length} Qs)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadDemoQuestions}
                    title="Load sample questions"
                    className="py-3 px-3 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLoadDemoQuestions}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-purple-400" />
                  <span>Start Demo Quiz</span>
                </button>
              )}
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {[
              {
                icon: Clock,
                title: 'Timed Pressure',
                desc: 'Real-time timer tracks your pace',
              },
              {
                icon: CheckCircle,
                title: 'Instant Feedback',
                desc: 'Immediate correct/wrong answers',
              },
              {
                icon: Sparkles,
                title: 'In-Depth Explanations',
                desc: 'Clear rationales for every option',
              },
              {
                icon: Trophy,
                title: 'Performance Score',
                desc: 'Automatic analytics & stored results',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-3.5 border border-slate-800/80 flex flex-col gap-1.5"
                >
                  <Icon className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-slate-200">{feature.title}</span>
                  <span className="text-[11px] text-slate-400">{feature.desc}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ========================================================== */}
      {/* 2. IN-PROGRESS QUESTION DISPLAY */}
      {/* ========================================================== */}
      {stage === 'in-progress' && currentQuestion && (
        <motion.div
          key={`question-${currentIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="space-y-5"
        >
          {/* Top Control Bar: Topic, Counter, and Timer */}
          <div className="glass-card p-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {currentQuestion.topic || 'General Knowledge'}
              </span>
              <span className="text-xs font-medium text-slate-400">
                Question <strong className="text-white">{currentIndex + 1}</strong> of{' '}
                <strong className="text-white">{totalQuestions}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Live Timer (mm:ss) */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-semibold shadow-inner">
                <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>{formatTime(elapsedTime)}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900/80 rounded-full h-2.5 p-0.5 border border-slate-800 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-400 rounded-full shadow-sm shadow-purple-500/50"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + (selectedOption !== null ? 1 : 0.5)) / totalQuestions) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Question Card */}
          <div className="glass-card p-6 md:p-8 space-y-6 border border-slate-700/50">
            {/* Prompt */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Question {currentIndex + 1}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            {/* 4 Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((optionText: string, optionIdx: number) => {
                const isSelected = selectedOption === optionIdx;
                const isCorrect = optionIdx === currentQuestion.correctAnswer;
                const hasAnswered = selectedOption !== null;

                // Color styles: correct=green, wrong=red
                let buttonStyle =
                  'border-slate-700/60 bg-slate-900/40 text-slate-200 hover:border-purple-500/50 hover:bg-slate-800/60';
                let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

                if (hasAnswered) {
                  if (isSelected) {
                    if (isCorrect) {
                      buttonStyle =
                        'border-emerald-500 bg-emerald-500/20 text-emerald-200 shadow-md shadow-emerald-500/10';
                      badgeStyle = 'bg-emerald-500 text-white border-emerald-400';
                    } else {
                      buttonStyle =
                        'border-rose-500 bg-rose-500/20 text-rose-200 shadow-md shadow-rose-500/10';
                      badgeStyle = 'bg-rose-500 text-white border-rose-400';
                    }
                  } else if (isCorrect) {
                    // Reveal the actual correct answer if user got it wrong
                    buttonStyle =
                      'border-emerald-500/70 bg-emerald-500/10 text-emerald-300 shadow-sm';
                    badgeStyle = 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50';
                  } else {
                    buttonStyle = 'opacity-40 border-slate-800/80 bg-slate-950/20 text-slate-500';
                    badgeStyle = 'bg-slate-900 text-slate-600 border-slate-800';
                  }
                }

                const optionLetter = String.fromCharCode(65 + optionIdx); // 'A', 'B', 'C', 'D'

                return (
                  <button
                    key={optionIdx}
                    type="button"
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(optionIdx)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between gap-4 transition-all duration-200 group cursor-pointer ${buttonStyle}`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border transition-colors ${badgeStyle}`}
                      >
                        {optionLetter}
                      </span>
                      <span className="text-sm font-medium leading-relaxed truncate-3-lines">
                        {optionText}
                      </span>
                    </div>

                    {/* Result Icon on Right */}
                    {hasAnswered && (
                      <div className="shrink-0">
                        {isSelected && isCorrect && (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        )}
                        {isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
                        {!isSelected && isCorrect && (
                          <CheckCircle className="w-5 h-5 text-emerald-400/80" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Rationale */}
            <AnimatePresence>
              {selectedOption !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                  className={`p-4 rounded-xl border ${
                    selectedOption === currentQuestion.correctAnswer
                      ? 'border-emerald-500/30 bg-emerald-950/20'
                      : 'border-rose-500/30 bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {selectedOption === currentQuestion.correctAnswer ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-sm">
                      <p
                        className={`font-bold ${
                          selectedOption === currentQuestion.correctAnswer
                            ? 'text-emerald-300'
                            : 'text-rose-300'
                        }`}
                      >
                        {selectedOption === currentQuestion.correctAnswer
                          ? 'Correct!'
                          : `Incorrect — Option ${String.fromCharCode(
                              65 + currentQuestion.correctAnswer
                            )} is the correct answer`}
                      </p>
                      <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next / Finish Button */}
            {selectedOption !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end pt-2"
              >
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/25 transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>{isLastQuestion ? 'View Results' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* ========================================================== */}
      {/* 3. RESULTS SCREEN */}
      {/* ========================================================== */}
      {stage === 'results' && (
        <motion.div
          key="results-stage"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Main Results Hero Card */}
          <div className="glass-card p-6 md:p-8 relative overflow-hidden border border-slate-700/60">
            <div
              className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: scoreTheme.glow }}
            />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              {/* Left Column: Trophy & Message */}
              <div className="space-y-3 text-center md:text-left max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Quiz Summary</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                  {scoreTheme.headline}
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed">{scoreTheme.feedback}</p>

                {/* Retake & New Quiz Buttons */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetakeQuiz}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <RotateCcw className="w-4 h-4 text-purple-400" />
                    <span>Retake Quiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNewQuiz}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>New Quiz</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Score Circle */}
              {/* Score circle color: >70%=green, >40%=yellow, <40%=red */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                    {/* Background Track */}
                    <circle
                      cx="70"
                      cy="70"
                      r={circleRadius}
                      className="text-slate-800/80"
                      strokeWidth="9"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    {/* Active Score Arc */}
                    <motion.circle
                      cx="70"
                      cy="70"
                      r={circleRadius}
                      stroke={scoreTheme.stroke}
                      strokeWidth="9"
                      fill="transparent"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      strokeLinecap="round"
                      style={{ filter: `drop-shadow(0 0 8px ${scoreTheme.glow})` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className={`text-4xl font-extrabold tracking-tight ${scoreTheme.text}`}>
                      {scorePercentage}%
                    </span>
                    <span className="text-xs font-semibold text-slate-400 mt-0.5">
                      {correctCount} / {totalQuestions} Correct
                    </span>
                  </div>
                </div>

                <span
                  className={`mt-2 px-3 py-0.5 rounded-full text-xs font-bold border ${scoreTheme.badge}`}
                >
                  Score: {scorePercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-4 flex flex-col items-center justify-center text-center gap-1">
              <Trophy className="w-5 h-5 text-purple-400 mb-1" />
              <span className="text-xl font-bold text-white">
                {correctCount} / {totalQuestions}
              </span>
              <span className="text-xs text-slate-400">Total Score</span>
            </div>

            <div className="glass-card p-4 flex flex-col items-center justify-center text-center gap-1">
              <CheckCircle className="w-5 h-5 text-emerald-400 mb-1" />
              <span className="text-xl font-bold text-emerald-400">{scorePercentage}%</span>
              <span className="text-xs text-slate-400">Accuracy Rate</span>
            </div>

            <div className="glass-card p-4 flex flex-col items-center justify-center text-center gap-1">
              <Clock className="w-5 h-5 text-indigo-400 mb-1" />
              <span className="text-xl font-bold text-white font-mono">
                {formatTime(elapsedTime)}
              </span>
              <span className="text-xs text-slate-400">Time Taken</span>
            </div>

            <div className="glass-card p-4 flex flex-col items-center justify-center text-center gap-1">
              <XCircle className="w-5 h-5 text-rose-400 mb-1" />
              <span className="text-xl font-bold text-rose-400">
                {totalQuestions - correctCount}
              </span>
              <span className="text-xs text-slate-400">Incorrect</span>
            </div>
          </div>

          {/* Per-Question Detailed Review */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Per-Question Review</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  {quizQuestions.length} Questions
                </span>
              </h3>
            </div>

            <div className="space-y-4">
              {quizQuestions.map((q: QuizQuestion, idx: number) => {
                const answerRecord = userAnswers.find((a) => a.questionId === q.id);
                const wasAnswered = answerRecord !== undefined;
                const wasCorrect = answerRecord?.isCorrect ?? false;
                const chosenIdx = answerRecord?.selectedAnswer;

                return (
                  <div
                    key={q.id || idx}
                    className={`glass-card p-5 border transition-all ${
                      wasCorrect
                        ? 'border-emerald-500/25 bg-emerald-950/10'
                        : 'border-rose-500/25 bg-rose-950/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-purple-400">Question {idx + 1}</span>
                          {q.topic && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium">
                              {q.topic}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm md:text-base font-semibold text-slate-100">
                          {q.question}
                        </h4>
                      </div>

                      <div className="shrink-0">
                        {wasCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Incorrect</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Options Breakdown */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((optText: string, optIdx: number) => {
                        const isChosen = chosenIdx === optIdx;
                        const isCorrectOption = optIdx === q.correctAnswer;

                        let optBadgeClass = 'border-slate-800 bg-slate-900/40 text-slate-400';
                        if (isChosen && wasCorrect) {
                          optBadgeClass =
                            'border-emerald-500/60 bg-emerald-500/15 text-emerald-200 font-semibold';
                        } else if (isChosen && !wasCorrect) {
                          optBadgeClass =
                            'border-rose-500/60 bg-rose-500/15 text-rose-200 font-semibold';
                        } else if (isCorrectOption) {
                          optBadgeClass =
                            'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-medium';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${optBadgeClass}`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold opacity-70">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span className="truncate">{optText}</span>
                            </div>
                            <div className="shrink-0">
                              {isChosen && wasCorrect && (
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  Your Choice
                                </span>
                              )}
                              {isChosen && !wasCorrect && (
                                <span className="text-[10px] text-rose-400 font-bold">
                                  Your Choice
                                </span>
                              )}
                              {!isChosen && isCorrectOption && (
                                <span className="text-[10px] text-emerald-400 font-bold">
                                  Correct Answer
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="mt-3.5 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-purple-300">Explanation: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
