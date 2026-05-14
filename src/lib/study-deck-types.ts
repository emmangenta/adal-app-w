/** Shared deck shapes (keeps storage/sanitize free of AppContext import cycles). */

export interface StoredFlashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  createdAt: string;
}

export interface StoredQuiz {
  id: string;
  deckId: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
  createdAt: string;
}

export interface StoredDeck {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  flashcards: StoredFlashcard[];
  quizzes: StoredQuiz[];
}
