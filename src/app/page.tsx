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
      title: 'Smart Ingestion',
      description:
        'Upload textbooks, lecture slides, and notes in PDF or TXT format. Instant local content extraction and intelligent document chunking ready in seconds.',
      badge: 'Multi-Format Support',
      borderHover: 'hover:border-blue-500/40',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: MessageSquare,
      title: 'Socratic AI Tutor',
      description:
        'Engage in interactive Socratic dialogues. Ask questions about your study documents, request step-by-step solutions, and clarify difficult concepts 24/7.',
      badge: 'Document-Grounded',
      borderHover: 'hover:border-indigo-500/40',
      badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      iconColor: 'text-indigo-400',
    },
    {
      icon: Layers,
      title: 'Active Recall Flashcards',
      description:
        'Generate active-recall flashcard decks automatically from key terms. Track mastery with spaced-repetition difficulty ratings and interactive 3D flip cards.',
      badge: 'Spaced Repetition',
      borderHover: 'hover:border-amber-500/40',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    {
      icon: Brain,
      title: 'Formative Quizzes',
      description:
        'Generate targeted multiple-choice practice tests with live timers, comprehensive answer rationales, and historical performance tracking.',
      badge: 'Adaptive Feedback',
      borderHover: 'hover:border-emerald-500/40',
      badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: GitBranch,
      title: 'Concept Mind Maps',
      description:
        'Visualize complex subject architectures with hierarchical, color-coded concept trees that reveal relationships between core principles and subtopics.',
      badge: 'Visual Synthesis',
      borderHover: 'hover:border-cyan-500/40',
      badgeColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      iconColor: 'text-cyan-400',
    },
    {
      icon: Calendar,
      title: 'Adaptive Study Plans',
      description:
        'Receive custom, day-by-day revision schedules prioritized by exam deadlines and topic weightage to maximize retention without burnout.',
      badge: 'Smart Timeline',
      borderHover: 'hover:border-blue-500/40',
      badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      iconColor: 'text-blue-400',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Ingest',
      subtitle: 'Upload Your Materials',
      description:
        'Drop lecture notes, PDF textbooks, or research papers. Our local extractor digests text instantly with complete privacy.',
      icon: Upload,
      accent: 'from-blue-600 to-indigo-600',
    },
    {
      number: '02',
      title: 'Synthesize',
      subtitle: 'Gemini AI Intelligence',
      description:
        'Google Gemini analyzes complex themes, derives key takeaways, and creates interactive flashcards, quizzes, and mind maps in real time.',
      icon: Zap,
      accent: 'from-indigo-600 to-blue-500',
    },
    {
      number: '03',
      title: 'Master',
      subtitle: 'Retain & Excel',
      description:
        'Quiz yourself, consult your personal Socratic tutor, test active recall, and follow your customized revision schedule to ace exams.',
      icon: GraduationCap,
      accent: 'from-amber-600 to-amber-500',
    },
  ];

  const techBadges = [
    { name: 'Next.js 16 (App Router)', color: 'text-slate-200 border-white/10' },
    { name: 'TypeScript Strict', color: 'text-blue-400 border-blue-500/30' },
    { name: 'Google Gemini Multi-Tier', color: 'text-amber-400 border-amber-500/30' },
    { name: 'Tailwind CSS v4', color: 'text-cyan-300 border-cyan-500/30' },
    { name: 'Framer Motion', color: 'text-slate-300 border-white/10' },
    { name: 'Zustand v5 Persist', color: 'text-emerald-400 border-emerald-500/30' },
    { name: 'Lucide SVG Vector Icons', color: 'text-indigo-300 border-indigo-500/30' },
    { name: 'Recharts Visuals', color: 'text-blue-400 border-blue-500/30' },
    { name: 'In-Process PDF Engine', color: 'text-amber-300 border-amber-500/30' },
  ];

  return (
    <div className="relative min-h-screen bg-[#090a0f] text-slate-100 overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Modern Studio Background with Crisp Top Spotlight & Sub-pixel Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-blue-600/12 via-indigo-600/6 to-transparent blur-[130px]" />
        <div className="absolute inset-0 subtle-grid opacity-35" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#090a0f]/80 border-b border-white/[0.08]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all duration-200">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  StudyBuddy <span className="text-blue-400 font-black">AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
                  Prompt War Edition
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a
                href="#features"
                className="hover:text-white transition-colors duration-200"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="hover:text-white transition-colors duration-200"
              >
                How It Works
              </a>
              <a
                href="#tech-stack"
                className="hover:text-white transition-colors duration-200"
              >
                Architecture
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="min-h-[44px] relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Semantic Main Content Wrapper for Accessibility */}
        <main id="main-content" tabIndex={-1} className="outline-none">
        {/* 1. HERO SECTION */}
        <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.1] bg-white/[0.03] backdrop-blur-md text-xs sm:text-sm font-mono text-slate-300 mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="font-semibold text-white">AI for Education</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-medium">Prompt War 24h Hackathon</span>
          </motion.div>

          {/* Large Editorial Heading */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="max-w-5xl"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] leading-[1.06] mb-6">
              <span className="brand-title">Study Smarter.</span>{' '}
              <span className="accent-text">Retain Forever.</span>
            </h1>
            <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-300 tracking-tight mb-6">
              Your Intelligent Learning &amp; Revision Companion
            </p>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="max-w-3xl text-base sm:text-lg text-slate-400 leading-relaxed font-normal mb-10"
          >
            Transform dense textbooks, lecture slides, and notes into active-recall flashcards,
            formative practice exams, hierarchical concept trees, and a personalized 24/7 Socratic AI tutor.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-14"
          >
            <Link
              href="/dashboard"
              className="min-h-[48px] group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-bold text-base text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/25 hover:scale-105 active:scale-95 transition-all duration-200 w-full sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
            </Link>
            <a
              href="#how-it-works"
              className="min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-base text-slate-300 studio-card border border-white/[0.08] hover:text-white hover:border-white/[0.2] hover:bg-white/[0.03] transition-all duration-200 w-full sm:w-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span>Explore Features</span>
            </a>
          </motion.div>

          {/* Highlights Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="studio-card px-6 sm:px-10 py-3.5 border border-white/[0.08] max-w-2xl w-full"
          >
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-300">
              <div className="flex items-center gap-2 text-blue-400">
                <Zap className="w-4 h-4 fill-blue-400/20" />
                <span>10x Accelerated Recall</span>
              </div>
              <span className="hidden sm:inline text-slate-700">•</span>
              <div className="flex items-center gap-2 text-indigo-300">
                <Brain className="w-4 h-4" />
                <span>Socratic Dialogue</span>
              </div>
              <span className="hidden sm:inline text-slate-700">•</span>
              <div className="flex items-center gap-2 text-emerald-300">
                <Sparkles className="w-4 h-4" />
                <span>100% Free &amp; Private</span>
              </div>
            </div>
          </motion.div>

          {/* Studio Workspace Showcase Window */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="w-full mt-16 max-w-5xl rounded-2xl p-px bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl"
          >
            <div className="studio-card-elevated p-6 sm:p-8 rounded-2xl border border-white/[0.08] text-left bg-[#0e101a]/95">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                  </div>
                  <span className="text-xs font-mono text-slate-400 ml-2">
                    studybuddy-ai.workspace // active session
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  Multi-Tier Model Failover Active
                </div>
              </div>

              {/* Workspace Mockup Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Column 1: Active Recall Flashcard */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-blue-400 mb-2">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Layers className="w-3.5 h-3.5" /> Active Recall
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                        Mastered
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1">Concept #04</p>
                    <p className="text-sm font-medium text-slate-200">
                      What is the primary role of the attention mechanism in Transformers?
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-blue-400 font-medium">
                    Flip card to reveal explanation →
                  </div>
                </div>

                {/* Column 2: Socratic AI Tutor */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-indigo-400 mb-2">
                      <span className="flex items-center gap-1.5 font-medium">
                        <MessageSquare className="w-3.5 h-3.5" /> Socratic Tutor
                      </span>
                      <span className="text-[10px] text-slate-500">Just now</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-200 border border-blue-500/20">
                        &quot;Can you explain backpropagation in simple intuition?&quot;
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.03] text-slate-300 border border-white/[0.06]">
                        &quot;Think of it like tuning guitar strings based on the sound you hear...&quot;
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-indigo-400 font-medium">
                    Instant step-by-step reasoning
                  </div>
                </div>

                {/* Column 3: Adaptive Quiz */}
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-amber-400 mb-2">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Brain className="w-3.5 h-3.5" /> Formative Quiz
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-semibold">
                        95% Accuracy
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono mb-1">Score Breakdown</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-extrabold text-white">19/20</span>
                      <span className="text-xs text-emerald-400 font-semibold">+35% vs baseline</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full w-[95%] rounded-full" />
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-amber-400 font-medium">
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
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono uppercase tracking-wider mb-4"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Unified Learning Toolkit
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-[-0.02em] text-white mb-6"
            >
              Engineered for <span className="accent-text">High-Velocity Mastery</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-base sm:text-lg leading-relaxed"
            >
              Six production-grade AI tools orchestrated in a distraction-free workspace built for serious students and educators.
            </motion.p>
          </div>

          {/* 6 Clean Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className={`group relative studio-card p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 border border-white/[0.08] ${feature.borderHover}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center transition-colors">
                        <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                      </div>
                      <span className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full border ${feature.badgeColor}`}>
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-blue-200 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                    <span className="flex items-center gap-1.5">
                      Explore tool <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono uppercase tracking-wider mb-4"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              Streamlined Architecture
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black tracking-[-0.02em] text-white mb-6"
            >
              How It Works: <span className="accent-text">3 Clean Steps</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-base sm:text-lg leading-relaxed"
            >
              Go from dense lecture slides to active recall decks and exam confidence in under 60 seconds.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  whileHover={{ y: -6 }}
                  className="relative z-10 studio-card p-8 rounded-2xl border border-white/[0.08] hover:border-blue-500/30 transition-all duration-200 flex flex-col items-center text-center group"
                >
                  {/* Step Number Badge */}
                  <div className="relative mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${step.accent} p-0.5 shadow-lg group-hover:scale-105 transition-all duration-200`}
                    >
                      <div className="w-full h-full bg-[#090a0f] rounded-[0.9rem] flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white font-mono text-xs font-bold flex items-center justify-center border-2 border-[#090a0f]">
                      {step.number}
                    </span>
                  </div>

                  <span className="text-xs uppercase tracking-widest text-blue-400 font-mono font-bold mb-2">
                    {step.title}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                    {step.subtitle}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Instant Execution</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Callout Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl p-8 sm:p-12 studio-card-elevated border border-white/[0.12] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8"
          >
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-mono mb-4 border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" /> Prompt War Hackathon Ready
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Ready to Upgrade Your Study Workflow?
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-0">
                Upload your syllabus or lecture notes and experience how Google Gemini transforms passive reading into active, high-retention mastery.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="min-h-[48px] inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/25 hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span>Launch Workspace Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </section>
        </main>

        {/* 4. FOOTER SECTION */}
        <footer
          id="tech-stack"
          className="mt-auto border-t border-white/[0.08] backdrop-blur-xl bg-[#08090d]/90 pt-16 pb-12 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto flex flex-col gap-12">
            {/* Tech Badges */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
                    Production Stack &amp; Technologies
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Engineered with modern web standards, generative AI, and high-performance client state.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Prompt War 24h Hackathon</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {techBadges.map((badge) => (
                  <span
                    key={badge.name}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border ${badge.color} bg-white/[0.02] cursor-default`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    {badge.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">StudyBuddy AI</span>
                  <span className="text-[11px] text-slate-500">
                    Prompt War Hackathon — AI for Education
                  </span>
                </div>
              </div>

              <div className="text-center sm:text-right text-xs text-slate-500">
                <p>
                  Built with care for <span className="text-slate-300 font-semibold">Prompt War Hackathon</span>
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  100% Free &amp; Open Source Educational Companion
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
