export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastered: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export interface QuizResult {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: string;
  timeTaken: number;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
}

export interface MindMapNode {
  id: string;
  label: string;
  children: MindMapNode[];
  color?: string;
}

export interface StudyPlanItem {
  id: string;
  topic: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UploadedDocument {
  id: string;
  name: string;
  content: string;
  uploadedAt: Date;
  pageCount?: number;
}

export type ActiveView =
  | 'upload'
  | 'chat'
  | 'flashcards'
  | 'quiz'
  | 'mindmap'
  | 'study-plan'
  | 'progress';
