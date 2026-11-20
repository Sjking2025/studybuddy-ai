import { describe, it, expect } from 'vitest';
import {
  ChatRequestSchema,
  FlashcardsRequestSchema,
  QuizRequestSchema,
  MindMapRequestSchema,
  StudyPlanRequestSchema,
} from '@/lib/schemas';

describe('Zod Input Validation Schemas', () => {
  it('validates chat request schema', () => {
    const valid = ChatRequestSchema.safeParse({
      message: 'Explain thermodynamics',
      context: 'Heat transfer notes',
    });
    expect(valid.success).toBe(true);

    const empty = ChatRequestSchema.safeParse({ message: '' });
    expect(empty.success).toBe(false);
  });

  it('validates flashcards request schema bounds', () => {
    const valid = FlashcardsRequestSchema.safeParse({
      content: 'This is sufficiently long study material to generate cards.',
      count: 15,
    });
    expect(valid.success).toBe(true);

    const tooShort = FlashcardsRequestSchema.safeParse({ content: 'Short' });
    expect(tooShort.success).toBe(false);

    const excessiveCount = FlashcardsRequestSchema.safeParse({
      content: 'Valid content text for study.',
      count: 100,
    });
    expect(excessiveCount.success).toBe(false);
  });

  it('validates quiz difficulty and count schemas', () => {
    const valid = QuizRequestSchema.safeParse({
      content: 'Valid lecture notes on machine learning algorithms.',
      difficulty: 'hard',
      count: 5,
    });
    expect(valid.success).toBe(true);

    const invalidDiff = QuizRequestSchema.safeParse({
      content: 'Valid lecture notes on machine learning algorithms.',
      difficulty: 'impossible',
    });
    expect(invalidDiff.success).toBe(false);
  });

  it('validates mind map and study plan schemas', () => {
    expect(MindMapRequestSchema.safeParse({ content: 'Valid material text.' }).success).toBe(true);
    expect(
      StudyPlanRequestSchema.safeParse({ content: 'Valid study plan text content.', hoursPerDay: 4 }).success
    ).toBe(true);
  });
});
