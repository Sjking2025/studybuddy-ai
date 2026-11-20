import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MindMapNode } from '@/lib/types';
import { geminiModel } from '@/lib/gemini';

interface BranchTheme {
  primary: string;
  sub: string[];
}

// Dark-theme optimized purple / indigo / blue palette
const PURPLE_INDIGO_BLUE_PALETTE: BranchTheme[] = [
  {
    primary: '#8b5cf6', // purple-500
    sub: ['#a78bfa', '#c084fc', '#c4b5fd', '#d8b4fe'],
  },
  {
    primary: '#6366f1', // indigo-500
    sub: ['#818cf8', '#a5b4fc', '#c7d2fe', '#4f46e5'],
  },
  {
    primary: '#3b82f6', // blue-500
    sub: ['#60a5fa', '#93c5fd', '#bfdbfe', '#2563eb'],
  },
  {
    primary: '#a855f7', // violet-500
    sub: ['#c084fc', '#d8b4fe', '#f3e8ff', '#9333ea'],
  },
  {
    primary: '#06b6d4', // cyan-500
    sub: ['#38bdf8', '#7dd3fc', '#bae6fd', '#0284c7'],
  },
];

const ROOT_COLOR = '#8b5cf6';

function isHexColor(color: unknown): boolean {
  return (
    typeof color === 'string' &&
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)
  );
}

function buildGeminiPrompt(content: string): string {
  return `You are an expert educator and visual learning specialist.
Analyze the following study material and generate a clear, hierarchical mind map as a structured JSON object.

Study Content:
"""
${content.slice(0, 25000)}
"""

Hierarchy and Structure Rules:
1. Root Node:
   - "id": "root"
   - "label": The central topic or title of the subject (concise, 2-6 words).
   - "color": "#8b5cf6"
   - "children": Array containing between 3 to 5 main branch nodes.

2. Main Branches (strictly 3 to 5 branches directly under root):
   - "id": Unique identifier (e.g., "branch-1", "branch-2", etc.).
   - "label": Core concept, module, or primary theme (2-5 words).
   - "color": Distinct hex color from the purple/indigo/blue palette (#8b5cf6, #6366f1, #3b82f6, #a855f7, #06b6d4).
   - "children": Array containing between 2 to 4 sub-branch nodes.

3. Sub-branches (strictly 2 to 4 sub-branches under each main branch):
   - "id": Unique identifier (e.g., "branch-1-sub-1", "branch-1-sub-2", etc.).
   - "label": Specific subtopic, definition, mechanism, formula, or example (2-6 words).
   - "color": Complementary hex color from the purple/indigo/blue palette (#a78bfa, #818cf8, #60a5fa, #c084fc, #38bdf8).
   - "children": Empty array [] or optional minor leaf nodes.

JSON Schema to follow strictly:
{
  "id": "root",
  "label": "Central Subject Name",
  "color": "#8b5cf6",
  "children": [
    {
      "id": "branch-1",
      "label": "Main Topic 1",
      "color": "#8b5cf6",
      "children": [
        {
          "id": "branch-1-sub-1",
          "label": "Subtopic 1.1",
          "color": "#a78bfa",
          "children": []
        },
        {
          "id": "branch-1-sub-2",
          "label": "Subtopic 1.2",
          "color": "#c084fc",
          "children": []
        }
      ]
    }
  ]
}

Return ONLY the raw JSON object. Do not include markdown code fences or conversational text.`;
}

function parseJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();

  // Strip markdown code fences if wrapped in ```json ... ``` or ``` ... ```
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  // Handle case where code fences are embedded inside explanatory text
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // Extract from the outermost '{' to '}'
  const startBrace = cleaned.indexOf('{');
  const endBrace = cleaned.lastIndexOf('}');
  if (startBrace !== -1 && endBrace !== -1 && endBrace > startBrace) {
    cleaned = cleaned.substring(startBrace, endBrace + 1);
  }

  return JSON.parse(cleaned);
}

function extractRootNode(data: any): any {
  if (!data || typeof data !== 'object') {
    return null;
  }
  if (data.mindmap && typeof data.mindmap === 'object') {
    return data.mindmap;
  }
  if (data.root && typeof data.root === 'object') {
    return data.root;
  }
  if (data.mindMap && typeof data.mindMap === 'object') {
    return data.mindMap;
  }
  return data;
}

