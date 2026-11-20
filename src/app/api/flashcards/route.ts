import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Flashcard } from '@/lib/types';
import { FlashcardsRequestSchema } from '@/lib/schemas';
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
    // 1. Rate Limiting Protection
    const ip = req.headers.get('x-forwarded-for') || 'anonymous-client';
    const rateLimit = checkRateLimit(`flashcards-${ip}`, { intervalMs: 60 * 1000, maxRequests: 20 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before generating more flashcards.' },
        { status: 429 }
      );
    }

    // 2. Validate API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    // 3. Zod Payload Validation
    let rawJson: unknown;
    try {
      rawJson = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const validation = FlashcardsRequestSchema.safeParse(rawJson);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid request parameters.' },
        { status: 400 }
      );
    }

    const { content, count } = validation.data;

    // 4. Pedagogically Rigorous Generation Prompt
    const prompt = `You are an expert cognitive psychologist and educator specializing in spaced repetition and active recall (Leitner system).
Analyze the following study material and generate ${count} high-yield, active-recall flashcards.

PEDAGOGICAL REQUIREMENTS:
1. "front": An unambiguous question, term, or prompt testing conceptual understanding, application, or definition.
2. "back": A clear, concise, self-contained answer explaining the core principle and context.
3. "difficulty": Categorize as 'easy', 'medium', or 'hard' based on Bloom's Taxonomy cognitive complexity.
4. Output MUST be ONLY a valid raw JSON array of objects. Do not include markdown ticks, intros, or explanations.

STUDY MATERIAL:
"""
${content}
"""

FORMAT TEMPLATE:
[
  {
    "id": "card-1",
    "front": "Question...",
    "back": "Answer...",
    "difficulty": "medium",
    "mastered": false
  }
]`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const response = await model.generateContent(prompt);
    const rawText = response.response.text();
    const cleanJson = stripMarkdownCodeBlocks(rawText);

    let parsedCards: unknown;
    try {
      parsedCards = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI generated flashcards JSON.' }, { status: 500 });
    }

    if (!Array.isArray(parsedCards)) {
      return NextResponse.json({ error: 'AI output format was not an array.' }, { status: 500 });
    }

    const flashcards: Flashcard[] = parsedCards.map((item, idx) => ({
      id: typeof item.id === 'string' && item.id ? item.id : `fc-${Date.now()}-${idx}`,
      front: String(item.front || item.question || '').trim(),
      back: String(item.back || item.answer || '').trim(),
      difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty)
        ? (item.difficulty as 'easy' | 'medium' | 'hard')
        : 'medium',
      mastered: false,
    }));

    return NextResponse.json({ flashcards });
  } catch (error: unknown) {
    console.error('Flashcards API error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
