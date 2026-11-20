'use client';

import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Trash2,
  AlertCircle,
  Bot,
  User,
  Sparkles,
  Loader2,
  BookOpen,
  HelpCircle,
  Zap,
  Check,
  Copy,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStudyStore } from '@/lib/store';
import { ChatMessage } from '@/lib/types';

// Hydration helper to ensure synchronized client rendering with localStorage persisted Zustand store
const emptySubscribe = () => () => {};
function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Starter prompt suggestions for the empty state
const STARTER_PROMPTS = [
  {
    icon: Sparkles,
    title: 'Summarize key concepts',
    prompt: 'Summarize the most important key concepts and takeaways from my study material.',
  },
  {
    icon: HelpCircle,
    title: 'Test my knowledge',
    prompt: 'Ask me 3 challenging questions to test my understanding of the material. Wait for my answer before providing feedback.',
  },
  {
    icon: BookOpen,
    title: 'Explain like I am five',
    prompt: 'Explain the most complex or fundamental topic in my notes using a simple, relatable real-world analogy.',
  },
  {
    icon: Zap,
    title: 'Identify tricky areas',
    prompt: 'What are the most common misconceptions or tricky areas students face in this topic, and how do I avoid them?',
  },
];

export default function ChatInterface() {
  const {
    chatMessages,
    addChatMessage,
    clearChat,
    getDocumentContent,
    documents,
  } = useStudyStore();

  const mounted = useIsMounted();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeAssistantId, setActiveAssistantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentDocs = mounted ? documents : [];
  const currentMessages = mounted ? chatMessages : [];
  const hasDocuments = currentDocs.length > 0;

  // Auto-scroll to bottom whenever messages update or stream generates content
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom(isStreaming ? 'auto' : 'smooth');
  }, [currentMessages, isStreaming]);

  // Auto-resize textarea to fit content smoothly up to 160px
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Format message timestamps safely (handles both Date instances and serialized JSON strings)
  const formatTime = (timestamp: Date | string | number | undefined) => {
    if (!timestamp) return '';
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Copy message content to clipboard
  const handleCopyMessage = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err);
    }
  };

  // Send message and stream the tutor response
  const handleSendMessage = async (customPrompt?: string) => {
    const messageToSend = (customPrompt ?? input).trim();
    if (!messageToSend || isStreaming) return;

    setError(null);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 1. Prepare and append User message
    const userMessageId = `user-${crypto.randomUUID()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };
    addChatMessage(userMessage);

    // 2. Prepare Assistant placeholder message
    const assistantMessageId = `assistant-${crypto.randomUUID()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    addChatMessage(assistantPlaceholder);

    setIsStreaming(true);
    setActiveAssistantId(assistantMessageId);

    // 3. Format history for API request
    const historyPayload = currentMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          context: getDocumentContent(),
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsedMessage = errorText;
        try {
          const json = JSON.parse(errorText);
          if (json.error) parsedMessage = json.error;
        } catch {
          // Keep raw text
        }
        throw new Error(parsedMessage || `Server responded with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported or empty body received from server.');
      }

      // 4. Stream response progressively via TextDecoder
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;

        // Progressively update the assistant message in Zustand store
        useStudyStore.setState((state) => ({
          chatMessages: state.chatMessages.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: accumulatedResponse } : msg
          ),
        }));
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to communicate with AI tutor. Please check your connection.';
      console.error('ChatInterface error:', err);
      setError(errorMsg);

      // Populate placeholder with helpful message if no response was received
      useStudyStore.setState((state) => ({
        chatMessages: state.chatMessages.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  msg.content ||
                  '⚠️ I encountered an error while responding. Please verify your Gemini API key or try again in a few moments.',
              }
            : msg
        ),
      }));
    } finally {
      setIsStreaming(false);
      setActiveAssistantId(null);
    }
  };

  // Keyboard shortcut: Enter to submit, Shift + Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle clearing chat history
  const handleClearChat = () => {
    if (isStreaming) return;
    clearChat();
    setError(null);
  };

  return (
    <div className="studio-card flex flex-col h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-6.5rem)] border border-white/[0.08] shadow-2xl overflow-hidden rounded-2xl relative">
      {/* Top Header Bar */}
      <header className="px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-[#090A0F]/80 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/10">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                AI Study Tutor
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono">
                <Sparkles className="w-2.5 h-2.5 text-blue-400" />
                Socratic Method
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasDocuments ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="truncate">
                {hasDocuments
                  ? `${currentDocs.length} ${
                      currentDocs.length === 1 ? 'document' : 'documents'
                    } in active context`
                  : 'General knowledge mode (no documents)'}
              </span>
            </div>
          </div>
        </div>

        {/* Clear Chat Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearChat}
            disabled={currentMessages.length === 0 || isStreaming}
            className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95"
            title="Clear chat history"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </header>

      {/* Warning Banner: If no docs uploaded */}
      <AnimatePresence>
        {mounted && !hasDocuments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-amber-500/20 bg-amber-500/[0.06] px-4 sm:px-6 py-2.5 text-xs text-amber-200/90 flex items-center gap-2.5 shrink-0"
          >
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-amber-300">No study notes uploaded: </span>
              <span>
                The AI tutor will answer from general knowledge. Upload notes or PDFs in the Upload
                tab for personalized, document-grounded explanations.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Banner: If API or network request failed */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b border-rose-500/20 bg-rose-500/10 px-4 sm:px-6 py-2.5 text-xs text-rose-200 flex items-center justify-between gap-2.5 shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs text-rose-300 hover:text-white underline ml-2 shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message List Container with Auto-scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {mounted && currentMessages.length === 0 ? (
          /* Welcome message when empty */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto py-6 sm:py-10 text-center"
          >
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/10">
                <Bot className="w-9 h-9 text-blue-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#090A0F] border border-blue-500/30 shadow">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
              Welcome to <span className="brand-title">StudyBuddy AI Tutor</span>
            </h3>

            <p className="text-sm text-slate-300 max-w-lg mb-8 leading-relaxed">
              I am your 24/7 intelligent study partner. Using Socratic questioning and step-by-step
              reasoning, I help you truly understand challenging concepts rather than just memorizing
              answers.
            </p>

            {/* Prompt Starter Cards */}
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Suggested Prompt Starters</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {STARTER_PROMPTS.map((starter, idx) => {
                  const Icon = starter.icon;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendMessage(starter.prompt)}
                      className="studio-card p-3.5 rounded-xl border border-white/[0.08] hover:border-blue-500/40 transition-all duration-200 group flex flex-col gap-1.5 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 group-hover:text-blue-200">
                        <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{starter.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 group-hover:text-slate-300 line-clamp-2 leading-relaxed">
                        {starter.prompt}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Active Chat Messages */
          <div className="space-y-5">
            <AnimatePresence initial={false}>
              {currentMessages.map((msg) => {
                const isUser = msg.role === 'user';
                const isCurrentlyStreamingThis =
                  isStreaming && msg.id === activeAssistantId;
                const isWaitingForFirstChunk =
                  isCurrentlyStreamingThis && (!msg.content || msg.content.trim() === '');

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`flex items-start gap-3 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Role Avatar */}
                    {isUser ? (
                      <div className="w-8 h-8 rounded-xl bg-blue-600 border border-blue-400/30 flex items-center justify-center shrink-0 text-white shadow-md shadow-blue-900/20 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-[#161926] border border-white/[0.1] flex items-center justify-center shrink-0 text-blue-400 shadow-md mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`flex flex-col group max-w-[85%] sm:max-w-[78%] ${
                        isUser ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg break-words ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-900/20 font-medium'
                            : 'studio-card-elevated border border-white/[0.08] bg-[#12141e] text-slate-100 rounded-tl-sm shadow-black/25'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : isWaitingForFirstChunk ? (
                          /* Loading: 3-dot typing animation */
                          <div className="flex items-center gap-2 py-1 px-1">
                            <span className="text-xs text-slate-400 font-medium font-mono">
                              Thinking
                            </span>
                            <div className="flex items-center gap-1.5 ml-1">
                              {[0, 1, 2].map((dot) => (
                                <motion.span
                                   key={dot}
                                  className="w-2 h-2 rounded-full bg-blue-400"
                                  animate={{ y: [0, -6, 0], opacity: [0.35, 1, 0.35] }}
                                  transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    delay: dot * 0.18,
                                    ease: 'easeInOut',
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* AI message rendered with ReactMarkdown + remarkGfm in div.markdown-content */
                          <div className="markdown-content text-slate-200 relative">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>

                            {/* Streaming blinking cursor */}
                            {isCurrentlyStreamingThis && (
                              <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle rounded-sm" />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Timestamp & Utilities */}
                      <div
                        className={`flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-500 ${
                          isUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <span className="font-mono">{formatTime(msg.timestamp)}</span>

                        {!isUser && msg.content && (
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:text-slate-300 cursor-pointer flex items-center gap-1"
                            title="Copy response"
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-[10px] text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-[10px]">Copy</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input + Send Button Bottom Bar */}
      <footer className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#090A0F]/80 backdrop-blur-md shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder={
                hasDocuments
                  ? 'Ask anything about your notes (e.g. "Explain chapter 2", "Quiz me on formulas")...'
                  : 'Ask any study question or request an explanation...'
              }
              className="w-full resize-none rounded-xl bg-[#090A0F] border border-white/[0.1] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 text-slate-100 placeholder:text-slate-500 text-sm px-4 py-3 max-h-40 outline-none transition-all duration-200 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="h-[46px] px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 shadow-md shadow-blue-600/25 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Send message"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
            <span className="hidden sm:inline text-xs font-semibold">Send</span>
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
          <span className="hidden sm:inline">
            <kbd className="px-1.5 py-0.5 rounded bg-[#090A0F] border border-white/[0.1] text-slate-400 font-mono text-[10px]">
              Enter
            </kbd>{' '}
            to send •{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-[#090A0F] border border-white/[0.1] text-slate-400 font-mono text-[10px]">
              Shift + Enter
            </kbd>{' '}
            for new line
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-blue-400/90 font-mono">
            <Sparkles className="w-3 h-3" />
            <span>Gemini AI Engine</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
