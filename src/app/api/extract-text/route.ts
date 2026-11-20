import { NextRequest, NextResponse } from 'next/server';
// @ts-expect-error - import direct lib to bypass pdf-parse index.js debug block
import pdf from 'pdf-parse/lib/pdf-parse.js';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Heuristic text extractor for uncompressed or raw PDF streams.
 * Acts as a resilient fallback when XRef tables are non-standard.
 */
function extractRawPdfStrings(buffer: Buffer): string {
  try {
    const str = buffer.toString('binary');
    const textChunks: string[] = [];

    // Match (text) Tj
    const tjRegex = /\(([^)\\]{2,})\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(str)) !== null) {
      if (match[1]) textChunks.push(match[1]);
    }

    // Match [(text)] TJ
    const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
    while ((match = tjArrayRegex.exec(str)) !== null) {
      const inner = match[1];
      const innerMatches = inner.match(/\(([^)]+)\)/g);
      if (innerMatches) {
        textChunks.push(innerMatches.map((m) => m.slice(1, -1)).join(' '));
      }
    }

    return textChunks
      .join(' ')
      .replace(/\\([()\\])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request: Failed to parse form data.' },
        { status: 400 }
      );
    }

    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file provided.' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 50MB).' }, { status: 413 });
    }

    const fileName = (file.name || '').toLowerCase();
    const fileType = (file.type || '').toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPdf =
      fileType === 'application/pdf' ||
      fileName.endsWith('.pdf') ||
      (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-');

    if (isPdf) {
      // Primary attempt: standard PDF parsing
      try {
        const parsed = await pdf(buffer);
        let text = (parsed.text || '').trim();
        const pageCount = Math.max(1, Number(parsed.numpages) || 1);

        if (!text) {
          // Attempt raw stream fallback
          text = extractRawPdfStrings(buffer);
        }

        if (text) {
          return NextResponse.json({ text, pageCount });
        }

        return NextResponse.json({
          text: `[PDF "${file.name}": Uploaded (${pageCount} page${pageCount > 1 ? 's' : ''}). No selectable text found — you can use the AI Tutor or paste notes directly.]`,
          pageCount,
        });
      } catch (pdfErr) {
        console.warn('Standard PDF parser encountered non-fatal issue, attempting stream extraction:', (pdfErr as Error).message);
        
        // Resilient stream fallback
        const fallbackText = extractRawPdfStrings(buffer);
        if (fallbackText && fallbackText.length > 20) {
          return NextResponse.json({
            text: fallbackText,
            pageCount: 1,
          });
        }

        return NextResponse.json(
          { error: `Could not parse PDF "${file.name}". Please ensure it contains selectable text, or paste your notes directly into the text box below.` },
          { status: 422 }
        );
      }
    }

    // Text & Markdown files (.txt, .md, .json, .csv)
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const text = decoder.decode(buffer);
      return NextResponse.json({ text: text.trim(), pageCount: 1 });
    } catch {
      return NextResponse.json(
        { error: 'Unsupported file format.' },
        { status: 415 }
      );
    }
  } catch (error) {
    console.error('Extract text error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error.' },
      { status: 500 }
    );
  }
}
