'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  MessageSquare,
  Layers,
  GitBranch,
  Calendar,
  Upload,
  Zap,
  ArrowRight,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Upload,
      title: 'Smart Upload',
      description:
        'Upload textbooks, lecture slides, and notes in PDF or TXT format. Instant content extraction and intelligent document chunking ready in seconds.',
      badge: 'Multi-Format Support',
      glow: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.25)]',
    },
    {
      icon: MessageSquare,
      title: 'AI Chat Tutor',
      description:
        'Engage in interactive Socratic dialogues. Ask questions about your study documents, request step-by-step solutions, and clarify difficult concepts 24/7.',
      badge: 'Context-Aware AI',
      glow: 'group-hover:border-indigo-500/50 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]',
    },
    {
      icon: Layers,
      title: 'Auto Flashcards',
      description:
        'Generate active-recall flashcard decks automatically from key terms. Track mastery with spaced-repetition difficulty ratings and interactive flip cards.',
      badge: 'Spaced Repetition',
      glow: 'group-hover:border-violet-500/50 group-hover:shadow-[0_0_25px_rgba(167,139,250,0.25)]',
    },
    {
      icon: Brain,
      title: 'Adaptive Quizzes',
      description:
        'Generate targeted multiple-choice practice tests with instant scoring, comprehensive answer rationales, and historical performance tracking.',
      badge: 'Instant Feedback',
      glow: 'group-hover:border-purple-500/50 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.25)]',
    },
    {
      icon: GitBranch,
      title: 'Mind Maps',
      description:
        'Visualize complex subject architectures with hierarchical, color-coded concept trees that reveal relationships between core principles and subtopics.',
      badge: 'Visual Synthesis',
      glow: 'group-hover:border-indigo-500/50 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]',
    },
    {
      icon: Calendar,
      title: 'Study Plans',
      description:
        'Receive custom, day-by-day revision schedules prioritized by exam deadlines and topic weightage to maximize retention without burnout.',
      badge: 'Smart Scheduling',
      glow: 'group-hover:border-violet-500/50 group-hover:shadow-[0_0_25px_rgba(167,139,250,0.25)]',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload',
      subtitle: 'Upload Your Materials',
      description:
        'Drop lecture notes, PDF textbooks, or research papers. Our local extractor digests text instantly with full privacy.',
      icon: Upload,
      accent: 'from-purple-500 to-indigo-500',
    },
    {
      number: '02',
      title: 'AI Processes',
      subtitle: 'Gemini AI Synthesis',
      description:
        'Google Gemini analyzes complex themes, derives key takeaways, and creates interactive flashcards, quizzes, and mind maps in real time.',
      icon: Zap,
      accent: 'from-indigo-500 to-purple-600',
    },
    {
      number: '03',
      title: 'Learn Interactively',
      subtitle: 'Master and Retain',
      description:
        'Quiz yourself, consult your personal AI tutor, test active recall, and follow your customized revision schedule to ace exams.',
      icon: GraduationCap,
      accent: 'from-purple-600 to-pink-500',
    },
  ];

  const techBadges = [
    { name: 'Next.js 16 (App Router)', color: 'text-white border-slate-700/60' },
    { name: 'TypeScript', color: 'text-blue-400 border-blue-500/30' },
    { name: 'Google Gemini AI', color: 'text-purple-300 border-purple-500/30' },
    { name: 'Tailwind CSS v4', color: 'text-cyan-300 border-cyan-500/30' },
    { name: 'Framer Motion v14', color: 'text-pink-400 border-pink-500/30' },
    { name: 'Zustand v5', color: 'text-amber-300 border-amber-500/30' },
    { name: 'Lucide React', color: 'text-indigo-300 border-indigo-500/30' },
    { name: 'Recharts', color: 'text-emerald-400 border-emerald-500/30' },
    { name: 'pdf-parse v2', color: 'text-rose-400 border-rose-500/30' },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a1a] text-slate-100 overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Dynamic Animated Background Gradients & Floating Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 animated-gradient opacity-40" />

        {/* Ambient floating orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 sm:w-[32rem] sm:h-[32rem] bg-purple-600/20 rounded-full blur-[100px]"
          animate={{
            x: [0, 80, 0],
            y: [0, 60, 0],
            scale: [1, 1.25, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/4 -right-40 w-96 h-96 sm:w-[30rem] sm:h-[30rem] bg-indigo-600/20 rounded-full blur-[110px]"
          animate={{
            x: [0, -70, 0],
            y: [0, 80, 0],
            scale: [1.1, 0.95, 1.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 left-1/4 w-80 h-80 sm:w-[28rem] sm:h-[28rem] bg-violet-600/15 rounded-full blur-[120px]"
          animate={{
            x: [0, 60, -50, 0],
            y: [0, -50, 40, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a1a]/70 border-b border-purple-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transition-all duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  StudyBuddy <span className="gradient-text font-black">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider text-purple-400 font-medium">
                  Hackathon Edition
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a
                href="#features"
                className="hover:text-purple-300 transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="hover:text-purple-300 transition-colors duration-200"
              >
                How It Works
              </a>
              <a
                href="#tech-stack"
                className="hover:text-purple-300 transition-colors duration-200"
              >
                Tech Stack
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
              >
                <span>Launch App</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* 1. HERO SECTION */}
        <section className="relative pt-12 sm:pt-20 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(139,92,246,0.15)]"
          >
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="font-semibold text-white">Prompt War Hackathon</span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span className="text-slate-300">Powered by Google Gemini</span>
          </motion.div>

          {/* Large Gradient Heading with Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-5xl"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.08] mb-6">
              <span className="gradient-text drop-shadow-[0_0_40px_rgba(139,92,246,0.35)]">
                StudyBuddy AI
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight mb-6">
              Your Intelligent Learning Companion
            </p>
          </motion.div>

          {/* Subtitle about transforming study materials */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-3xl text-base sm:text-xl text-slate-300 leading-relaxed font-normal mb-10"
          >
            Transform your study materials into interactive flashcards, adaptive quizzes,
            visual mind maps, and a personalized 24/7 AI tutor. Turn dense textbooks and lecture notes
            into effortless mastery.
          </motion.p>

          {/* CTA: "Get Started Free →" linking to /dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14"
          >
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-base text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.45)] hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-base text-slate-300 glass-card border border-purple-500/20 hover:text-white hover:border-purple-500/40 hover:bg-slate-900/60 transition-all duration-300 w-full sm:w-auto"
            >
              <BookOpen className="w-5 h-5 text-purple-400" />
              <span>See How It Works</span>
            </a>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="glass-card px-6 sm:px-10 py-4 border border-purple-500/25 shadow-[0_0_30px_rgba(139,92,246,0.12)] max-w-2xl w-full"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-sm sm:text-base font-semibold text-slate-200">
              <div className="flex items-center gap-2 text-purple-300">
                <Zap className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                <span>10x Faster Learning</span>
              </div>
              <span className="hidden sm:inline text-purple-500/50">•</span>
              <div className="flex items-center gap-2 text-indigo-300">
                <Brain className="w-4 h-4 text-indigo-400" />
                <span>AI-Powered</span>
              </div>
              <span className="hidden sm:inline text-purple-500/50">•</span>
              <div className="flex items-center gap-2 text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>100% Free</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Feature Preview Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="w-full mt-16 max-w-5xl rounded-2xl p-1 bg-gradient-to-b from-purple-500/30 via-indigo-500/10 to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-purple-500/20 text-left bg-[#0c0c24]/90 backdrop-blur-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-500/15 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    studybuddy-ai.workspace // active session
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini Flash AI Active
                </div>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Micro preview 1: Flashcard */}
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-purple-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> Spaced Card
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                        Mastered
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1">Q: Active Recall</p>
                    <p className="text-sm font-medium text-slate-200">
                      What is the primary role of the attention mechanism in Transformers?
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-purple-500/10 text-xs text-purple-300 font-medium">
                    Click card to reveal explanation →
                  </div>
                </div>

                {/* Micro preview 2: AI Tutor Chat */}
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-indigo-400 mb-2">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> AI Tutor
                      </span>
                      <span className="text-[10px] text-slate-400">Just now</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-200 border border-indigo-500/20">
                        &quot;Can you explain backpropagation in simple intuition?&quot;
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/60 text-slate-300 border border-slate-700/40">
                        &quot;Think of it like tuning guitar strings based on the sound you want...&quot;
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-indigo-500/10 text-xs text-indigo-300 font-medium">
                    Instant Socratic tutoring
                  </div>
                </div>

                {/* Micro preview 3: Quiz Score */}
                <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-violet-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5" /> Adaptive Quiz
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px]">
                        95% Accuracy
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1">Score Breakdown</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold gradient-text">19/20</span>
                      <span className="text-xs text-emerald-400 font-semibold">+35% vs baseline</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[95%] rounded-full" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-violet-500/10 text-xs text-violet-300 font-medium">
                    5 concepts mastered today
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 2. FEATURES SECTION */}
        <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Comprehensive Toolkit
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6"
            >
              Everything You Need to{' '}
              <span className="gradient-text">Master Any Subject</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-300 text-base sm:text-lg leading-relaxed"
            >
              Six powerful AI capabilities unified in one sleek, distraction-free environment
              engineered for high-velocity learning.
            </motion.p>
          </div>

          {/* 6 Responsive Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className={`group relative glass-card p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 border border-purple-500/15 ${feature.glow}`}
                >
                  {/* Decorative background glow inside card */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-[1rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:text-white group-hover:from-purple-600 group-hover:to-indigo-600 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-purple-500/10 flex items-center text-xs font-semibold text-purple-400 group-hover:text-purple-300">
                    <span className="flex items-center gap-1.5">
                      Explore feature <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* 3. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Streamlined Learning Architecture
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-6"
            >
              How It Works: <span className="gradient-text">3 Simple Steps</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-300 text-base sm:text-lg leading-relaxed"
            >
              Go from messy PDFs and dense syllabi to structured recall decks and test-ready confidence in under 60 seconds.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Desktop connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-purple-500/30 via-indigo-500/40 to-purple-500/30 -translate-y-8 z-0" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{ y: -8 }}
                  className="relative z-10 glass-card p-8 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_35px_rgba(139,92,246,0.25)] transition-all duration-300 flex flex-col items-center text-center group"
                >
                  {/* Step Number Badge */}
                  <div className="relative mb-6">
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-tr ${step.accent} p-0.5 shadow-[0_0_25px_rgba(139,92,246,0.4)] group-hover:scale-110 group-hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all duration-300`}
                    >
                      <div className="w-full h-full bg-[#0d0d26] rounded-[0.95rem] flex items-center justify-center">
                        <Icon className="w-9 h-9 text-purple-300 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-purple-500 text-white font-mono text-xs font-bold flex items-center justify-center shadow-lg border-2 border-[#0a0a1a]">
                      {step.number}
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-widest text-purple-400 font-bold mb-2">
                    {step.title}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                    {step.subtitle}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Instant Execution</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Interactive Callout Banner / Why Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl p-8 sm:p-14 glass-card border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-[#0a0a1a] shadow-[0_0_50px_rgba(139,92,246,0.2)] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-4 border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5" /> Ready for the Prompt War Hackathon
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Ready to Upgrade Your Study Workflow?
              </h2>
              <p className="text-slate-300 text-base leading-relaxed mb-0">
                Upload your first syllabus or PDF and experience how Google Gemini transforms passive reading into active, high-retention mastery.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 whitespace-nowrap"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>

        {/* 4. FOOTER SECTION */}
        <footer
          id="tech-stack"
          className="mt-auto border-t border-purple-500/15 backdrop-blur-xl bg-[#080816]/90 pt-16 pb-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            {/* Tech Badges Showcase */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                    Production Stack & Technologies
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Engineered with modern web standards, generative AI, and high-performance client state.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Hackathon Ready Architecture</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {techBadges.map((badge) => (
                  <span
                    key={badge.name}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium glass-card border ${badge.color} bg-[#10102c]/50 hover:scale-105 transition-transform cursor-default`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    {badge.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-purple-500/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">StudyBuddy AI</span>
                  <span className="text-[11px] text-slate-400">
                    Built with love for Prompt War Hackathon
                  </span>
                </div>
              </div>

              <div className="text-center sm:text-right text-xs text-slate-400">
                <p>
                  Built with love for <span className="text-purple-300 font-semibold">Prompt War Hackathon</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  100% Free & Open Source Educational Companion
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
