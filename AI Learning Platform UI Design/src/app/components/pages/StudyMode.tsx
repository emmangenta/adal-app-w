import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";

const quizQuestions = [
  {
    question: "What is the primary function of mitochondria in a cell?",
    options: [
      "Protein synthesis",
      "Energy production (ATP)",
      "DNA replication",
      "Waste removal",
    ],
    correctAnswer: 1,
  },
  {
    question: "Which programming paradigm does React primarily follow?",
    options: [
      "Object-oriented",
      "Procedural",
      "Declarative",
      "Functional",
    ],
    correctAnswer: 2,
  },
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
  },
  {
    question: "What does HTTP stand for?",
    options: [
      "HyperText Transfer Protocol",
      "High Transfer Text Protocol",
      "HyperText Transmission Process",
      "High-Level Transfer Protocol",
    ],
    correctAnswer: 0,
  },
  {
    question: "Which element has the atomic number 1?",
    options: ["Helium", "Hydrogen", "Oxygen", "Carbon"],
    correctAnswer: 1,
  },
];

const flashcards = [
  {
    front: "What is Machine Learning?",
    back: "A subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.",
  },
  {
    front: "Define Photosynthesis",
    back: "The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water, producing oxygen as a byproduct.",
  },
  {
    front: "What is the Pythagorean Theorem?",
    back: "In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides: a² + b² = c²",
  },
  {
    front: "What is React?",
    back: "A JavaScript library for building user interfaces, developed by Facebook. It uses a component-based architecture and virtual DOM.",
  },
  {
    front: "Define Recursion",
    back: "A programming technique where a function calls itself to solve a problem by breaking it down into smaller, similar subproblems.",
  },
];

export function StudyMode() {
  const [mode, setMode] = useState<"quiz" | "flashcards">("quiz");

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Study Mode</h1>
        <p className="text-muted-foreground">Test your knowledge with quizzes or flashcards</p>
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "quiz" | "flashcards")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="quiz">Quiz Mode</TabsTrigger>
          <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "quiz" ? <QuizMode /> : <FlashcardMode />}
    </div>
  );
}

function QuizMode() {
  const { addXP, addCoins } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setShowResult(true);

    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 1);
      addXP(10);
      addCoins(2);
      toast.success("Correct! +10 XP, +2 coins", {
        icon: <CheckCircle2 className="size-4" />,
      });
    } else {
      toast.error("Incorrect. Try again next time!");
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
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
    const percentage = (score / quizQuestions.length) * 100;
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
                {score}/{quizQuestions.length}
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
            Question {currentQuestion + 1} of {quizQuestions.length}
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
                const isCorrect = index === question.correctAnswer;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={index}
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
                    {currentQuestion < quizQuestions.length - 1 ? (
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

function FlashcardMode() {
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
              <p className="text-xl font-medium" style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}>
                {isFlipped ? card.back : card.front}
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
