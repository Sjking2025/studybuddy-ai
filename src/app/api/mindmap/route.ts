import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MindMapNode } from '@/lib/types';
import { MindMapRequestSchema } from '@/lib/schemas';
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
    const rateLimit = checkRateLimit(`mindmap-${ip}`, { intervalMs: 60 * 1000, maxRequests: 20 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a minute before generating more mind maps.' },
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

    const validation = MindMapRequestSchema.safeParse(rawJson);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || 'Invalid request parameters.' },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    const prompt = `You are a learning architect utilizing Dual Coding Theory and visual mind-mapping.
Construct a comprehensive hierarchical concept tree representing the main themes, subtopics, and granular definitions in this study material.

RULES:
1. Root node: Overall subject title.
2. 3 to 5 Primary Branch nodes (Major concepts).
3. 2 to 4 Sub-branches under each major concept with concrete key facts.
4. Output MUST be ONLY valid JSON matching the MindMapNode recursive structure.

STUDY MATERIAL:
"""
${content}
"""

FORMAT TEMPLATE:
{
  "id": "root",
  "label": "Central Subject",
  "children": [
    {
      "id": "node-1",
      "label": "Subtopic A",
      "children": [
        { "id": "node-1-1", "label": "Detail fact", "children": [] }
      ]
    }
  ]
}`;

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

    let parsedTree: unknown;
    try {
      parsedTree = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI generated mind map JSON.' }, { status: 500 });
    }

    const sanitizeNode = (node: any, fallbackId: string): MindMapNode => {
      const label = typeof node?.label === 'string' ? node.label : 'Concept';
      const id = typeof node?.id === 'string' ? node.id : fallbackId;
      const rawChildren = Array.isArray(node?.children) ? node.children : [];
      const children = rawChildren.map((c: any, i: number) => sanitizeNode(c, `${id}-${i}`));
      return { id, label, children };
    };

    const mindmap = sanitizeNode(parsedTree, 'root');
    return NextResponse.json({ mindmap });
  } catch (error: unknown) {
    console.error('MindMap API error:', error);
    const msg = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
