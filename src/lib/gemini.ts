import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FeynmanEvaluateResult, LLMGeneratedContent } from "./types";

/** Gemini API model id (Google AI / AI Studio). */
export const GEMINI_MODEL = "gemini-3-flash-preview" as const;

const STUDY_JSON_INSTRUCTIONS = `You are given a document that may be long (many pages). Read as much of it as you can and generate study materials that **cover the whole document broadly**: major themes, definitions, procedures, examples, and important details from early AND late sections. Do not only summarize the first pages.

Return **at least** 28–36 flashcards and **at least** 18–24 multiple-choice quiz questions (more is fine if the document is rich), distributed across the document so a learner reviews the full scope of the material.

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
- Flashcards should be concise and focused; avoid near-duplicate cards.
- Quiz questions should test understanding across the document, not only the introduction.
- Options array must have 4 options per quiz.
- correctOption is the index (0-3) of the correct option.
- Return ONLY the JSON, no other text`;

function parseStudyMaterialsJson(rawModelText: string): LLMGeneratedContent {
  const jsonMatch = rawModelText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from LLM response");
  }
  const generatedContent: LLMGeneratedContent = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(generatedContent.flashcards)) {
    throw new Error("Invalid flashcards format");
  }
  if (!Array.isArray(generatedContent.quizzes)) {
    throw new Error("Invalid quizzes format");
  }
  return generatedContent;
}

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

function getModel() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY in the server environment."
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
}

/** Plain-text path (e.g. extracted DOCX / PDF text). */
export async function generateFlashcardsAndQuizzes(
  documentText: string,
  documentName: string
): Promise<LLMGeneratedContent> {
  const model = getModel();

  const prompt = `You are an educational content expert. Analyze the following document and generate study materials.

Document: "${documentName}"
Content:
${documentText}

${STUDY_JSON_INSTRUCTIONS}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return parseStudyMaterialsJson(text);
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error;
  }
}

/**
 * Send the raw PDF to Gemini (avoids local pdf-parse, which often fails on Vercel serverless).
 */
export async function generateFlashcardsAndQuizzesFromPdfBuffer(
  pdfBuffer: ArrayBuffer,
  documentName: string
): Promise<LLMGeneratedContent> {
  const model = getModel();
  const base64 = Buffer.from(new Uint8Array(pdfBuffer)).toString("base64");

  const prompt = `You are an educational content expert. The attached PDF is named "${documentName}".
Read the entire PDF and generate study materials from its content.

${STUDY_JSON_INSTRUCTIONS}`;

  try {
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: base64,
        },
      },
    ]);
    const text = result.response.text();
    return parseStudyMaterialsJson(text);
  } catch (error) {
    console.error("Error generating content with Gemini (PDF):", error);
    throw error;
  }
}

const FEYNMAN_EVAL_INSTRUCTIONS = `You are an expert tutor using the Feynman Technique.

The learner will give you a TOPIC (or title) and their EXPLANATION in plain language.

Your job:
1. Internally recall the standard definition, core mechanisms, and common misconceptions for that topic.
2. Judge whether their explanation is factually aligned with accepted understanding (not perfect wording, but correct ideas).
3. Respond with ONLY valid JSON (no markdown fences, no commentary) in this exact shape:
{
  "reply": "2-4 sentences speaking directly to the learner: acknowledge effort, say whether they're on the right track, and one concrete next step.",
  "spotOn": true or false,
  "accuracyScore": integer from 0 to 100,
  "strengths": ["short bullet", "..."],
  "missing": ["important gap or misconception to fix", "..."],
  "improvements": ["actionable suggestion", "..."]
}

Rules:
- "spotOn" is true only if the explanation is substantially correct with no major factual errors and covers the main idea.
- "missing" can be empty if nothing important is missing.
- Each array should have 1-5 strings.
- Be strict about factual accuracy; prefer honest low scores over false praise.`;

function parseFeynmanEvalJson(raw: string): FeynmanEvaluateResult {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from Feynman evaluation");
  }
  const o = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  const reply = typeof o.reply === "string" ? o.reply : "";
  const spotOn = Boolean(o.spotOn);
  let accuracyScore = Number(o.accuracyScore);
  if (!Number.isFinite(accuracyScore)) accuracyScore = 0;
  accuracyScore = Math.min(100, Math.max(0, Math.round(accuracyScore)));
  const toStrArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  return {
    reply,
    spotOn,
    accuracyScore,
    strengths: toStrArray(o.strengths),
    missing: toStrArray(o.missing),
    improvements: toStrArray(o.improvements),
  };
}

export async function feynmanEvaluate(
  topic: string,
  explanation: string
): Promise<FeynmanEvaluateResult> {
  const model = getModel();
  const prompt = `${FEYNMAN_EVAL_INSTRUCTIONS}

TOPIC: ${topic.trim() || "(not specified — infer from the explanation)"}

LEARNER EXPLANATION:
${explanation.trim()}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseFeynmanEvalJson(text);
}

export async function feynmanChatReply(
  topic: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<string> {
  const model = getModel();
  const lines = messages.map((m) => `${m.role === "user" ? "Learner" : "Tutor"}: ${m.content}`);
  const prompt = `You are a patient tutor helping someone learn using the Feynman Technique.
Topic focus: "${topic.trim() || "their study topic"}".

Conversation:
${lines.join("\n\n")}

Write the next Tutor reply. Be concise (under ~180 words), accurate, and encouraging. If they paste a new explanation to assess, briefly evaluate accuracy and suggest improvements. Plain text only, no JSON.`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

export async function testGeminiConnection(): Promise<boolean> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return false;
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent("Hello");
    return !!result.response;
  } catch (error) {
    console.error("Gemini connection test failed:", error);
    return false;
  }
}
