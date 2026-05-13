import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMGeneratedContent } from "./types";

/** Read at request time (not at import time) so Vercel/serverless env is visible. */
export function getGeminiApiKey(): string | undefined {
  const candidates = [
    process.env.GOOGLE_GEMINI_API_KEY,
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_AI_API_KEY,
  ];
  for (const c of candidates) {
    if (typeof c === "string") {
      const t = c.trim();
      if (t.length > 0) return t;
    }
  }
  return undefined;
}

export async function generateFlashcardsAndQuizzes(
  documentText: string,
  documentName: string
): Promise<LLMGeneratedContent> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY in the server environment."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an educational content expert. Analyze the following document and generate study materials.

Document: "${documentName}"
Content:
${documentText}

Generate 10 high-quality flashcards and 5 multiple-choice quiz questions based on the content above.

Return the response as a valid JSON object with this exact structure (NO markdown, NO code blocks, just raw JSON):
{
  "flashcards": [
    {
      "question": "What is...",
      "answer": "The answer is..."
    }
  ],
  "quizzes": [
    {
      "question": "Which of the following...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOption": 0,
      "explanation": "This is correct because..."
    }
  ]
}

IMPORTANT: 
- Flashcards should be concise and focused
- Quiz questions should test understanding, not just recall
- Options array should have 4 options
- correctOption is the index (0-3) of the correct option
- Return ONLY the JSON, no other text`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from LLM response");
    }

    const generatedContent: LLMGeneratedContent = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!Array.isArray(generatedContent.flashcards)) {
      throw new Error("Invalid flashcards format");
    }
    if (!Array.isArray(generatedContent.quizzes)) {
      throw new Error("Invalid quizzes format");
    }

    return generatedContent;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}

export async function testGeminiConnection(): Promise<boolean> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return false;
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello");
    return !!result.response;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
}
