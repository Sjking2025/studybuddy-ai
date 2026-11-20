import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Free Tier Model Pool Configuration
 * Optimized order based on speed ("very_fast"), reliability, and free quotas:
 * 1. gemini-3.1-flash-lite (Speed: very_fast, Free: true)
 * 2. gemini-3.5-flash-lite (Speed: very_fast, Free: true)
 * 3. gemini-3.6-flash (Speed: fast, Quality: high, Free: true)
 * 4. gemini-3.8-flash (Speed: fast, Quality: very_high, Free: true)
 * 5. gemma-4-31b-it (Speed: fast, Reasoning: true, Free: true)
 * 6. gemma-4-26b-a4b-it (Speed: very_fast, Free: true)
 */
export const FREE_TIER_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
] as const;

export const DEFAULT_MODEL = 'gemini-3.1-flash-lite';

const API_TIMEOUT_MS = 6000;

function getGenAI(): GoogleGenerativeAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Executes prompt across the free tier models with automatic failover.
 */
export async function generateWithFreeTierPool(
  prompt: string,
  options?: {
    systemInstruction?: string;
    jsonMode?: boolean;
    temperature?: number;
  }
): Promise<{ text: string; modelUsed: string }> {
  const genAI = getGenAI();
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  let lastError: Error | null = null;

  for (const modelName of FREE_TIER_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: options?.systemInstruction,
        generationConfig: {
          responseMimeType: options?.jsonMode ? 'application/json' : undefined,
          temperature: options?.temperature ?? 0.2,
        },
      });

      const generatePromise = model.generateContent(prompt);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout with ${modelName}`)), API_TIMEOUT_MS)
      );

      const result = await Promise.race([generatePromise, timeoutPromise]);
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return { text: text.trim(), modelUsed: modelName };
      }
    } catch (err: unknown) {
      console.warn(`Model ${modelName} failed/busy, trying next free-tier model:`, (err as Error).message);
      lastError = err as Error;
    }
  }

  throw lastError || new Error('All free tier models are currently busy');
}

/**
 * High-yield heuristic extraction engine for guaranteed 100% offline/resilient functionality.
 * Extracts concepts, definitions, and active-recall pairs directly from raw study text.
 */
export function extractHeuristicFlashcards(content: string, count = 8) {
  const sentences = content
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25);

  const flashcards = [];

  for (let i = 0; i < Math.min(sentences.length, count); i++) {
    const s = sentences[i];
    const match = s.match(/^([^,.]+?)\s+(?:is|are|refers to|includes|means)\s+(.+)$/i);
    if (match) {
      flashcards.push({
        id: `fc-h-${Date.now()}-${i}`,
        front: `What is the significance or definition of "${match[1]}"?`,
        back: match[2].endsWith('.') ? match[2] : `${match[2]}.`,
        difficulty: (i % 3 === 0 ? 'hard' : i % 2 === 0 ? 'medium' : 'easy') as 'easy' | 'medium' | 'hard',
        mastered: false,
      });
    } else {
      const words = s.split(' ');
      const keyPhrase = words.slice(0, Math.min(4, words.length)).join(' ');
      flashcards.push({
        id: `fc-h-${Date.now()}-${i}`,
        front: `Explain the concept: "${keyPhrase}..."`,
        back: s,
        difficulty: (i % 2 === 0 ? 'medium' : 'easy') as 'easy' | 'medium' | 'hard',
        mastered: false,
      });
    }
  }

  if (flashcards.length === 0) {
    flashcards.push({
      id: `fc-h-default-1`,
      front: 'Core Study Concept',
      back: content.slice(0, 150) + '...',
      difficulty: 'easy' as const,
      mastered: false,
    });
  }

  return flashcards;
}

/**
 * High-yield heuristic quiz generator for guaranteed resilience.
 */
export function extractHeuristicQuiz(content: string, count = 5) {
  const sentences = content
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const questions = [];

  for (let i = 0; i < Math.min(sentences.length, count); i++) {
    const sentence = sentences[i];
    const words = sentence.split(' ');
    const keyword = words.find((w) => w.length > 6 && !/^(because|however|although|between)/i.test(w)) || words[0];

    const distractors = [
      `It is not directly involved in this process`,
      `It acts as an external inhibitor`,
      `It reverses the primary reaction`,
    ];

    const options = [sentence, ...distractors].sort(() => 0.5 - Math.random());
    const correctIndex = options.indexOf(sentence);

    questions.push({
      id: `q-h-${Date.now()}-${i}`,
      question: `Regarding "${keyword}", which of the following statements is directly supported by your notes?`,
      options: options.map((opt) => opt.length > 90 ? opt.slice(0, 90) + '...' : opt),
      correctAnswer: correctIndex,
      explanation: `Direct quote from study material: "${sentence}"`,
      topic: keyword || 'Core Principle',
    });
  }

  return questions;
}

/**
 * High-yield heuristic mind map generator.
 */
export function extractHeuristicMindMap(content: string) {
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l.length > 3);
  const title = lines[0] ? lines[0].slice(0, 30) : 'Study Overview';

  const sections = lines.slice(1, 15).filter((l) => l.length > 10);
  const branches = sections.slice(0, 4).map((sec, idx) => {
    const words = sec.split(' ');
    const branchName = words.slice(0, 4).join(' ');
    return {
      id: `node-${idx}`,
      label: branchName,
      children: [
        {
          id: `node-${idx}-sub`,
          label: sec.slice(0, 40) + '...',
          children: [],
        },
      ],
    };
  });

  return {
    id: 'root',
    label: title,
    children: branches.length > 0 ? branches : [
      { id: 'b1', label: 'Primary Principles', children: [] },
      { id: 'b2', label: 'Key Applications', children: [] }
    ],
  };
}
