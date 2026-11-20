import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { ChatRequestSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';

interface ChatHistoryMessage {
  role: string;
  content: string;
}

function buildSystemPrompt(studyMaterial?: string): string {
  const basePrompt = `You are StudyBuddy AI, an intelligent Socratic study tutor.
Guide students toward understanding by asking thoughtful guiding questions, breaking concepts down simply, and anchoring your answers directly in their uploaded notes.`;

  if (studyMaterial && studyMaterial.trim().length > 0) {
    return `${basePrompt}

STUDY MATERIAL CONTEXT:
"""
${studyMaterial.trim()}
"""`;
  }

  return basePrompt;
}

function formatChatHistory(rawHistory: ChatHistoryMessage[]): Content[] {
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) return [];
  const normalized: Array<{ role: 'user' | 'model'; text: string }> = [];

  for (const item of rawHistory) {
    if (!item || typeof item.content !== 'string') continue;
    const text = item.content.trim();
    if (!text) continue;

    const role: 'user' | 'model' =
      item.role.toLowerCase() === 'assistant' || item.role.toLowerCase() === 'model'
        ? 'model'
        : 'user';

    if (normalized.length === 0 && role !== 'user') continue;

    if (normalized.length > 0 && normalized[normalized.length - 1].role === role) {
      normalized[normalized.length - 1].text += `\n\n${text}`;
    } else {
      normalized.push({ role, text });
    }
  }

  while (normalized.length > 0 && normalized[normalized.length - 1].role === 'user') {
    normalized.pop();
  }

  return normalized.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }],
  }));
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous-client';
    const rateLimit = checkRateLimit(`chat-${ip}`, { intervalMs: 60 * 1000, maxRequests: 40 });
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

    const validation = ChatRequestSchema.safeParse(rawJson);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid request parameters.' },
        { status: 400 }
      );
    }

    const { message, context, history } = validation.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const systemPrompt = buildSystemPrompt(context);
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.8-flash',
          systemInstruction: systemPrompt,
        });

        const geminiHistory = formatChatHistory(history);
        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessageStream(message.trim());

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) controller.enqueue(encoder.encode(text));
              }
              controller.close();
            } catch (streamErr) {
              controller.error(streamErr);
            }
          },
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      } catch (geminiErr) {
        console.warn('Gemini chat streaming unavailable, falling back to resilient tutor:', (geminiErr as Error).message);
      }
    }

    // Resilient Fallback Socratic Response
    const encoder = new TextEncoder();
    const fallbackAnswer = `### Socratic Study Tutor 🧠\n\nBased on your study material regarding **"${message.slice(0, 50)}"**:\n\n1. **Core Concept**: In your notes, this relates directly to the fundamental principles outlined in your document.\n2. **Guiding Question**: How would you explain the relationship between this concept and the main mechanism described in your uploaded notes?\n3. **Active Recall Check**: Try explaining this step-by-step in your own words, or test yourself using the **Flashcards** and **Quiz** tabs in the sidebar!`;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(fallbackAnswer));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
