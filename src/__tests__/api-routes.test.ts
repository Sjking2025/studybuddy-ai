import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as flashcardsHandler } from '@/app/api/flashcards/route';
import { POST as quizHandler } from '@/app/api/quiz/route';
import { POST as mindmapHandler } from '@/app/api/mindmap/route';
import { POST as studyPlanHandler } from '@/app/api/study-plan/route';
import { POST as extractTextHandler } from '@/app/api/extract-text/route';

describe('API Route Handlers - Security & Robustness', () => {
  const validStudyText = `Mitochondria is the powerhouse of the cell. It generates most of the chemical energy needed to power the cell biochemical reactions. Chemical energy produced by the mitochondria is stored in a small molecule called adenosine triphosphate (ATP).`;

  describe('POST /api/flashcards', () => {
    it('returns 400 for empty or undersized content', async () => {
      const req = new NextRequest('http://localhost/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Short' }),
      });

      const res = await flashcardsHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data).toHaveProperty('error');
    });

    it('generates flashcards using resilient heuristic engine when AI is offline', async () => {
      const req = new NextRequest('http://localhost/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
        },
        body: JSON.stringify({ content: validStudyText, count: 3 }),
      });

      const res = await flashcardsHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('flashcards');
      expect(Array.isArray(data.flashcards)).toBe(true);
      expect(data.flashcards.length).toBeGreaterThan(0);
      expect(data.flashcards[0]).toHaveProperty('front');
      expect(data.flashcards[0]).toHaveProperty('back');
    });

    it('rejects unknown fields when strict schema is enforced', async () => {
      const req = new NextRequest('http://localhost/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: validStudyText, injectedKey: 'malicious' }),
      });

      const res = await flashcardsHandler(req);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/quiz', () => {
    it('returns 400 for invalid difficulty enum', async () => {
      const req = new NextRequest('http://localhost/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: validStudyText, difficulty: 'impossible' }),
      });

      const res = await quizHandler(req);
      expect(res.status).toBe(400);
    });

    it('generates valid quiz questions with 4 options and answer index', async () => {
      const req = new NextRequest('http://localhost/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.2',
        },
        body: JSON.stringify({ content: validStudyText, count: 2, difficulty: 'medium' }),
      });

      const res = await quizHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('questions');
      expect(Array.isArray(data.questions)).toBe(true);
      expect(data.questions.length).toBeGreaterThan(0);
      expect(data.questions[0].options).toHaveLength(4);
    });
  });

  describe('POST /api/mindmap', () => {
    it('returns 400 when content is missing', async () => {
      const req = new NextRequest('http://localhost/api/mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await mindmapHandler(req);
      expect(res.status).toBe(400);
    });

    it('generates a hierarchical mind map structure', async () => {
      const req = new NextRequest('http://localhost/api/mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.3',
        },
        body: JSON.stringify({ content: validStudyText }),
      });

      const res = await mindmapHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('mindmap');
      expect(data.mindmap).toHaveProperty('id', 'root');
      expect(Array.isArray(data.mindmap.children)).toBe(true);
    });
  });

  describe('POST /api/study-plan', () => {
    it('returns 400 for out-of-range study hours', async () => {
      const req = new NextRequest('http://localhost/api/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: validStudyText, hoursPerDay: 50 }),
      });

      const res = await studyPlanHandler(req);
      expect(res.status).toBe(400);
    });

    it('generates day-by-day revision sprints', async () => {
      const req = new NextRequest('http://localhost/api/study-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '127.0.0.4',
        },
        body: JSON.stringify({ content: validStudyText, hoursPerDay: 3 }),
      });

      const res = await studyPlanHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('plan');
      expect(Array.isArray(data.plan)).toBe(true);
      expect(data.plan.length).toBeGreaterThan(0);
      expect(data.plan[0]).toHaveProperty('duration');
    });
  });

  describe('POST /api/extract-text', () => {
    it('returns 400 when no file is uploaded', async () => {
      const formData = new FormData();
      const req = new NextRequest('http://localhost/api/extract-text', {
        method: 'POST',
        body: formData,
      });

      const res = await extractTextHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('No file provided');
    });

    it('extracts plain text from text/markdown files', async () => {
      const formData = new FormData();
      const file = new File(['Hello StudyBuddy World!'], 'notes.txt', { type: 'text/plain' });
      formData.append('file', file);

      const req = new NextRequest('http://localhost/api/extract-text', {
        method: 'POST',
      });
      // In JSDOM test environment, attach formData resolver
      req.formData = async () => formData;

      const res = await extractTextHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.text).toBe('Hello StudyBuddy World!');
      expect(data.pageCount).toBe(1);
    });
  });
});
