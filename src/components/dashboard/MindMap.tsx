'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  GitBranch,
  Sparkles,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Download,
  FolderTree,
  Maximize2,
  Minimize2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { useStudyStore } from '@/lib/store';
import { MindMapNode } from '@/lib/types';

// Color themes cycling through purple -> indigo -> blue -> cyan -> violet by level
interface LevelConfig {
  name: string;
  border: string;
  hoverGlow: string;
  badge: string;
  connector: string;
  branchLine: string;
  dot: string;
  titleColor: string;
}

const LEVEL_CONFIGS: LevelConfig[] = [
  {
    name: 'purple',
    border: 'border-l-purple-500',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:border-purple-500/40',
    badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    connector: 'border-purple-500/40',
    branchLine: 'bg-purple-500/40',
    dot: 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]',
    titleColor: 'text-purple-200',
  },
  {
    name: 'indigo',
    border: 'border-l-indigo-500',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] hover:border-indigo-500/40',
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    connector: 'border-indigo-500/40',
    branchLine: 'bg-indigo-500/40',
    dot: 'bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]',
    titleColor: 'text-indigo-200',
  },
  {
    name: 'blue',
    border: 'border-l-blue-500',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:border-blue-500/40',
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    connector: 'border-blue-500/40',
    branchLine: 'bg-blue-500/40',
    dot: 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]',
    titleColor: 'text-blue-200',
  },
  {
    name: 'cyan',
    border: 'border-l-cyan-400',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(34,211,238,0.35)] hover:border-cyan-400/40',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    connector: 'border-cyan-400/40',
    branchLine: 'bg-cyan-400/40',
    dot: 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]',
    titleColor: 'text-cyan-200',
  },
  {
    name: 'violet',
    border: 'border-l-violet-400',
    hoverGlow: 'hover:shadow-[0_0_25px_rgba(167,139,250,0.35)] hover:border-violet-400/40',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    connector: 'border-violet-400/40',
    branchLine: 'bg-violet-400/40',
    dot: 'bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]',
    titleColor: 'text-violet-200',
  },
];

const getLevelConfig = (level: number): LevelConfig => {
  return LEVEL_CONFIGS[level % LEVEL_CONFIGS.length];
};

// Framer motion variants for staggered animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const nodeItemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

// Helper metrics for mind map
function getTreeStats(root: MindMapNode | null): { totalNodes: number; maxDepth: number } {
  if (!root) return { totalNodes: 0, maxDepth: 0 };

  let count = 0;
  let maxD = 0;

  function traverse(node: MindMapNode, currentDepth: number) {
    count++;
    if (currentDepth > maxD) maxD = currentDepth;
    const children = Array.isArray(node.children) ? node.children : [];
    for (const child of children) {
      traverse(child, currentDepth + 1);
    }
  }

  traverse(root, 1);
  return { totalNodes: count, maxDepth: maxD };
}

interface MindMapNodeViewProps {
  node: MindMapNode;
  level: number;
  forceExpandAll?: boolean | null;
}

