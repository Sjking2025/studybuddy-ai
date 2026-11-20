import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini } from '@/lib/gemini';
import { QuizQuestion } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const content = body?.content;

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Document content is required to generate quiz questions.' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert academic tutor and exam designer. 
Generate 5 high-yield multiple-choice quiz questions based strictly on the following study notes/content.

Content:
"""
${content.slice(0, 15000)}
"""

Each question must:
1. Have exactly 4 plausible options (index 0, 1, 2, 3).
2. Clearly specify the index of the single correct answer (0, 1, 2, or 3).
3. Include an insightful, educational explanation detailing why the answer is correct and why other choices are misconceptions.
4. Include a concise topic/subject label (e.g., "Algorithms", "Cell Biology", "Constitutional Law", etc.).
5. Provide a unique string id.

Return ONLY a valid raw JSON object with the key "questions", with no markdown code blocks and no surrounding commentary, adhering to this TypeScript structure:
{
  "questions": [
    {
      "id": "q-1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed rationale here.",
      "topic": "Topic Name"
    }
  ]
}`;

    const rawResponse = await generateWithGemini(prompt);

    // Clean potential markdown backticks from LLM output
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleaned);

    const questions: QuizQuestion[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.questions)
      ? parsed.questions
      : [];

    if (questions.length === 0) {
      throw new Error('No valid questions generated from model response.');
    }

    // Ensure valid question formatting
    const formattedQuestions: QuizQuestion[] = questions.map((q, idx) => ({
      id: q.id || `q-${idx + 1}-${Date.now()}`,
      question: q.question,
      options: Array.isArray(q.options) && q.options.length >= 4 ? q.options.slice(0, 4) : q.options,
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      explanation: q.explanation || 'No explanation provided.',
      topic: q.topic || 'General Review',
    }));

    return NextResponse.json({ questions: formattedQuestions });
  } catch (error: unknown) {
    console.error('Quiz generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate quiz.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
