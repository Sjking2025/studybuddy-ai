import { NextRequest, NextResponse } from 'next/server';
import { MindMapNode } from '@/lib/types';
import { MindMapRequestSchema } from '@/lib/schemas';
import { checkRateLimit } from '@/lib/rate-limit';
import { generateWithFreeTierPool, extractHeuristicMindMap } from '@/lib/gemini';

function stripMarkdownCodeBlocks(raw: string): string {
  let cleaned = raw.trim();
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleaned.match(codeBlockRegex);
  if (match && match[1]) {
    cleaned = match[1].trim();
  } else {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous-client';
    const rateLimit = checkRateLimit(`mindmap-${ip}`, { intervalMs: 60 * 1000, maxRequests: 30 });
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

    const validation = MindMapRequestSchema.safeParse(rawJson);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid request parameters.' },
        { status: 400 }
      );
    }

    const { content } = validation.data;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `Create a hierarchical mind map JSON from this study material with a root node and 3-5 major branches:
{
  "id": "root",
  "label": "Title",
  "children": [
    { "id": "n1", "label": "Branch", "children": [{ "id": "n1-1", "label": "Detail", "children": [] }] }
  ]
}
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

        if (parsed && typeof parsed === 'object' && parsed.label) {
          return NextResponse.json({ mindmap: parsed, modelUsed });
        }
      } catch (aiErr) {
        console.warn('Free-tier AI models temporarily busy; using resilient fallback:', (aiErr as Error).message);
      }
    }

    const fallbackMindMap = extractHeuristicMindMap(content);
    return NextResponse.json({ mindmap: fallbackMindMap, modelUsed: 'local-heuristic-engine' });
  } catch (error: unknown) {
    console.error('MindMap API error:', error);
    return NextResponse.json({ error: 'Failed to generate mind map' }, { status: 500 });
  }
}
