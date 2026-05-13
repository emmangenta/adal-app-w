"use client";

import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { Sparkles, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { motion } from "motion/react";

export function FeynmanMode() {
  const { addXP, addCoins } = useApp();
  const [concept, setConcept] = useState("");
  const [explanation, setExplanation] = useState("");
  const [feedback, setFeedback] = useState<{
    strengths: string[];
    missing: string[];
    improvements: string[];
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleEvaluate = () => {
    if (explanation.trim().length < 50) {
      toast.error("Please write a more detailed explanation (at least 50 characters)");
      return;
    }

    setIsEvaluating(true);

    setTimeout(() => {
      const mockFeedback = {
        strengths: [
          "Clear and concise explanation of the core concept",
          "Good use of analogies to simplify complex ideas",
          "Well-structured explanation with logical flow",
        ],
        missing: [
          "Consider adding more real-world examples",
          "The relationship between key components could be explained better",
          "Missing explanation of edge cases or limitations",
        ],
        improvements: [
          "Try explaining it as if teaching a 10-year-old",
          "Break down the concept into smaller, digestible parts",
          "Use visual analogies or metaphors to enhance understanding",
        ],
      };

      setFeedback(mockFeedback);
      setIsEvaluating(false);

      addXP(20);
      addCoins(5);
      toast.success("Explanation evaluated! +20 XP, +5 coins");
    }, 2000);
  };

  const handleReset = () => {
    setConcept("");
    setExplanation("");
    setFeedback(null);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Feynman Mode</h1>
        <p className="text-muted-foreground">
          Explain concepts in your own words and get AI feedback
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About the Feynman Technique</CardTitle>
          <CardDescription>
            Named after physicist Richard Feynman, this learning method helps you understand
            concepts deeply by explaining them in simple terms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-accent">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-sm font-medium text-primary">1</span>
              </div>
              <h4 className="font-medium mb-1">Choose a Concept</h4>
              <p className="text-sm text-muted-foreground">
                Pick something you want to understand better
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-sm font-medium text-primary">2</span>
              </div>
              <h4 className="font-medium mb-1">Explain Simply</h4>
              <p className="text-sm text-muted-foreground">
                Write it as if teaching a beginner
              </p>
            </div>
            <div className="p-4 rounded-lg bg-accent">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-sm font-medium text-primary">3</span>
              </div>
              <h4 className="font-medium mb-1">Review Feedback</h4>
              <p className="text-sm text-muted-foreground">
                Identify gaps and improve your understanding
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Explanation</CardTitle>
          <CardDescription>
            Explain a concept you're learning in your own words
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Concept Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g., Photosynthesis, Machine Learning, Recursion..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Your Explanation</label>
            <Textarea
              placeholder="Explain the concept in your own words, as if teaching someone who knows nothing about it..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {explanation.length} characters (minimum 50)
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleEvaluate}
              disabled={isEvaluating || explanation.trim().length < 50}
              className="gap-2"
            >
              {isEvaluating ? (
                <>
                  <Sparkles className="size-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Evaluate Explanation
                </>
              )}
            </Button>
            {feedback && (
              <Button onClick={handleReset} variant="outline">
                Start New
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-600" />
                Strengths
              </CardTitle>
              <CardDescription>What you did well</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="size-5 text-amber-600" />
                Missing Information
              </CardTitle>
              <CardDescription>Areas that need more detail</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.missing.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertCircle className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-5 text-blue-600" />
                Suggestions for Improvement
              </CardTitle>
              <CardDescription>How to make your explanation even better</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Lightbulb className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
