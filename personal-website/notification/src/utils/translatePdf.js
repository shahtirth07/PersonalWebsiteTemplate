import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import OpenAI from 'openai';
import { PDFParse } from 'pdf-parse';

const MAX_CHARS_PER_CHUNK = 3500;
const DEFAULT_MODEL = globalThis.process.env.OPENAI_TRANSLATION_MODEL || 'gpt-4o-mini';

function printUsage() {
  console.log(
    'Usage: node src/utils/translatePdf.js <input.pdf> [output.txt]\n' +
      'Example: node src/utils/translatePdf.js ./cv-german.pdf ./cv-english.txt'
  );
}

function splitIntoChunks(text, maxChars) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const paragraphs = normalized.split(/\n{2,}/);
  const chunks = [];
  let current = '';

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = '';
    }

    if (paragraph.length <= maxChars) {
      current = paragraph;
      continue;
    }

    let start = 0;
    while (start < paragraph.length) {
      chunks.push(paragraph.slice(start, start + maxChars));
      start += maxChars;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(client, chunk, index, total) {
  console.log(`Translating chunk ${index + 1}/${total}...`);

  const response = await client.responses.create({
    model: DEFAULT_MODEL,
    input: [
      {
        role: 'system',
        content:
          'You are a professional translator. Translate German text to natural English. Keep structure, headings, and lists. Do not add explanations.'
      },
      {
        role: 'user',
        content: chunk
      }
    ]
  });

  const outputText = response.output_text?.trim();
  if (!outputText) {
    throw new Error(`Empty translation returned for chunk ${index + 1}`);
  }
  return outputText;
}

async function extractPdfText(filePath) {
  const absolutePath = path.resolve(filePath);
  const buffer = await fs.readFile(absolutePath);
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text ?? '';
  } finally {
    await parser.destroy();
  }
}

async function main() {
  const inputPath = globalThis.process.argv[2];
  const outputArg = globalThis.process.argv[3];

  if (!inputPath) {
    printUsage();
    globalThis.process.exit(1);
  }

  if (!globalThis.process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY in environment.');
  }

  const inputAbsolutePath = path.resolve(inputPath);
  const outputPath =
    outputArg ??
    inputAbsolutePath.replace(/\.pdf$/i, '') + '.en.txt';
  const outputAbsolutePath = path.resolve(outputPath);

  console.log(`Reading PDF: ${inputAbsolutePath}`);
  const extractedText = await extractPdfText(inputAbsolutePath);

  if (!extractedText.trim()) {
    throw new Error('No text was extracted from the PDF.');
  }

  const chunks = splitIntoChunks(extractedText, MAX_CHARS_PER_CHUNK);
  if (chunks.length === 0) {
    throw new Error('Extracted text is empty after preprocessing.');
  }

  const client = new OpenAI({ apiKey: globalThis.process.env.OPENAI_API_KEY });
  const translatedChunks = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const translated = await translateChunk(client, chunks[i], i, chunks.length);
    translatedChunks.push(translated);
  }

  const finalText = translatedChunks.join('\n\n');
  await fs.writeFile(outputAbsolutePath, finalText, 'utf8');

  console.log(`Done. English translation saved to: ${outputAbsolutePath}`);
}

main().catch((error) => {
  console.error(`Translation failed: ${error.message}`);
  globalThis.process.exit(1);
});
