import type { StoredDeck, StoredFlashcard, StoredQuiz } from "@/lib/study-deck-types";

function sanitizeQuiz(q: StoredQuiz): StoredQuiz | null {
  if (!q || typeof q.question !== "string" || !q.question.trim()) return null;
  let options = Array.isArray(q.options) ? q.options.map((o) => String(o)) : [];
  if (options.length < 2) return null;
  while (options.length < 4) {
    options = [...options, `Option ${String.fromCharCode(65 + options.length)}`];
  }
  if (options.length > 4) options = options.slice(0, 4);
  let correct = Number(q.correctOption);
  if (!Number.isFinite(correct)) correct = 0;
  correct = Math.min(3, Math.max(0, Math.floor(correct)));
  if (correct >= options.length) correct = 0;
  return {
    ...q,
    question: q.question.trim(),
    options,
    correctOption: correct,
    explanation: typeof q.explanation === "string" ? q.explanation : "",
  };
}

function sanitizeFlashcard(f: StoredFlashcard): StoredFlashcard | null {
  if (!f || typeof f.question !== "string" || typeof f.answer !== "string") return null;
  const q = f.question.trim();
  const a = f.answer.trim();
  if (!q || !a) return null;
  return { ...f, question: q, answer: a };
}

/** Drop invalid items so Study mode never crashes on malformed Gemini output. */
export function sanitizeStoredDeck(deck: StoredDeck): StoredDeck {
  const flashcards = deck.flashcards.map(sanitizeFlashcard).filter(Boolean) as StoredFlashcard[];
  const quizzes = deck.quizzes.map(sanitizeQuiz).filter(Boolean) as StoredQuiz[];
  return {
    ...deck,
    flashcards,
    quizzes,
  };
}
