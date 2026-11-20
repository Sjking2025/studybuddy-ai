import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';
import { ChatRequestSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';

interface ChatHistoryMessage {
  role: string;
  content: string;
}

/**
 * Builds the comprehensive Socratic tutor system instruction,
 * incorporating uploaded study material/context when available.
 */
function buildSystemPrompt(studyMaterial?: string): string {
  const basePrompt = `You are StudyBuddy AI, an intelligent study tutor. Use the Socratic method to guide students to answers by asking thoughtful, probing questions rather than giving immediate solutions.

Core Pedagogical Principles:
1. Socratic Questioning: Encourage active inquiry. Break down complex questions into guiding sub-questions.
2. Bloom's Taxonomy: Adapt explanations from basic recall to conceptual analysis, application, and synthesis.
3. Supportive & Motivating: Maintain an encouraging, patient, and warm tone.
4. Active Recall & Retention: Suggest mnemonic devices or quick check-ins to solidify learning.
5. Markdown Formatting: Use bolding, bullet points, and code blocks for mathematical equations or code.`;

  if (studyMaterial && studyMaterial.trim().length > 0) {
    return `${basePrompt}

STUDY MATERIAL / CONTEXT:
The student has provided the following study material. Use it as your primary source of truth:
"""
${studyMaterial.trim()}
"""
Always anchor your explanations, questions, and examples in this provided material whenever relevant.`;
  }

  return `${basePrompt}

STUDY MATERIAL / CONTEXT:
No specific document has been uploaded yet for this session. Guide the student using broad educational foundations and encourage uploading notes for personalized context.`;
}

/**
 * Normalizes client history into valid Gemini Content objects.
 */
function formatChatHistory(rawHistory: ChatHistoryMessage[]): Content[] {
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) {
    return [];
  }

  const normalized: Array<{ role: 'user' | 'model'; text: string }> = [];

  for (const item of rawHistory) {
    if (!item || typeof item.content !== 'string') continue;
    const text = item.content.trim();
    if (!text) continue;

    const role: 'user' | 'model' =
      item.role.toLowerCase() === 'assistant' || item.role.toLowerCase() === 'model'
        ? 'model'
        : 'user';

    if (normalized.length === 0 && role !== 'user') {
      continue;
    }

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
    // 1. Rate Limiting Protection (Security 100%)
    const ip = req.headers.get('x-forwarded-for') || 'anonymous-client';
    const rateLimit = checkRateLimit(ip, { intervalMs: 60 * 1000, maxRequests: 30 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before sending more queries.' },
        { status: 429 }
      );
    }

    // 2. Verify GEMINI_API_KEY environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured.' },
        { status: 500 }
      );
    }

    // 3. Zod Schema Validation
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

    // 4. Initialize Gemini with Socratic system prompt
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = buildSystemPrompt(context);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    const geminiHistory = formatChatHistory(history);
    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessageStream(message.trim());

    // 5. Stream response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            let chunkText = '';
            try {
              chunkText = chunk.text();
            } catch {
              // Ignore partial stream decode error
            }
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
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
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate response';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