function normalizeMindMapTree(rawRoot: any, fallbackTitle = 'Study Topic'): MindMapNode {
  const rootId =
    typeof rawRoot?.id === 'string' && rawRoot.id.trim()
      ? rawRoot.id.trim()
      : 'root';

  const rootLabel =
    typeof rawRoot?.label === 'string' && rawRoot.label.trim()
      ? rawRoot.label.trim()
      : fallbackTitle;

  const rootColor =
    typeof rawRoot?.color === 'string' && isHexColor(rawRoot.color)
      ? rawRoot.color
      : ROOT_COLOR;

  const rawBranches = Array.isArray(rawRoot?.children) ? rawRoot.children : [];

  // Normalize each branch
  let branches: MindMapNode[] = rawBranches
    .filter((b: any) => b && typeof b === 'object')
    .map((b: any, branchIdx: number) => {
      const theme =
        PURPLE_INDIGO_BLUE_PALETTE[
          branchIdx % PURPLE_INDIGO_BLUE_PALETTE.length
        ];

      const branchId =
        typeof b.id === 'string' && b.id.trim()
          ? b.id.trim()
          : `branch-${branchIdx + 1}`;

      const branchLabel =
        typeof b.label === 'string' && b.label.trim()
          ? b.label.trim()
          : `Core Concept ${branchIdx + 1}`;

      const branchColor =
        typeof b.color === 'string' && isHexColor(b.color)
          ? b.color
          : theme.primary;

      const rawSubs = Array.isArray(b.children) ? b.children : [];
      let subBranches: MindMapNode[] = rawSubs
        .filter((s: any) => s && typeof s === 'object')
        .map((s: any, subIdx: number) => {
          const subId =
            typeof s.id === 'string' && s.id.trim()
              ? s.id.trim()
              : `${branchId}-sub-${subIdx + 1}`;

          const subLabel =
            typeof s.label === 'string' && s.label.trim()
              ? s.label.trim()
              : `Key Aspect ${subIdx + 1}`;

          const subColor =
            typeof s.color === 'string' && isHexColor(s.color)
              ? s.color
              : theme.sub[subIdx % theme.sub.length];

          const leafChildren: MindMapNode[] = Array.isArray(s.children)
            ? s.children
                .filter((c: any) => c && typeof c === 'object')
                .map((c: any, leafIdx: number) => ({
                  id:
                    typeof c.id === 'string' && c.id.trim()
                      ? c.id.trim()
                      : `${subId}-leaf-${leafIdx + 1}`,
                  label:
                    typeof c.label === 'string' && c.label.trim()
                      ? c.label.trim()
                      : `Detail ${leafIdx + 1}`,
                  color:
                    typeof c.color === 'string' && isHexColor(c.color)
                      ? c.color
                      : subColor,
                  children: [],
                }))
            : [];

          return {
            id: subId,
            label: subLabel,
            color: subColor,
            children: leafChildren,
          };
        });

      // Guarantee each branch has between 2 and 4 sub-branches
      if (subBranches.length < 2) {
        const defaultSubLabels = [
          'Core Definitions',
          'Key Principles',
          'Practical Examples',
          'Essential Details',
        ];

        while (subBranches.length < 2) {
          const nextIdx = subBranches.length;
          subBranches.push({
            id: `${branchId}-sub-${nextIdx + 1}`,
            label: defaultSubLabels[nextIdx % defaultSubLabels.length],
            color: theme.sub[nextIdx % theme.sub.length],
            children: [],
          });
        }
      } else if (subBranches.length > 4) {
        subBranches = subBranches.slice(0, 4);
      }

      return {
        id: branchId,
        label: branchLabel,
        color: branchColor,
        children: subBranches,
      };
    });

  // Guarantee root has between 3 and 5 branches
  if (branches.length < 3) {
    const defaultBranchLabels = [
      'Foundations & Principles',
      'Architecture & Mechanisms',
      'Applications & Real-World Use',
      'Methodologies & Workflows',
      'Key Takeaways & Summary',
    ];

    while (branches.length < 3) {
      const idx = branches.length;
      const theme =
        PURPLE_INDIGO_BLUE_PALETTE[idx % PURPLE_INDIGO_BLUE_PALETTE.length];
      const branchId = `branch-${idx + 1}`;

      branches.push({
        id: branchId,
        label: defaultBranchLabels[idx % defaultBranchLabels.length],
        color: theme.primary,
        children: [
          {
            id: `${branchId}-sub-1`,
            label: 'Fundamental Concepts',
            color: theme.sub[0],
            children: [],
          },
          {
            id: `${branchId}-sub-2`,
            label: 'Key Observations',
            color: theme.sub[1],
            children: [],
          },
        ],
      });
    }
  } else if (branches.length > 5) {
    branches = branches.slice(0, 5);
  }

  return {
    id: rootId,
    label: rootLabel,
    color: rootColor,
    children: branches,
  };
}

