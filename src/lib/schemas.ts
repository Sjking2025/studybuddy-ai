import { z } from 'zod';

/**
 * Zod validation schemas for all incoming API payloads.
 * Ensures strict runtime type safety, input sanitization, and prevents injection/DoS attacks.
 */

export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message exceeds 10,000 characters limit'),
  context: z.string().max(100000, 'Context exceeds maximum length').optional().default(''),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'model']),
        content: z.string().max(20000),
      })
    )
    .optional()
    .default([]),
});

export const FlashcardsRequestSchema = z.object({
  content: z.string().min(10, 'Study content must be at least 10 characters long').max(150000, 'Content exceeds size limit'),
  count: z.number().int().min(1).max(30).optional().default(10),
});

export const QuizRequestSchema = z.object({
  content: z.string().min(10, 'Study content must be at least 10 characters long').max(150000, 'Content exceeds size limit'),
  count: z.number().int().min(1).max(25).optional().default(10),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']).optional().default('mixed'),
});

export const MindMapRequestSchema = z.object({
  content: z.string().min(10, 'Study content must be at least 10 characters long').max(150000, 'Content exceeds size limit'),
});

export const StudyPlanRequestSchema = z.object({
  content: z.string().min(10, 'Study content must be at least 10 characters long').max(150000, 'Content exceeds size limit'),
  hoursPerDay: z.number().min(0.5).max(12).optional().default(2),
});
