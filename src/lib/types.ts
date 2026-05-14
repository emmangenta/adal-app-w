export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface Quiz {
  id: string;
  deckId: string;
  question: string;
  options: string[]; // Stored as JSON string in DB
  correctOption: number;
  explanation?: string;
  createdAt: string;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  userId: string;
  flashcards?: Flashcard[];
  quizzes?: Quiz[];
  createdAt: string;
  updatedAt: string;
}

export interface LLMGeneratedContent {
  flashcards: Array<{
    question: string;
    answer: string;
  }>;
  quizzes: Array<{
    question: string;
    options: string[];
    correctOption: number;
    explanation: string;
  }>;
}

/** Structured output from Gemini for Feynman evaluation. */
export interface FeynmanEvaluateResult {
  reply: string;
  spotOn: boolean;
  accuracyScore: number;
  strengths: string[];
  missing: string[];
  improvements: string[];
}
