import { NextRequest, NextResponse } from "next/server";
import {
  generateFlashcardsAndQuizzes,
  generateFlashcardsAndQuizzesFromPdfBuffer,
  getGeminiApiKey,
} from "@/lib/gemini";
import {
  extractTextFromDocument,
  generateId,
  getCurrentTimestamp,
  inferMimeFromFilename,
} from "@/lib/utils-server";
import type { LLMGeneratedContent } from "@/lib/types";

export const runtime = "nodejs";

const PDF = "application/pdf";
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Multipart parts are usually `File`; normalize anything Blob-like. */
function getUploadedFiles(formData: FormData): File[] {
  const out: File[] = [];
  for (const entry of formData.getAll("files")) {
    if (entry == null || typeof entry === "string") continue;
    const blob = entry as Blob;
    if (typeof blob.arrayBuffer !== "function") continue;
    if (entry instanceof File) {
      out.push(entry);
      continue;
    }
    const name =
      "name" in blob && typeof (blob as File).name === "string"
        ? (blob as File).name
        : "document.pdf";
    const type = blob.type || inferMimeFromFilename(name) || "application/octet-stream";
    out.push(new File([blob], name, { type }));
  }
  return out;
}

function effectiveMime(file: File): string {
  return (file.type || inferMimeFromFilename(file.name)).trim();
}

/**
 * DOCX: text extract → Gemini on text.
 * PDF: if extracted text is substantial, use text; otherwise send PDF bytes to Gemini (reliable on Vercel).
 */
async function generateMaterialsForFile(file: File): Promise<LLMGeneratedContent> {
  const mime = effectiveMime(file);
  if (mime !== PDF && mime !== DOCX) {
    throw new Error(
      `Unsupported type for "${file.name}" (${file.type || "empty type"}). Rename to .pdf or .docx or set a correct MIME type.`
    );
  }

  const buf = await file.arrayBuffer();

  if (mime === DOCX) {
    const typed = new File([buf], file.name, { type: DOCX });
    const text = await extractTextFromDocument(typed);
    if (text.trim().length < 20) {
      throw new Error(`Very little text could be read from ${file.name}.`);
    }
    return generateFlashcardsAndQuizzes(text, file.name);
  }

  // PDF
  let extracted = "";
  try {
    const typed = new File([buf], file.name, { type: PDF });
    extracted = await extractTextFromDocument(typed);
  } catch {
    extracted = "";
  }

  if (extracted.trim().length >= 120) {
    return generateFlashcardsAndQuizzes(extracted, file.name);
  }

  return generateFlashcardsAndQuizzesFromPdfBuffer(buf, file.name);
}

/**
 * Vercel-friendly: multipart upload processed in memory (no SQLite, no disk writes).
 * Client persists the returned deck to localStorage.
 */
export async function POST(request: NextRequest) {
  try {
    if (!getGeminiApiKey()) {
      return NextResponse.json(
        {
          error:
            "Gemini API key not configured. In Vercel, add GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY for Production (and redeploy).",
        },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with deckName and files" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const deckName = (formData.get("deckName") as string)?.trim();
    const userId = (formData.get("userId") as string) || "demo";
    const fileEntries = getUploadedFiles(formData);

    if (!deckName) {
      return NextResponse.json({ error: "deckName is required" }, { status: 400 });
    }

    if (fileEntries.length === 0) {
      return NextResponse.json(
        { error: "At least one file is required (multipart field name: files)" },
        { status: 400 }
      );
    }

    if (fileEntries.length > 3) {
      return NextResponse.json({ error: "Maximum 3 files allowed" }, { status: 400 });
    }

    const deckId = generateId();
    const now = getCurrentTimestamp();

    const merged: LLMGeneratedContent = { flashcards: [], quizzes: [] };
    const fileErrors: string[] = [];

    for (const file of fileEntries) {
      try {
        const generated = await generateMaterialsForFile(file);
        merged.flashcards.push(...generated.flashcards);
        merged.quizzes.push(...generated.quizzes);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        fileErrors.push(`${file.name}: ${msg}`);
        console.error(`process-documents failed for ${file.name}:`, err);
      }
    }

    const flashcards = merged.flashcards.map((card) => ({
      id: generateId(),
      deckId,
      question: card.question,
      answer: card.answer,
      createdAt: now,
    }));

    const quizzes = merged.quizzes.map((quiz) => ({
      id: generateId(),
      deckId,
      question: quiz.question,
      options: quiz.options,
      correctOption: quiz.correctOption,
      explanation: quiz.explanation || "",
      createdAt: now,
    }));

    if (flashcards.length === 0 && quizzes.length === 0) {
      return NextResponse.json(
        {
          error:
            "No study materials were generated. Gemini was not able to produce flashcards/quizzes from your files.",
          details: fileErrors.length > 0 ? fileErrors : ["Unknown failure for all files."],
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        deck: {
          id: deckId,
          name: deckName,
          description: `Created from ${fileEntries.length} document(s)`,
          userId,
          createdAt: now,
          updatedAt: now,
          flashcards,
          quizzes,
        },
        flashcardCount: flashcards.length,
        quizCount: quizzes.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Document processing error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
