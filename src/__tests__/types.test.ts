import { describe, it, expect } from 'vitest';
import {
  Flashcard,
  QuizQuestion,
  QuizResult,
  MindMapNode,
  StudyPlanItem,
  ChatMessage,
  UploadedDocument,
} from '@/lib/types';

describe('TypeScript Contract Validation', () => {
  it('validates Flashcard type schema', () => {
    const card: Flashcard = {
      id: 'fc-101',
      front: 'Newton Second Law',
      back: 'F = ma',
      difficulty: 'easy',
      mastered: true,
    };
    expect(card.difficulty).toMatch(/easy|medium|hard/);
    expect(card.mastered).toBe(true);
  });

  it('validates QuizQuestion options and index alignment', () => {
    const question: QuizQuestion = {
      id: 'qq-1',
      question: 'Which element has the symbol O?',
      options: ['Gold', 'Oxygen', 'Osmium', 'Iron'],
      correctAnswer: 1,
      explanation: 'Oxygen is represented by O.',
      topic: 'Chemistry',
    };
    expect(question.options[question.correctAnswer]).toBe('Oxygen');
    expect(question.options).toHaveLength(4);
  });

  it('validates MindMap recursive node structure', () => {
    const tree: MindMapNode = {
      id: 'root',
      label: 'Computer Science',
      children: [
        {
          id: 'sub-1',
          label: 'Data Structures',
          children: [
            { id: 'sub-1-1', label: 'Binary Trees', children: [] },
          ],
        },
      ],
    };
    expect(tree.children[0].children[0].label).toBe('Binary Trees');
  });

  it('validates StudyPlanItem priority levels', () => {
    const plan: StudyPlanItem = {
      id: 'sp-1',
      topic: 'Calculus III',
      duration: '1 hr',
      priority: 'high',
      completed: false,
      description: 'Multivariable integrals',
    };
    expect(['high', 'medium', 'low']).toContain(plan.priority);
  });
});
