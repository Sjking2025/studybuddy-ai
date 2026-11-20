import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function generateWithGemini(prompt: string): Promise<string> {
  const result = await geminiModel.generateContent(prompt);
  return result.response.text();
}

export async function streamWithGemini(prompt: string) {
  const result = await geminiModel.generateContentStream(prompt);
  return result.stream;
}
