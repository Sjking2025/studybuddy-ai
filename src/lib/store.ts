import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  UploadedDocument,
  ActiveView,
  ChatMessage,
  Flashcard,
  QuizQuestion,
  QuizResult,
  MindMapNode,
  StudyPlanItem,
} from '@/lib/types';

export interface StudyState {
  // State
  documents: UploadedDocument[];
  activeView: ActiveView;
  chatMessages: ChatMessage[];
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  quizResults: QuizResult[];
  mindMapData: MindMapNode | null;
  studyPlan: StudyPlanItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addDocument: (doc: UploadedDocument) => void;
  removeDocument: (id: string) => void;
  setActiveView: (view: ActiveView) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setFlashcards: (flashcards: Flashcard[]) => void;
  toggleFlashcardMastered: (id: string) => void;
  setQuizQuestions: (questions: QuizQuestion[]) => void;
  addQuizResult: (result: QuizResult) => void;
  setMindMapData: (data: MindMapNode | null) => void;
  setStudyPlan: (plan: StudyPlanItem[]) => void;
  toggleStudyPlanItem: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  getDocumentContent: () => string;
  resetAll: () => void;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      // State
      documents: [],
      activeView: 'upload',
      chatMessages: [],
      flashcards: [],
      quizQuestions: [],
      quizResults: [],
      mindMapData: null,
      studyPlan: [],
      isLoading: false,
      error: null,

      // Actions
      addDocument: (doc: UploadedDocument) =>
        set((state) => ({
          documents: [...state.documents, doc],
        })),

      removeDocument: (id: string) =>
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        })),

      setActiveView: (view: ActiveView) =>
        set({ activeView: view }),

      addChatMessage: (message: ChatMessage) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      clearChat: () =>
        set({ chatMessages: [] }),

      setFlashcards: (flashcards: Flashcard[]) =>
        set({ flashcards }),

      toggleFlashcardMastered: (id: string) =>
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === id ? { ...card, mastered: !card.mastered } : card
          ),
        })),

      setQuizQuestions: (quizQuestions: QuizQuestion[]) =>
        set({ quizQuestions }),

      addQuizResult: (result: QuizResult) =>
        set((state) => ({
          quizResults: [...state.quizResults, result],
        })),

      setMindMapData: (mindMapData: MindMapNode | null) =>
        set({ mindMapData }),

      setStudyPlan: (studyPlan: StudyPlanItem[]) =>
        set({ studyPlan }),

      toggleStudyPlanItem: (id: string) =>
        set((state) => ({
          studyPlan: state.studyPlan.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        })),

      setLoading: (isLoading: boolean) =>
        set({ isLoading }),

      setError: (error: string | null) =>
        set({ error }),

      getDocumentContent: () => {
        return get()
          .documents.map((doc) => doc.content)
          .join('\n\n');
      },

      resetAll: () =>
        set({
          documents: [],
          activeView: 'upload',
          chatMessages: [],
          flashcards: [],
          quizQuestions: [],
          quizResults: [],
          mindMapData: null,
          studyPlan: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'studybuddy-storage',
    }
  )
);
