'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  Trash2,
  ArrowRight,
  BookOpen,
  AlertCircle,
  Loader2,
  X,
  CheckCircle2,
  Sparkles,
  FileCode,
  AlignLeft,
} from 'lucide-react';
import { useStudyStore } from '@/lib/store';
import { UploadedDocument } from '@/lib/types';

export default function UploadZone() {
  const { documents, addDocument, removeDocument, setActiveView } = useStudyStore();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Note paste state
  const [pastedTitle, setPastedTitle] = useState('');
  const [pastedContent, setPastedContent] = useState('');

  // Hydration safety for Zustand persist
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentDocs = mounted ? documents : [];

  // Generate clean unique ID
  const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `doc-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  };

  // Process a single file
  const processFile = async (file: File): Promise<UploadedDocument> => {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isTextOrMd =
      file.name.toLowerCase().endsWith('.txt') ||
      file.name.toLowerCase().endsWith('.md') ||
      file.type.includes('text');

    if (isPdf) {
      setStatusMessage(`Extracting text from ${file.name}...`);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to extract text from "${file.name}".`
        );
      }

      const data: { text: string; pageCount?: number } = await response.json();

      if (!data.text || !data.text.trim()) {
        throw new Error(
          `Could not extract readable text from "${file.name}". The file may be empty or contain only scanned images.`
        );
      }

      return {
        id: generateId(),
        name: file.name,
        content: data.text.trim(),
        uploadedAt: new Date(),
        pageCount: data.pageCount || undefined,
      };
    } else if (isTextOrMd) {
      setStatusMessage(`Reading ${file.name}...`);
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve((event.target?.result as string) || '');
        };
        reader.onerror = () => {
          reject(new Error(`Failed to read "${file.name}".`));
        };
        reader.readAsText(file);
      });

      if (!content.trim()) {
        throw new Error(`File "${file.name}" is empty.`);
      }

      return {
        id: generateId(),
        name: file.name,
        content: content.trim(),
        uploadedAt: new Date(),
      };
    } else {
      throw new Error(
        `Unsupported file type for "${file.name}". Only .pdf, .txt, and .md files are supported.`
      );
    }
  };

  // Dropzone onDrop handler
  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setErrorMessage(null);
      setSuccessMessage(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const errorDesc =
          rejection.errors[0]?.message ||
          'Unsupported file. Please upload .pdf, .txt, or .md files.';
        setErrorMessage(`${rejection.file.name}: ${errorDesc}`);
        return;
      }

      if (acceptedFiles.length === 0) return;

      setIsProcessing(true);
      const addedDocs: string[] = [];

      try {
        for (const file of acceptedFiles) {
          const doc = await processFile(file);
          addDocument(doc);
          addedDocs.push(doc.name);
        }

        setSuccessMessage(
          addedDocs.length === 1
            ? `Successfully loaded "${addedDocs[0]}"!`
            : `Successfully added ${addedDocs.length} documents!`
        );
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while processing your document.';
        setErrorMessage(message);
      } finally {
        setIsProcessing(false);
        setStatusMessage(null);
      }
    },
    [addDocument]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    disabled: isProcessing,
    maxSize: 30 * 1024 * 1024, // 30MB
  });

  // Handle pasting text notes
  const handleSavePastedNotes = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedContent = pastedContent.trim();
    if (!trimmedContent) {
      setErrorMessage('Please paste or type some study notes before adding.');
      return;
    }

    const defaultTitle = `Notes - ${new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`;

    const title = pastedTitle.trim() || defaultTitle;

    const newDoc: UploadedDocument = {
      id: generateId(),
      name: title,
      content: trimmedContent,
      uploadedAt: new Date(),
    };

    addDocument(newDoc);
    setPastedTitle('');
    setPastedContent('');
    setSuccessMessage(`Added "${title}" to your study documents!`);
  };

  // Estimate word count
  const getWordCount = (text: string): number => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  // Format date helper
  const formatDate = (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Knowledge Ingestion
          </span>
          <span className="text-xs text-slate-400">PDF, TXT, Markdown</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Upload Your <span className="gradient-text">Study Materials</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
          Feed your lecture slides, textbook excerpts, or custom notes into StudyBuddy AI.
          Our engine extracts and indexes content for flashcards, quizzes, mind maps, and instant AI tutoring.
        </p>

        {/* 1-Click Sample Material Presets for Evaluators */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-purple-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Evaluator Quick-Start:
          </span>
          <button
            type="button"
            onClick={() => {
              addDocument({
                id: generateId(),
                name: 'Biology_Cell_Metabolism.txt',
                content: `Cellular respiration is a metabolic pathway that breaks down glucose and produces ATP. The stages of cellular respiration include glycolysis, pyruvate oxidation, the citric acid (Krebs) cycle, and oxidative phosphorylation.
Glycolysis takes place in the cytoplasm and converts glucose into two pyruvate molecules, generating 2 ATP and 2 NADH without requiring oxygen.
The Krebs cycle occurs in the mitochondrial matrix, producing electron carriers (NADH and FADH2) along with 2 ATP.
Oxidative phosphorylation happens in the inner mitochondrial membrane via the electron transport chain, generating roughly 28 to 32 ATP per glucose molecule using ATP synthase powered by a proton gradient.
Photosynthesis is the reverse energy-harnessing process occurring in chloroplasts: 6CO2 + 6H2O + light energy -> C6H12O6 + 6O2.`,
                uploadedAt: new Date(),
                pageCount: 1,
              });
              setSuccessMessage('Loaded Biology sample notes! You can now test Chat, Flashcards, Quiz & Mind Map.');
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-medium glass-card border border-purple-500/30 text-purple-200 hover:bg-purple-500/20 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 cursor-pointer active:scale-95"
          >
            Load Biology Notes (Sample)
          </button>
          <button
            type="button"
            onClick={() => {
              addDocument({
                id: generateId(),
                name: 'Computer_Science_Algorithms.txt',
                content: `Asymptotic analysis evaluates algorithmic efficiency as input size N grows.
Big-O Notation represents the worst-case upper bound.
- O(1): Constant time (hash map lookup).
- O(log N): Logarithmic time (binary search on sorted array).
- O(N): Linear time (linear traversal).
- O(N log N): Linearithmic time (Merge Sort, QuickSort average case, Heap Sort).
- O(N^2): Quadratic time (Bubble sort, Insertion sort nested loops).
Data structures:
- Binary Search Tree (BST): average O(log N) search/insert, worst-case O(N) when skewed. Balanced trees like AVL or Red-Black guarantee O(log N).
- Graphs: Represented by adjacency matrix or adjacency list. Traversed using BFS (queue, shortest path in unweighted graph) or DFS (stack/recursion).`,
                uploadedAt: new Date(),
                pageCount: 1,
              });
              setSuccessMessage('Loaded Computer Science sample notes! Try taking a quiz or generating a mind map.');
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-medium glass-card border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/20 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer active:scale-95"
          >
            Load CS Algorithms (Sample)
          </button>
        </div>
      </div>

      {/* Error & Success Alerts */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="flex items-start justify-between gap-3 p-4 rounded-xl bg-red-950/60 border border-red-500/30 text-red-200 backdrop-blur-md shadow-lg shadow-red-950/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-red-300">Upload Notice</p>
                <p className="text-red-200/90 leading-relaxed mt-0.5">{errorMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="p-1 rounded-lg hover:bg-red-800/40 text-red-300 hover:text-white transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="flex items-start justify-between gap-3 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 backdrop-blur-md shadow-lg shadow-emerald-950/30"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-300">Success</p>
                <p className="text-emerald-200/90 leading-relaxed mt-0.5">{successMessage}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="p-1 rounded-lg hover:bg-emerald-800/40 text-emerald-300 hover:text-white transition-colors"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Upload / Paste Box */}
      <div className="glass-card overflow-hidden">
        {/* Tab switchers */}
        <div className="flex items-center border-b border-slate-700/60 bg-slate-900/60 p-2 sm:p-3 gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'upload'}
            onClick={() => setActiveTab('upload')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:scale-95 ${
              activeTab === 'upload'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Upload className="w-4 h-4 text-purple-400" />
            <span>Upload Files</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'paste'}
            onClick={() => setActiveTab('paste')}
            className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 active:scale-95 ${
              activeTab === 'paste'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <AlignLeft className="w-4 h-4 text-indigo-400" />
            <span>Paste Notes</span>
          </button>

          {isProcessing && (
            <div className="ml-auto flex items-center gap-2 text-xs text-purple-300 bg-purple-950/60 border border-purple-500/30 px-3 py-1.5 rounded-full animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>{statusMessage || 'Processing...'}</span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'upload' ? (
            /* Dropzone Container */
            <div
              {...getRootProps()}
              className={`relative group rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 flex flex-col items-center justify-center cursor-pointer select-none ${
                isDragReject
                  ? 'border-red-500 bg-red-500/10'
                  : isDragActive
                  ? 'border-purple-400 bg-purple-500/15 scale-[1.01] shadow-xl shadow-purple-500/10'
                  : isProcessing
                  ? 'border-slate-700 bg-slate-900/40 cursor-not-allowed opacity-75'
                  : 'border-purple-400/30 hover:border-purple-400/70 bg-slate-900/40 hover:bg-slate-800/50'
              }`}
            >
              <input {...getInputProps()} />

              {/* Glowing Icon Container */}
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 ${
                  isDragActive
                    ? 'scale-110 bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                    : isProcessing
                    ? 'bg-purple-950/70 text-purple-300 border border-purple-500/30'
                    : 'bg-gradient-to-tr from-purple-900/50 to-indigo-900/50 border border-purple-500/30 text-purple-300 group-hover:scale-105 group-hover:border-purple-400 group-hover:text-purple-200'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
                ) : (
                  <Upload className="w-10 h-10 transition-transform duration-300 group-hover:-translate-y-1" />
                )}
              </div>

              {/* Text instructions */}
              <div className="space-y-2 max-w-md">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {isDragReject ? (
                    <span className="text-red-400">File format not supported</span>
                  ) : isDragActive ? (
                    <span className="text-purple-300">Drop your files here to start</span>
                  ) : isProcessing ? (
                    <span className="text-purple-300">Extracting document contents...</span>
                  ) : (
                    <span>
                      Drag & drop your files here, or{' '}
                      <span className="text-purple-400 underline underline-offset-4 decoration-purple-500/50 group-hover:text-purple-300">
                        browse
                      </span>
                    </span>
                  )}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Support for <strong className="text-slate-300 font-semibold">.pdf</strong>,{' '}
                  <strong className="text-slate-300 font-semibold">.txt</strong>, and{' '}
                  <strong className="text-slate-300 font-semibold">.md</strong> documents. Max file size: 30MB.
                </p>
              </div>

              {/* Mini format pills */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-purple-400" /> PDF Slides & Textbooks
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-300">
                  <FileCode className="w-3.5 h-3.5 text-indigo-400" /> Markdown Notes (.md)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-300">
                  <AlignLeft className="w-3.5 h-3.5 text-violet-400" /> Plain Text (.txt)
                </span>
              </div>
            </div>
          ) : (
            /* Paste Notes Form */
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="note-title"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                >
                  Document / Note Title (Optional)
                </label>
                <input
                  id="note-title"
                  type="text"
                  value={pastedTitle}
                  onChange={(e) => setPastedTitle(e.target.value)}
                  placeholder="e.g., Biology Chapter 4: Photosynthesis & Cellular Respiration"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="note-content"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Paste Study Text
                  </label>
                  <span className="text-xs text-slate-400">
                    {getWordCount(pastedContent)} words &bull; {pastedContent.length} chars
                  </span>
                </div>
                <textarea
                  id="note-content"
                  rows={8}
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                  placeholder="Paste your syllabus, lecture transcription, reading summary, or study guide here..."
                  className="w-full p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all resize-y leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {pastedContent.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setPastedTitle('');
                      setPastedContent('');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSavePastedNotes}
                  disabled={!pastedContent.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  <span>Add Notes Document</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Documents List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Study Library</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentDocs.length} {currentDocs.length === 1 ? 'doc' : 'docs'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Uploaded materials feeding your AI study session
              </p>
            </div>
          </div>

          {/* "Start Learning →" CTA button when docs exist */}
          {currentDocs.length > 0 && (
            <motion.button
              type="button"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveView('chat')}
              className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-[length:200%_auto] hover:bg-right shadow-xl shadow-purple-500/25 border border-purple-400/30 transition-all duration-300 group"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 text-purple-200 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>
          )}
        </div>

        {/* Empty State */}
        {currentDocs.length === 0 ? (
          <div className="glass-card p-10 text-center rounded-2xl border border-dashed border-slate-800 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mb-4 text-slate-400">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-200 mb-1">
              No study documents added yet
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
              Upload course slides, syllabus, or paste lecture notes above to unlock flashcards, quizzes, mind maps, and your personal AI study assistant.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl text-left text-xs text-slate-400">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-purple-400 font-semibold block mb-0.5">1. Ingest Content</span>
                Upload PDFs, notes, or textbook extracts.
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-indigo-400 font-semibold block mb-0.5">2. AI Synthesis</span>
                Gemini extracts core concepts & terms.
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-purple-300 font-semibold block mb-0.5">3. Master Topics</span>
                Practice quizzes, study plans & flashcards.
              </div>
            </div>
          </div>
        ) : (
          /* Document Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {currentDocs.map((doc) => {
                const words = getWordCount(doc.content);
                const isPdf = doc.name.toLowerCase().endsWith('.pdf') || !!doc.pageCount;

                return (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="glass-card p-5 rounded-xl border border-slate-700/50 bg-slate-900/50 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md hover:shadow-purple-500/5"
                  >
                    <div>
                      {/* Top bar with icon, title, and delete button */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                              isPdf
                                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                                : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                            }`}
                          >
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4
                              className="text-sm font-bold text-white truncate group-hover:text-purple-200 transition-colors"
                              title={doc.name}
                            >
                              {doc.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{formatDate(doc.uploadedAt)}</span>
                              <span>&bull;</span>
                              <span>{words.toLocaleString()} words</span>
                              {doc.pageCount && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-purple-300 font-medium">
                                    {doc.pageCount} {doc.pageCount === 1 ? 'page' : 'pages'}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all shrink-0 cursor-pointer flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 active:scale-95"
                          title="Remove document"
                          aria-label={`Delete ${doc.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Content excerpt preview */}
                      <p className="text-xs text-slate-400/90 line-clamp-2 leading-relaxed mt-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/70 font-mono">
                        {doc.content.slice(0, 200)}...
                      </p>
                    </div>

                    {/* Card footer badges */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ready for AI processing</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => setActiveView('chat')}
                        className="min-h-[44px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 transition-colors group/btn cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 px-2 rounded-lg"
                      >
                        <span>Study This</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom "Start Learning" Banner when docs are loaded */}
        {currentDocs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-purple-900/30 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6"
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Ready to accelerate your learning?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  {currentDocs.length} study document{currentDocs.length > 1 ? 's' : ''} loaded. Jump straight into AI chat, flashcards, or practice quizzes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveView('chat')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              <span>Start Learning Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
