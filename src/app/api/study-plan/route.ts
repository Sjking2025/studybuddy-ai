import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudyPlanItem } from '@/lib/types';
import { StudyPlanRequestSchema } from '@/lib/schemas';
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
    const rateLimit = checkRateLimit(`studyplan-${ip}`, { intervalMs: 60 * 1000, maxRequests: 20 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before generating more study plans.' },
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

    const validation = StudyPlanRequestSchema.safeParse(rawJson);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid request parameters.' },
        { status: 400 }
      );
    }

    const { content, hoursPerDay } = validation.data;

    const prompt = `You are an academic coach and learning strategist.
Create an optimal, day-by-day revision roadmap for the following material, assuming a student studies ${hoursPerDay} hours per day.

ORDERING CRITERIA:
1. Sequence fundamental concepts before advanced applications.
2. Group related topics into 30 to 60 minute focused sprint sessions.
3. Assign priority ('high', 'medium', 'low') based on exam weight and core dependency.
4. Output MUST be ONLY a valid raw JSON array of objects.

STUDY MATERIAL:
"""
${content}
"""

FORMAT TEMPLATE:
[
  {
    "id": "step-1",
    "topic": "Core Foundations",
    "duration": "45 mins",
    "priority": "high",
    "completed": false,
    "description": "Master terminology and basic equations."
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

    let parsedPlan: unknown;
    try {
      parsedPlan = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI generated study plan JSON.' }, { status: 500 });
    }

    if (!Array.isArray(parsedPlan)) {
      return NextResponse.json({ error: 'AI output format was not an array.' }, { status: 500 });
    }

    const plan: StudyPlanItem[] = parsedPlan.map((item, idx) => ({
      id: typeof item.id === 'string' && item.id ? item.id : `plan-${Date.now()}-${idx}`,
      topic: String(item.topic || 'Revision Session').trim(),
      duration: String(item.duration || '45 mins').trim(),
      priority: ['high', 'medium', 'low'].includes(item.priority)
        ? (item.priority as 'high' | 'medium' | 'low')
        : 'medium',
      completed: false,
      description: String(item.description || 'Focus on active recall and self-testing.').trim(),
    }));

    return NextResponse.json({ plan });
  } catch (error: unknown) {
    console.error('StudyPlan API error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
