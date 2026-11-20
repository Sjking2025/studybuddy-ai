import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { StudyPlanItem } from '@/lib/types';

interface StudyPlanRequestBody {
  content?: string;
  hoursPerDay?: number;
}

const priorityOrder: Record<'high' | 'medium' | 'low', number> = {
  high: 1,
  medium: 2,
  low: 3,
};

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

function generateFallbackPlan(content: string, hoursPerDay: number): StudyPlanItem[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const candidateTopics = lines
    .filter((l) => l.startsWith('#') || (l.length < 90 && !l.endsWith('.')))
    .map((l) => l.replace(/^[#*\-•\d.]+\s*/, '').trim())
    .filter((l) => l.length >= 3 && !l.toLowerCase().includes('table of contents'));

  const baseTopics = candidateTopics.length >= 3
    ? candidateTopics.slice(0, 6)
    : [
        'Core Foundations & Key Terminology',
        'In-Depth Concept Analysis & Principles',
        'Practical Applications & Examples',
        'Problem Solving & Critical Thinking',
        'Review, Synthesis & Self-Assessment',
      ];

  const durations = [
    `${Math.max(30, Math.round(hoursPerDay * 0.35 * 60))} mins`,
    `${Math.max(30, Math.round(hoursPerDay * 0.4 * 60))} mins`,
    `${Math.max(30, Math.round(hoursPerDay * 0.35 * 60))} mins`,
    `${Math.max(45, Math.round(hoursPerDay * 0.5 * 60))} mins`,
    `${Math.max(25, Math.round(hoursPerDay * 0.25 * 60))} mins`,
    `${Math.max(20, Math.round(hoursPerDay * 0.2 * 60))} mins`,
  ];

  const priorities: ('high' | 'medium' | 'low')[] = [
    'high',
    'high',
    'medium',
    'medium',
    'low',
    'low',
  ];

  return baseTopics.map((topic, idx) => ({
    id: `plan-${idx + 1}`,
    topic,
    duration: durations[idx % durations.length],
    priority: priorities[idx % priorities.length],
    completed: false,
    description: `Focus on mastering the principles of "${topic}". Review definitions, work through illustrative examples, and verify comprehension.`,
  }));
}

export async function POST(req: NextRequest | Request) {
  try {
    let body: StudyPlanRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body. Please provide content in JSON format.' },
        { status: 400 }
      );
    }

    const { content, hoursPerDay } = body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required to generate a study plan.' },
        { status: 400 }
      );
    }

    // Default to 2 hours per day if not provided or invalid
    const parsedHours = typeof hoursPerDay === 'number' ? hoursPerDay : Number(hoursPerDay);
    const dailyHours = !isNaN(parsedHours) && parsedHours > 0 ? parsedHours : 2;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not configured. Falling back to generated study plan.');
      const fallbackPlan = generateFallbackPlan(content, dailyHours);
      return NextResponse.json({ plan: fallbackPlan }, { status: 200 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const truncatedContent = content.length > 35000 ? content.slice(0, 35000) + '...' : content;

    const prompt = `You are an expert AI study coach and academic planner for StudyBuddy AI.
Create a structured, highly actionable study plan based on the provided material.

The student can dedicate approximately ${dailyHours} hour(s) per day to study this material.

Study Material:
"""
${truncatedContent}
"""

Requirements:
1. Break down the content into a cohesive series of study sessions/topics.
2. Order the study plan items strictly by importance and learning progression (foundational and highest priority topics first, followed by medium, then low priority refinement/review).
3. The "duration" for each topic must be practical and fit the student's study pace of ${dailyHours} hours/day (e.g., "30 mins", "45 mins", "1 hour", "1.5 hours").
4. "priority" must be strictly one of: "high", "medium", or "low".
5. "completed" must strictly be false.
6. "description" must outline concrete study activities, core concepts, formulas, or review objectives.
7. Return a valid JSON array of objects with the exact schema:
[
  {
    "id": "item-1",
    "topic": "Topic Title",
    "duration": "1 hour",
    "priority": "high",
    "completed": false,
    "description": "Clear and detailed study tasks for this topic."
  }
]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsedData: unknown;
    try {
      parsedData = JSON.parse(cleanJsonString(responseText));
    } catch {
      const match = responseText.match(/\[[\s\S]*\]/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse JSON response from Gemini model.');
      }
    }

    // Extract items from array or wrapper object
    let rawItems: unknown[] = [];
    if (Array.isArray(parsedData)) {
      rawItems = parsedData;
    } else if (parsedData && typeof parsedData === 'object') {
      const obj = parsedData as Record<string, unknown>;
      if (Array.isArray(obj.plan)) {
        rawItems = obj.plan;
      } else if (Array.isArray(obj.items)) {
        rawItems = obj.items;
      } else if (Array.isArray(obj.studyPlan)) {
        rawItems = obj.studyPlan;
      } else if (Array.isArray(obj.study_plan)) {
        rawItems = obj.study_plan;
      }
    }

    if (!rawItems || rawItems.length === 0) {
      const fallbackPlan = generateFallbackPlan(content, dailyHours);
      return NextResponse.json({ plan: fallbackPlan }, { status: 200 });
    }

    const plan: StudyPlanItem[] = rawItems.map((item, index) => {
      const record = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
      const rawPriority = String(record.priority || '').toLowerCase();
      const priority: 'high' | 'medium' | 'low' =
        rawPriority === 'high' || rawPriority === 'medium' || rawPriority === 'low'
          ? rawPriority
          : 'medium';

      return {
        id:
          typeof record.id === 'string' && record.id.trim()
            ? record.id.trim()
            : `item-${index + 1}`,
        topic:
          typeof record.topic === 'string' && record.topic.trim()
            ? record.topic.trim()
            : `Study Topic ${index + 1}`,
        duration:
          typeof record.duration === 'string' && record.duration.trim()
            ? record.duration.trim()
            : '1 hour',
        priority,
        completed: false,
        description:
          typeof record.description === 'string' && record.description.trim()
            ? record.description.trim()
            : 'Review essential concepts, notes, and complete practice exercises.',
      };
    });

    // Ensure strictly ordered by importance (high -> medium -> low)
    plan.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return NextResponse.json({ plan }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/study-plan route:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate study plan.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