// Recursive MindMapNodeView component
export const MindMapNodeView: React.FC<MindMapNodeViewProps> = ({
  node,
  level,
  forceExpandAll,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Sync with parent expand/collapse-all toggle if triggered
  React.useEffect(() => {
    if (forceExpandAll !== undefined && forceExpandAll !== null) {
      setIsExpanded(forceExpandAll);
    }
  }, [forceExpandAll]);

  const config = getLevelConfig(level);
  const children = Array.isArray(node.children) ? node.children : [];
  const hasChildren = children.length > 0;

  const getLevelLabel = (lvl: number) => {
    if (lvl === 0) return 'Core Concept';
    if (lvl === 1) return 'Primary Branch';
    if (lvl === 2) return 'Sub-Topic';
    if (lvl === 3) return 'Key Detail';
    return `Level ${lvl + 1}`;
  };

  return (
    <motion.div variants={nodeItemVariants} className="relative group/node w-full">
      {/* Horizontal connecting branch line for child nodes */}
      {level > 0 && (
        <span
          className={`absolute -left-8 top-6 w-8 h-[2px] ${config.branchLine} pointer-events-none transition-colors duration-200`}
          aria-hidden="true"
        />
      )}

      {/* Node Card */}
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`glass-card p-4 sm:p-5 border-l-4 ${config.border} ${config.hoverGlow} transition-all duration-300 ${
          hasChildren ? 'cursor-pointer' : 'cursor-default'
        } select-none relative overflow-hidden backdrop-blur-xl bg-slate-900/40 border border-slate-700/30 rounded-2xl shadow-lg`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Glowing dot indicator */}
            <div className="mt-1.5 flex-shrink-0">
              <span className={`block w-2.5 h-2.5 rounded-full ${config.dot}`} />
            </div>

            {/* Label and hierarchy info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${config.badge}`}
                >
                  {getLevelLabel(level)}
                </span>

                {hasChildren && (
                  <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
                    {children.length} {children.length === 1 ? 'subtopic' : 'subtopics'}
                  </span>
                )}
              </div>

              <h4
                className={`font-semibold tracking-tight leading-snug break-words ${
                  level === 0
                    ? 'text-lg sm:text-xl text-white'
                    : level === 1
                    ? 'text-base sm:text-lg text-slate-100'
                    : 'text-sm sm:text-base text-slate-200'
                }`}
              >
                {node.label}
              </h4>
            </div>
          </div>

          {/* Expand/Collapse Toggle Button for nodes with children */}
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              aria-label={isExpanded ? 'Collapse branch' : 'Expand branch'}
              className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition-colors border border-slate-700/40 flex-shrink-0 mt-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 transition-transform" />
              ) : (
                <ChevronRight className="w-4 h-4 transition-transform" />
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Recursive Children Container */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className={`ml-8 pl-4 mt-3 space-y-3 border-l-2 ${config.connector} relative`}
          >
            {children.map((child, idx) => (
              <MindMapNodeView
                key={child.id || `${child.label}-${level + 1}-${idx}`}
                node={child}
                level={level + 1}
                forceExpandAll={forceExpandAll}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function MindMap() {
  const { mindMapData, setMindMapData, documents, getDocumentContent } = useStudyStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forceExpandAll, setForceExpandAll] = useState<boolean | null>(null);

  const stats = useMemo(() => getTreeStats(mindMapData), [mindMapData]);
  const hasDocuments = documents.length > 0 && getDocumentContent().trim().length > 0;

  // Generate or Regenerate Mind Map
  const handleGenerateMindMap = async () => {
    const content = getDocumentContent();
    if (!content || !content.trim()) {
      setErrorMessage('Please upload study materials first to generate a mind map.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        let errDesc = `Server returned status ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error) {
            errDesc = errData.error;
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(errDesc);
      }

      const data = await response.json();

      if (data && data.mindmap) {
        setMindMapData(data.mindmap);
        setForceExpandAll(true);
      } else if (data && data.id && data.label) {
        // Fallback if returned object is the root node directly
        setMindMapData(data);
        setForceExpandAll(true);
      } else {
        throw new Error('Unexpected response format from mind map API.');
      }
    } catch (err: unknown) {
      console.error('Failed to generate mind map:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Export mind map as formatted JSON
  const handleExportJSON = () => {
    if (!mindMapData) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(mindMapData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `studybuddy-mindmap-${mindMapData.label.toLowerCase().replace(/\s+/g, '-') || 'concept'}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-slate-100">
      {/* Header section with gradient-text and action buttons */}
      <div className="glass-card p-6 sm:p-8 relative overflow-hidden backdrop-blur-2xl bg-slate-900/40 border border-slate-700/30 rounded-3xl shadow-2xl">
        {/* Ambient subtle glow background */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Hierarchical Knowledge Map</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              <span className="gradient-text">Concept Mind Map</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Transform your uploaded study notes into an interactive, structured tree of core
              concepts, sub-branches, and key relationships.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateMindMap}
              disabled={isLoading || !hasDocuments}
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium text-white transition-all duration-300 shadow-lg ${
                isLoading || !hasDocuments
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                  : 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                  <span>Synthesizing Concepts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>{mindMapData ? 'Regenerate Mind Map' : 'Generate Mind Map'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mind Map Meta stats bar when data is present */}
        {mindMapData && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/40">
                <FolderTree className="w-4 h-4 text-purple-400" />
                <span>
                  Total Topics:{' '}
                  <strong className="text-slate-200 font-semibold">{stats.totalNodes}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/40">
                <GitBranch className="w-4 h-4 text-indigo-400" />
                <span>
                  Tree Depth:{' '}
                  <strong className="text-slate-200 font-semibold">{stats.maxDepth} levels</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/40">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>
                  Source:{' '}
                  <strong className="text-slate-200 font-semibold">
                    {documents.length} document{documents.length > 1 ? 's' : ''}
                  </strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForceExpandAll((prev) => (prev === true ? false : true))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
              >
                {forceExpandAll === false ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand All</span>
                  </>
                ) : (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Collapse All</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error notification banner */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-200 flex items-start gap-3 shadow-lg"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 text-sm">
            <h5 className="font-semibold text-rose-300">Generation Notice</h5>
            <p className="mt-0.5 text-rose-200/90 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-rose-400 hover:text-rose-200 underline ml-2 cursor-pointer flex-shrink-0"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* No documents warning state */}
      {!hasDocuments && (
        <div className="glass-card p-8 rounded-2xl text-center space-y-4 border border-amber-500/20 bg-amber-950/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-amber-200">No Study Materials Uploaded</h3>
            <p className="text-slate-400 text-sm">
              Please upload course PDFs, notes, or reading summaries in the Upload section before
              generating a concept mind map.
            </p>
          </div>
        </div>
      )}

      {/* Loading state skeleton */}
      {isLoading && (
        <div className="glass-card p-8 rounded-3xl border border-purple-500/20 bg-slate-900/40 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Analyzing Study Materials</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Our AI is extracting key topics, building hierarchical connections, and organizing your
              curriculum into an intuitive visual tree...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-purple-300/80">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Parsing core arguments and branch nodes</span>
          </div>
        </div>
      )}

      {/* Empty state: Documents uploaded but mind map not generated yet */}
      {!isLoading && hasDocuments && !mindMapData && (
        <div className="glass-card p-10 sm:p-14 rounded-3xl border border-slate-700/30 bg-slate-900/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-inner">
            <GitBranch className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-bold text-white">Ready to Map Your Knowledge</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We found {documents.length} uploaded study document{documents.length > 1 ? 's' : ''}.
              Click the button below to generate an AI-powered visual breakdown of your material.
            </p>
          </div>
          <button
            onClick={handleGenerateMindMap}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>Generate Mind Map</span>
          </button>
        </div>
      )}

      {/* Rendered Recursive Tree */}
      {!isLoading && mindMapData && (
        <div className="relative space-y-4">
          {/* Level Legend */}
          <div className="flex items-center justify-between px-2 text-xs text-slate-400">
            <span className="font-medium tracking-wider uppercase text-[11px] text-slate-500">
              Interactive Hierarchy Tree
            </span>
            <div className="flex items-center gap-3 overflow-x-auto py-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-[11px] text-slate-400">Root</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-[11px] text-slate-400">Level 1</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-[11px] text-slate-400">Level 2</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="text-[11px] text-slate-400">Level 3</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                <span className="text-[11px] text-slate-400">Level 4+</span>
              </span>
            </div>
          </div>

          {/* Root and recursive tree branches with staggered animations */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full relative"
          >
            <MindMapNodeView
              node={mindMapData}
              level={0}
              forceExpandAll={forceExpandAll}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
