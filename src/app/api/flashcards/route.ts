import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Flashcard } from '@/lib/types';
import { generateWithGemini } from '@/lib/gemini';

interface RequestBody {
  content: string;
  count?: number;
}

/**
 * Strips markdown code blocks (e.g. ```json ... ``` or ``` ... ```)
 * and extracts the valid JSON array substring.
 */
function stripMarkdownCodeBlocks(raw: string): string {
  let cleaned = raw.trim();

  // Match markdown fenced code block
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  } else {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  // Extract JSON array substring if surrounding text is present
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const { content, count } = body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required to generate flashcards' },
        { status: 400 }
      );
    }

    // Default 10 cards if not provided or invalid
    const cardCount =
      typeof count === 'number' && count > 0
        ? Math.min(Math.floor(count), 50)
        : 10;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured' },
        { status: 500 }
      );
    }

    const prompt = `You are an expert AI tutor. Generate exactly ${cardCount} high-quality study flashcards based on the provided content.

Study Content:
"""
${content.trim()}
"""

Requirements:
1. Generate exactly ${cardCount} flashcards covering the key concepts, definitions, formulas, facts, and core insights from the content.
2. Formulate clear, concise questions or prompts for the "front".
3. Provide comprehensive, accurate, and easy-to-understand explanations or answers for the "back".
4. Assign an appropriate difficulty level to each card: "easy", "medium", or "hard". Ensure a balanced mix of difficulties.
5. Set "mastered" to false for all cards.
6. Return ONLY a valid JSON array of flashcard objects matching this exact structure:
[
  {
    "id": "1",
    "front": "Question or prompt",
    "back": "Answer or explanation",
    "difficulty": "easy",
    "mastered": false
  }
]

Do not include any introductory remarks, markdown code block fences other than standard JSON, or concluding comments.`;

    let rawResponse = '';
    try {
      rawResponse = await generateWithGemini(prompt);
    } catch {
      // Fallback to fresh client instance if module-level client had issues
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      rawResponse = result.response.text();
    }

    if (!rawResponse || !rawResponse.trim()) {
      return NextResponse.json(
        { error: 'Empty response received from Gemini' },
        { status: 500 }
      );
    }

    // Parse JSON response (strip markdown code blocks if present)
    const cleanedJson = stripMarkdownCodeBlocks(rawResponse);
    let parsedCards: unknown;

    try {
      parsedCards = JSON.parse(cleanedJson);
    } catch {
      // If parsing cleanedJson failed, try looking for an object containing flashcards
      try {
        const objStart = rawResponse.indexOf('{');
        const objEnd = rawResponse.lastIndexOf('}');
        if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
          const parsedObj = JSON.parse(rawResponse.substring(objStart, objEnd + 1));
          parsedCards = parsedObj.flashcards || parsedObj.cards;
        }
      } catch {
        // fallback parsing failed
      }

      if (!parsedCards) {
        return NextResponse.json(
          { error: 'Failed to parse JSON response from Gemini' },
          { status: 500 }
        );
      }
    }

    // Normalize array
    let cardArray: any[] = [];
    if (Array.isArray(parsedCards)) {
      cardArray = parsedCards;
    } else if (
      typeof parsedCards === 'object' &&
      parsedCards !== null &&
      'flashcards' in parsedCards &&
      Array.isArray((parsedCards as any).flashcards)
    ) {
      cardArray = (parsedCards as any).flashcards;
    } else {
      return NextResponse.json(
        { error: 'Generated flashcards response is not an array' },
        { status: 500 }
      );
    }

    const flashcards: Flashcard[] = cardArray.map((card: any, index: number) => {
      const difficultyLower =
        typeof card.difficulty === 'string'
          ? card.difficulty.toLowerCase().trim()
          : '';
      const difficulty: 'easy' | 'medium' | 'hard' =
        difficultyLower === 'easy' || difficultyLower === 'hard'
          ? difficultyLower
          : 'medium';

      const id = card.id ? String(card.id) : `card-${Date.now()}-${index + 1}`;
      const front =
        typeof card.front === 'string' && card.front.trim()
          ? card.front.trim()
          : String(card.question || `Card ${index + 1}`);
      const back =
        typeof card.back === 'string' && card.back.trim()
          ? card.back.trim()
          : String(card.answer || '');

      return {
        id,
        front,
        back,
        difficulty,
        mastered: false,
      };
    });

    return NextResponse.json({ flashcards }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while generating flashcards' },
      { status: 500 }
    );
  }
}