function generateFallbackMindMap(content: string): MindMapNode {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('```'));

  let title = 'Study Guide & Core Topics';
  const heading = lines.find((l) => l.startsWith('#'));
  if (heading) {
    title = heading.replace(/^#+\s*/, '').trim().slice(0, 50);
  } else if (lines.length > 0) {
    const firstClean = lines[0].replace(/^[-*•0-9.)\s]+/, '').trim();
    if (firstClean.length > 0) {
      title = firstClean.length > 40 ? firstClean.slice(0, 37) + '...' : firstClean;
    }
  }

  // Extract candidate bullet points or sentences
  const points = lines
    .filter((l) => !l.startsWith('#'))
    .map((l) => l.replace(/^[-*•0-9.)\s]+/, '').trim())
    .filter((l) => l.length > 5);

  const defaultBranchTemplates = [
    {
      title: 'Foundations & Overview',
      subs: ['Core Definitions', 'Theoretical Background', 'Key Assumptions'],
    },
    {
      title: 'Mechanisms & Architecture',
      subs: ['Component Interactions', 'Data Flow & Workflows', 'Operational Rules'],
    },
    {
      title: 'Practical Applications',
      subs: ['Real-World Implementations', 'Problem Solving', 'Case Scenarios'],
    },
    {
      title: 'Evaluation & Best Practices',
      subs: ['Critical Analysis', 'Performance Metrics', 'Key Takeaways'],
    },
  ];

  const branchCount = Math.min(4, Math.max(3, Math.ceil(points.length / 4)));
  const branches: any[] = [];

  for (let i = 0; i < branchCount; i++) {
    const template = defaultBranchTemplates[i % defaultBranchTemplates.length];
    let branchLabel = template.title;

    if (points.length > i * 3) {
      const candidate = points[i * 3];
      if (candidate.length < 45) {
        branchLabel = candidate;
      }
    }

    const subBranches: any[] = [];
    const subCount = 3;

    for (let s = 0; s < subCount; s++) {
      const pointIdx = i * 3 + s + 1;
      let subLabel = template.subs[s % template.subs.length];

      if (pointIdx < points.length) {
        const candidateSub = points[pointIdx];
        subLabel =
          candidateSub.length > 35
            ? candidateSub.slice(0, 32) + '...'
            : candidateSub;
      }

      subBranches.push({
        id: `branch-${i + 1}-sub-${s + 1}`,
        label: subLabel,
        children: [],
      });
    }

    branches.push({
      id: `branch-${i + 1}`,
      label: branchLabel,
      children: subBranches,
    });
  }

  return normalizeMindMapTree(
    { id: 'root', label: title, children: branches },
    title
  );
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required to generate a mind map.' },
        { status: 400 }
      );
    }

    const trimmedContent = content.trim();
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 0) {
      try {
        const prompt = buildGeminiPrompt(trimmedContent);
        let responseText = '';

        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          });
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
        } catch (apiError) {
          // Retry using the pre-configured model from lib/gemini
          const fallbackResult = await geminiModel.generateContent(prompt);
          responseText = fallbackResult.response.text();
        }

        if (responseText) {
          const parsed = parseJsonFromText(responseText);
          const rawRoot = extractRootNode(parsed);

          if (rawRoot && typeof rawRoot === 'object') {
            const mindmap = normalizeMindMapTree(rawRoot, 'Study Topic');
            return NextResponse.json({ mindmap });
          }
        }
      } catch (geminiError) {
        console.warn(
          'Gemini API processing failed; falling back to content analysis:',
          geminiError
        );
      }
    } else {
      console.warn('GEMINI_API_KEY is not set. Generating content-derived mind map.');
    }

    // High quality content-derived fallback ensuring robust response
    const fallbackMindMap = generateFallbackMindMap(trimmedContent);
    return NextResponse.json({ mindmap: fallbackMindMap });
  } catch (error: any) {
    console.error('Error generating mind map:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate mind map' },
      { status: 500 }
    );
  }
}
