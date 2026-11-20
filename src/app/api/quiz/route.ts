import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QuizQuestion } from '@/lib/types';
import { QuizRequestSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';

function stripMarkdownCodeBlocks(raw: string): string {
  let cleaned = raw.trim();
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  } else {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous-client';
    const rateLimit = checkRateLimit(`quiz-${ip}`, { intervalMs: 60 * 1000, maxRequests: 20 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before generating more quizzes.' },
        { status: 429 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    let rawJson: unknown;
    try {
      rawJson = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const validation = QuizRequestSchema.safeParse(rawJson);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid request parameters.' },
        { status: 400 }
      );
    }

    const { content, count, difficulty } = validation.data;

    const prompt = `You are an educational assessment designer specialized in psychometrics and formative evaluation.
Generate ${count} high-quality Multiple Choice Questions (MCQs) evaluating the provided study material at a "${difficulty}" cognitive level.

RULES:
1. Each question must have 4 distinct, plausible options. Exactly one correct answer.
2. "correctAnswer": Zero-based index (0, 1, 2, or 3) of the correct option.
3. "explanation": Comprehensive rationale explaining why the correct choice is right and common pitfalls of distractors.
4. "topic": Concise topic tag.
5. Return ONLY a valid JSON array.

STUDY MATERIAL:
"""
${content}
"""

FORMAT TEMPLATE:
[
  {
    "id": "q-1",
    "question": "Clear stem question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed rationale...",
    "topic": "Core Subject"
  }
]`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const response = await model.generateContent(prompt);
    const rawText = response.response.text();
    const cleanJson = stripMarkdownCodeBlocks(rawText);

    let parsedQuestions: unknown;
    try {
      parsedQuestions = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI generated quiz JSON.' }, { status: 500 });
    }

    if (!Array.isArray(parsedQuestions)) {
      return NextResponse.json({ error: 'AI output format was not an array.' }, { status: 500 });
    }

    const questions: QuizQuestion[] = parsedQuestions.map((item, idx) => ({
      id: typeof item.id === 'string' && item.id ? item.id : `q-${Date.now()}-${idx}`,
      question: String(item.question || '').trim(),
      options: Array.isArray(item.options) && item.options.length === 4
        ? item.options.map(String)
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: typeof item.correctAnswer === 'number' && item.correctAnswer >= 0 && item.correctAnswer <= 3
        ? item.correctAnswer
        : 0,
      explanation: String(item.explanation || 'No explanation provided.').trim(),
      topic: String(item.topic || 'General').trim(),
    }));

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error('Quiz API error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
