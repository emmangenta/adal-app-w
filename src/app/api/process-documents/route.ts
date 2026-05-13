import { NextRequest, NextResponse } from "next/server";
import { generateFlashcardsAndQuizzes, getGeminiApiKey } from "@/lib/gemini";
import { extractTextFromDocument, generateId, getCurrentTimestamp } from "@/lib/utils-server";
import type { LLMGeneratedContent } from "@/lib/types";

export const runtime = "nodejs";

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
    const fileEntries = formData.getAll("files").filter((e): e is File => e instanceof File);

    if (!deckName) {
      return NextResponse.json({ error: "deckName is required" }, { status: 400 });
    }

    if (fileEntries.length === 0) {
      return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
    }

    if (fileEntries.length > 3) {
      return NextResponse.json({ error: "Maximum 3 files allowed" }, { status: 400 });
    }

    const deckId = generateId();
    const now = getCurrentTimestamp();

    let allFlashcards: LLMGeneratedContent = {
      flashcards: [],
      quizzes: [],
    };

    for (const file of fileEntries) {
      if (
        file.type !== "application/pdf" &&
        file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only PDF and DOCX allowed.` },
          { status: 400 }
        );
      }

      try {
        const documentText = await extractTextFromDocument(file);
        const generatedContent = await generateFlashcardsAndQuizzes(documentText, file.name);
        allFlashcards.flashcards.push(...generatedContent.flashcards);
        allFlashcards.quizzes.push(...generatedContent.quizzes);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
      }
    }

    const flashcards = allFlashcards.flashcards.map((card) => ({
      id: generateId(),
      deckId,
      question: card.question,
      answer: card.answer,
      createdAt: now,
    }));

    const quizzes = allFlashcards.quizzes.map((quiz) => ({
      id: generateId(),
      deckId,
      question: quiz.question,
      options: quiz.options,
      correctOption: quiz.correctOption,
      explanation: quiz.explanation || "",
      createdAt: now,
    }));

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
