import { NextRequest, NextResponse } from 'next/server';
import { Flashcard } from '@/lib/types';
import { FlashcardsRequestSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateWithFreeTierPool, extractHeuristicFlashcards } from '@/lib/gemini';

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

        const { text, modelUsed } = await generateWithFreeTierPool(prompt, {
          jsonMode: true,
          temperature: 0.2,
        });

        const cleanJson = stripMarkdownCodeBlocks(text);
        const parsed = JSON.parse(cleanJson);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const flashcards: Flashcard[] = parsed.map((item, idx) => ({
            id: typeof item.id === 'string' ? item.id : `fc-${Date.now()}-${idx}`,
            front: String(item.front || item.question || '').trim(),
            back: String(item.back || item.answer || '').trim(),
            difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty) ? item.difficulty : 'medium',
            mastered: false,
          }));
          return NextResponse.json({ flashcards, modelUsed });
        }
      } catch (aiErr) {
        console.warn('Free-tier AI models temporarily busy; using resilient fallback:', (aiErr as Error).message);
      }
    }

    const fallbackCards = extractHeuristicFlashcards(content, count);
    return NextResponse.json({ flashcards: fallbackCards, modelUsed: 'local-heuristic-engine' });
  } catch (error: unknown) {
    console.error('Flashcards API error:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}
