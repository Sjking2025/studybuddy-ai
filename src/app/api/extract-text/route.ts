import { NextRequest, NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

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
      try {
        const parser = new PDFParse(buffer);
        const textResult = await parser.getText();
        const text = typeof textResult === 'string' ? textResult : ((textResult as unknown as Record<string, string>)?.text || '');
        let pageCount = 1;
        try {
          if ('getMetadata' in parser && typeof (parser as unknown as Record<string, Function>).getMetadata === 'function') {
            const meta = await (parser as unknown as Record<string, Function>).getMetadata();
            if (meta?.pages) pageCount = Number(meta.pages);
          }
        } catch {
          // metadata extraction not supported
        }

        return NextResponse.json({
          text: text.trim(),
          pageCount: Math.max(1, pageCount),
        });
      } catch (pdfErr) {
        console.error('PDF parse error:', pdfErr);
        return NextResponse.json(
          { error: pdfErr instanceof Error ? pdfErr.message : 'Failed to parse PDF.' },
          { status: 422 }
        );
      }
    }

    // Text files
    try {
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const text = decoder.decode(arrayBuffer);
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
