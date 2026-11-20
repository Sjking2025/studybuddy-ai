import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Flashcard } from '@/lib/types';
import { FlashcardsRequestSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';
import { extractHeuristicFlashcards } from '@/lib/gemini';

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
    const rateLimit = checkRateLimit(`flashcards-${ip}`, { intervalMs: 60 * 1000, maxRequests: 30 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

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
    const apiKey = process.env.GEMINI_API_KEY;

    // Resilient Strategy: Try Google Gemini API with timeout, fall back to heuristic extraction on 503/timeout
    if (apiKey) {
      try {
        const prompt = `Generate ${count} active-recall flashcards from this study material in valid JSON format:
[
  { "id": "fc-1", "front": "Question...", "back": "Answer...", "difficulty": "medium", "mastered": false }
]
Material:
"""
${content}
"""`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.8-flash',
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        });

        // 6 second timeout race
        const generatePromise = model.generateContent(prompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI timeout')), 6000)
        );

        const response = await Promise.race([generatePromise, timeoutPromise]);
        const cleanJson = stripMarkdownCodeBlocks(response.response.text());
        const parsed = JSON.parse(cleanJson);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const flashcards: Flashcard[] = parsed.map((item, idx) => ({
            id: typeof item.id === 'string' ? item.id : `fc-${Date.now()}-${idx}`,
            front: String(item.front || item.question || '').trim(),
            back: String(item.back || item.answer || '').trim(),
            difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty) ? item.difficulty : 'medium',
            mastered: false,
          }));
          return NextResponse.json({ flashcards });
        }
      } catch (aiErr) {
        console.warn('Gemini API unavailable or timed out; activating resilient fallback:', (aiErr as Error).message);
      }
    }

    // High-yield fallback: guaranteed 100% success from uploaded content
    const fallbackCards = extractHeuristicFlashcards(content, count);
    return NextResponse.json({ flashcards: fallbackCards });
  } catch (error: unknown) {
    console.error('Flashcards API error:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
