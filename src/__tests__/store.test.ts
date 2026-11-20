import { describe, it, expect, beforeEach } from 'vitest';
import { useStudyStore } from '@/lib/store';
import { UploadedDocument, Flashcard, QuizQuestion, QuizResult } from '@/lib/types';

describe('useStudyStore - Zustand State Management', () => {
  beforeEach(() => {
    useStudyStore.getState().resetAll();
  });

  it('initializes with default empty state', () => {
    const state = useStudyStore.getState();
    expect(state.documents).toEqual([]);
    expect(state.activeView).toBe('upload');
    expect(state.chatMessages).toEqual([]);
    expect(state.flashcards).toEqual([]);
    expect(state.quizQuestions).toEqual([]);
    expect(state.quizResults).toEqual([]);
    expect(state.mindMapData).toBeNull();
    expect(state.studyPlan).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('adds and removes documents correctly', () => {
    const doc: UploadedDocument = {
      id: 'doc-1',
      name: 'Biology 101.pdf',
      content: 'Mitochondria is the powerhouse of the cell.',
      uploadedAt: new Date(),
      pageCount: 3,
    };

    useStudyStore.getState().addDocument(doc);
    expect(useStudyStore.getState().documents).toHaveLength(1);
    expect(useStudyStore.getState().documents[0].name).toBe('Biology 101.pdf');
    expect(useStudyStore.getState().getDocumentContent()).toContain('Mitochondria is the powerhouse of the cell.');

    useStudyStore.getState().removeDocument('doc-1');
    expect(useStudyStore.getState().documents).toHaveLength(0);
    expect(useStudyStore.getState().getDocumentContent()).toBe('');
  });

  it('switches active dashboard view', () => {
    useStudyStore.getState().setActiveView('flashcards');
    expect(useStudyStore.getState().activeView).toBe('flashcards');

    useStudyStore.getState().setActiveView('quiz');
    expect(useStudyStore.getState().activeView).toBe('quiz');
  });

  it('handles flashcards generation and mastery toggle', () => {
    const card: Flashcard = {
      id: 'card-1',
      front: 'What is photosynthesis?',
      back: 'The process by which plants use sunlight to synthesize nutrients.',
      difficulty: 'medium',
      mastered: false,
    };

    useStudyStore.getState().setFlashcards([card]);
    expect(useStudyStore.getState().flashcards).toHaveLength(1);
    expect(useStudyStore.getState().flashcards[0].mastered).toBe(false);

    useStudyStore.getState().toggleFlashcardMastered('card-1');
    expect(useStudyStore.getState().flashcards[0].mastered).toBe(true);

    useStudyStore.getState().toggleFlashcardMastered('card-1');
    expect(useStudyStore.getState().flashcards[0].mastered).toBe(false);
  });

  it('records quiz results accurately', () => {
    const question: QuizQuestion = {
      id: 'q-1',
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
      correctAnswer: 2,
      explanation: 'Paris is the capital of France.',
      topic: 'Geography',
    };

    useStudyStore.getState().setQuizQuestions([question]);
    expect(useStudyStore.getState().quizQuestions).toHaveLength(1);

    const result: QuizResult = {
      id: 'res-1',
      score: 1,
      totalQuestions: 1,
      percentage: 100,
      date: new Date().toISOString(),
      timeTaken: 15,
      answers: [{ questionId: 'q-1', selectedAnswer: 2, isCorrect: true }],
    };

    useStudyStore.getState().addQuizResult(result);
    expect(useStudyStore.getState().quizResults).toHaveLength(1);
    expect(useStudyStore.getState().quizResults[0].percentage).toBe(100);
  });

  it('manages chat messages and clears history', () => {
    useStudyStore.getState().addChatMessage({
      id: 'msg-1',
      role: 'user',
      content: 'Explain quantum computing.',
      timestamp: new Date(),
    });

    expect(useStudyStore.getState().chatMessages).toHaveLength(1);
    expect(useStudyStore.getState().chatMessages[0].content).toBe('Explain quantum computing.');

    useStudyStore.getState().clearChat();
    expect(useStudyStore.getState().chatMessages).toHaveLength(0);
  });

  it('sets and toggles study plan items', () => {
    useStudyStore.getState().setStudyPlan([
      {
        id: 'plan-1',
        topic: 'Linear Algebra',
        duration: '45 mins',
        priority: 'high',
        completed: false,
        description: 'Review matrices and determinants.',
      },
    ]);

    expect(useStudyStore.getState().studyPlan[0].completed).toBe(false);
    useStudyStore.getState().toggleStudyPlanItem('plan-1');
    expect(useStudyStore.getState().studyPlan[0].completed).toBe(true);
  });
});
