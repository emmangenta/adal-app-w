"use client";

import { useState, useEffect, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, RotateCw, Loader2, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import type { StoredDeck, StoredFlashcard, StoredQuiz } from "../../context/AppContext";

interface Deck {
  id: string;
  name: string;
  description: string;
  userId: string;
  flashcardCount: number;
  quizCount: number;
  createdAt: string;
  updatedAt: string;
}

export function StudyMode() {
  const { userId, decks } = useApp();
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [mode, setMode] = useState<"quiz" | "flashcards">("quiz");

  const deckSummaries: Deck[] = useMemo(
    () =>
      decks.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        userId: d.userId,
        flashcardCount: d.flashcards.length,
        quizCount: d.quizzes.length,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    [decks]
  );

  const selectedDeckData: StoredDeck | null = useMemo(
    () => decks.find((d) => d.id === selectedDeckId) ?? null,
    [decks, selectedDeckId]
  );

  useEffect(() => {
    if (deckSummaries.length === 0) {
      setSelectedDeckId(null);
      return;
    }
    if (!selectedDeckId || !deckSummaries.some((d) => d.id === selectedDeckId)) {
      setSelectedDeckId(deckSummaries[0].id);
    }
  }, [deckSummaries, selectedDeckId]);

  if (!userId) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">You need to be logged in to study.</p>
            <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Study Mode</h1>
          <p className="text-muted-foreground">No decks yet. Upload documents to get started!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" />
              No Study Materials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">You haven&apos;t created any study decks yet.</p>
            <Button onClick={() => (window.location.href = "/app/upload")}>Upload Documents Now</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedDeckData || !selectedDeckId) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Loading Deck Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Loader2 className="size-5 animate-spin" />
              <p>Loading deck content...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Study Mode</h1>
        <p className="text-muted-foreground">Test your knowledge with quizzes or flashcards</p>
      </div>

      {deckSummaries.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Deck</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
              {deckSummaries.map((deck) => (
                <Button
                  key={deck.id}
                  variant={selectedDeckId === deck.id ? "default" : "outline"}
                  className="flex flex-col items-center justify-center p-4 h-auto"
                  onClick={() => setSelectedDeckId(deck.id)}
                >
                  <div className="font-semibold text-sm text-center">{deck.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {deck.flashcardCount} cards • {deck.quizCount} quizzes
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="bg-card rounded-lg p-4 border">
        <h2 className="font-semibold mb-1">{selectedDeckData.name}</h2>
        <p className="text-sm text-muted-foreground">
          {selectedDeckData.flashcards.length} flashcards • {selectedDeckData.quizzes.length} quizzes
        </p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "quiz" | "flashcards")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="quiz">Quiz Mode ({selectedDeckData.quizzes.length})</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards ({selectedDeckData.flashcards.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {selectedDeckData.quizzes.length === 0 && mode === "quiz" && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No quiz questions in this deck</p>
          </CardContent>
        </Card>
      )}

      {selectedDeckData.flashcards.length === 0 && mode === "flashcards" && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No flashcards in this deck</p>
          </CardContent>
        </Card>
      )}

      {mode === "quiz" && selectedDeckData.quizzes.length > 0 && (
        <QuizMode quizzes={selectedDeckData.quizzes} />
      )}

      {mode === "flashcards" && selectedDeckData.flashcards.length > 0 && (
        <FlashcardMode flashcards={selectedDeckData.flashcards} />
      )}
    </div>
  );
}

function QuizMode({ quizzes }: { quizzes: StoredQuiz[] }) {
  const { addXP, addCoins } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = quizzes[currentQuestion];
  const progress = ((currentQuestion + 1) / quizzes.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);

    if (selectedAnswer === question.correctOption) {
      setScore(score + 1);
      addXP(10);
      addCoins(2);
      toast.success("Correct! +10 XP, +2 coins", {
        icon: <CheckCircle2 className="size-4" />,
      });
    } else {
      toast.error(`Incorrect. The correct answer is: ${question.options[question.correctOption]}`);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    const percentage = (score / quizzes.length) * 100;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Quiz Completed!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div>
              <div className="text-6xl font-bold mb-2">
                {score}/{quizzes.length}
              </div>
              <p className="text-xl text-muted-foreground">
                {percentage >= 80
                  ? "Excellent work! 🎉"
                  : percentage >= 60
                    ? "Good job! 👍"
                    : "Keep practicing! 💪"}
              </p>
            </div>

            <div className="p-6 rounded-lg bg-accent">
              <p className="text-sm text-muted-foreground mb-2">Total Rewards</p>
              <p className="text-2xl font-bold">+{score * 10} XP</p>
              <p className="text-lg text-amber-600">+{score * 2} coins</p>
            </div>

            <Button onClick={handleRestart} className="gap-2">
              <RotateCw className="size-4" />
              Restart Quiz
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestion + 1} of {quizzes.length}
          </span>
          <span>Score: {score}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correctOption;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      ${
                        showCorrect
                          ? "border-green-500 bg-green-500/10"
                          : showIncorrect
                            ? "border-red-500 bg-red-500/10"
                            : isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50 hover:bg-accent"
                      }
                      ${showResult ? "cursor-default" : "cursor-pointer"}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showCorrect && <CheckCircle2 className="size-5 text-green-600" />}
                      {showIncorrect && <XCircle className="size-5 text-red-600" />}
                    </div>
                  </button>
                );
              })}

              {showResult && (
                <div className="p-3 rounded-lg bg-muted text-sm">
                  <p className="font-medium mb-1">Explanation:</p>
                  <p>{question.explanation}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {!showResult ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                    className="flex-1"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="flex-1 gap-2">
                    {currentQuestion < quizzes.length - 1 ? (
                      <>
                        Next Question
                        <ChevronRight className="size-4" />
                      </>
                    ) : (
                      "Finish Quiz"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function FlashcardMode({ flashcards }: { flashcards: StoredFlashcard[] }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = flashcards[currentCard];
  const progress = ((currentCard + 1) / flashcards.length) * 100;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Card {currentCard + 1} of {flashcards.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="perspective-1000">
        <motion.div
          onClick={handleFlip}
          className="cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <Card className="min-h-[300px] flex items-center justify-center p-8">
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {isFlipped ? "Answer" : "Question"}
              </p>
              <p
                className="text-xl font-medium"
                style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
              >
                {isFlipped ? card.answer : card.question}
              </p>
              <p className="text-sm text-muted-foreground mt-4">Click to flip</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handlePrevious}
          disabled={currentCard === 0}
          variant="outline"
          className="gap-2"
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={currentCard === flashcards.length - 1}
          className="flex-1 gap-2"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
