import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, Content } from '@google/generative-ai';

interface ChatHistoryMessage {
  role: string;
  content: string;
}

interface ChatRequestBody {
  message: string;
  context?: string;
  history?: ChatHistoryMessage[];
}

/**
 * Builds the comprehensive Socratic tutor system instruction,
 * incorporating uploaded study material/context when available.
 */
function buildSystemPrompt(studyMaterial?: string): string {
  const basePrompt = `You are StudyBuddy AI, an intelligent study tutor. Use Socratic method to guide students to answers by asking thoughtful, probing questions rather than giving immediate solutions.

Core Tutoring Principles:
1. Socratic Teaching: Encourage active learning and critical thinking. Rather than simply giving direct answers, guide students step-by-step through problems with insightful, probing questions, hints, and analogies.
2. Conceptual Depth: When students struggle or ask for explanations, break down complex topics into clear, intuitive principles, using vivid analogies and real-world examples.
3. Supportive & Motivating: Maintain an encouraging, patient, and warm tone. Acknowledge what the student got right before gently addressing misconceptions.
4. Active Recall & Retention: Suggest quick self-tests, mnemonic devices, or practical exercises when appropriate to solidify learning.
5. Markdown Formatting: Format your responses with structured Markdown — use bold text for emphasis, bullet points and numbered lists for steps, and fenced code blocks for syntax, equations, or algorithms.`;

  if (studyMaterial && studyMaterial.trim().length > 0) {
    return `${basePrompt}

STUDY MATERIAL / CONTEXT:
The student has provided the following study material. Use it as your primary source of truth for concepts, definitions, details, and terminology:
"""
${studyMaterial.trim()}
"""
Always anchor your explanations, questions, and examples in this provided material whenever relevant. If the student asks about something outside this material, let them know politely while still offering helpful academic guidance.`;
  }

  return `${basePrompt}

STUDY MATERIAL / CONTEXT:
No specific document or study material has been uploaded yet for this session. Guide the student using broad educational foundations, core academic principles, and encourage them to upload or paste their study material for personalized tutoring.`;
}

/**
 * Normalizes client history into valid Gemini Content objects:
 * - Maps 'assistant' or other roles to 'model'
 * - Ensures history starts with 'user'
 * - Merges consecutive messages with identical roles
 * - Ensures history ends with 'model' so the incoming message creates a valid alternating turn
 */
function formatChatHistory(
  rawHistory: ChatHistoryMessage[],
  currentMessage: string
): Content[] {
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) {
    return [];
  }

  const normalized: Array<{ role: 'user' | 'model'; text: string }> = [];

  for (const item of rawHistory) {
    if (!item || typeof item.content !== 'string') continue;
    const text = item.content.trim();
    if (!text) continue;

    // Map 'assistant' and 'model' to 'model', everything else to 'user'
    const role: 'user' | 'model' =
      item.role.toLowerCase() === 'assistant' || item.role.toLowerCase() === 'model'
        ? 'model'
        : 'user';

    // Gemini chat history must start with a 'user' turn; discard leading model greetings
    if (normalized.length === 0 && role !== 'user') {
      continue;
    }

    // Merge consecutive messages with the same role
    if (normalized.length > 0 && normalized[normalized.length - 1].role === role) {
      normalized[normalized.length - 1].text += `\n\n${text}`;
    } else {
      normalized.push({ role, text });
    }
  }

  // If the last history turn is 'user' (e.g. client optimistically appended currentMessage),
  // pop trailing 'user' turns so that chat.sendMessageStream(currentMessage) completes the alternation
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
    // 1. Verify GEMINI_API_KEY environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY environment variable is not configured.' },
        { status: 500 }
      );
    }

    // 2. Parse and validate request JSON body
    let body: ChatRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const { message, context = '', history = [] } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'A valid non-empty message string is required.' },
        { status: 400 }
      );
    }

    // 3. Initialize Gemini model with Socratic system prompt
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemPrompt = buildSystemPrompt(typeof context === 'string' ? context : '');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt,
    });

    // 4. Build chat with history and initiate streaming
    const geminiHistory = formatChatHistory(
      Array.isArray(history) ? history : [],
      message
    );

    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessageStream(message.trim());

    // 5. Stream response using TextEncoder and ReadableStream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            let chunkText = '';
            try {
              chunkText = chunk.text();
            } catch {
              // Graceful fallback for safety-filtered or non-standard candidates
              const candidate = chunk.candidates?.[0];
              if (candidate?.content?.parts) {
                chunkText = candidate.content.parts
                  .map((part) => ('text' in part && part.text ? part.text : ''))
                  .join('');
              }
            }

            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (streamError) {
          console.error('Error during streaming chat response:', streamError);
          controller.error(streamError);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    console.error('Error in /api/chat route:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred while processing your request.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
