"use client";

import { useState } from "react";
import { useApp } from "../../context/AppContext";
import type { FeynmanEvaluateResult } from "@/lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  MessageCircle,
  Send,
  Target,
} from "lucide-react";
import { motion } from "motion/react";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function FeynmanMode() {
  const { addXP, addCoins } = useApp();
  const [concept, setConcept] = useState("");
  const [explanation, setExplanation] = useState("");
  const [feedback, setFeedback] = useState<FeynmanEvaluateResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatSending, setIsChatSending] = useState(false);

  const topicLabel = concept.trim() || "General topic";

  const handleEvaluate = async () => {
    if (explanation.trim().length < 50) {
      toast.error("Please write a more detailed explanation (at least 50 characters)");
      return;
    }

    setIsEvaluating(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/feynman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "evaluate",
          topic: topicLabel,
          explanation: explanation.trim(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        feedback?: FeynmanEvaluateResult;
        error?: string;
      };

      if (!res.ok || !data.feedback) {
        throw new Error(data.error || "Evaluation failed");
      }

      setFeedback(data.feedback);
      setMessages([
        {
          role: "user",
          content: `Topic: ${topicLabel}\n\nMy explanation:\n${explanation.trim()}`,
        },
        { role: "assistant", content: data.feedback.reply },
      ]);

      addXP(20);
      addCoins(5);
      toast.success("Explanation evaluated! +20 XP, +5 coins");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not reach Gemini");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSendChat = async () => {
    const text = chatInput.trim();
    if (!text) return;
    if (messages.length === 0) {
      toast.error("Evaluate an explanation first to start the chat.");
      return;
    }

    setIsChatSending(true);
    const nextMessages: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setChatInput("");

    try {
      const res = await fetch("/api/feynman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "chat",
          topic: topicLabel,
          messages: nextMessages,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "Chat failed");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chat request failed");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsChatSending(false);
    }
  };

  const handleReset = () => {
    setConcept("");
    setExplanation("");
    setFeedback(null);
    setMessages([]);
    setChatInput("");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Feynman Mode</h1>
        <p className="text-muted-foreground">
          Explain a topic in plain language — Gemini checks accuracy against the real idea, then you can
          keep chatting.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About the Feynman Technique</CardTitle>
          <CardDescription>
            Named after physicist Richard Feynman, this learning method helps you understand concepts deeply
            by explaining them in simple terms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-accent">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-sm font-medium text-primary">1</span>
              </div>
              <h4 className="font-medium mb-1">Choose a Concept</h4>
              <p className="text-sm text-muted-foreground">Pick something you want to understand better</p>
            </div>
            <div className="p-4 rounded-lg bg-accent">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-sm font-medium text-primary">2</span>
              </div>
              <h4 className="font-medium mb-1">Explain Simply</h4>
              <p className="text-sm text-muted-foreground">Write it as if teaching a beginner</p>
            </div>
            <div className="p-4 rounded-lg bg-accent">
              <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <span className="text-sm font-medium text-primary">3</span>
              </div>
              <h4 className="font-medium mb-1">Review &amp; Chat</h4>
              <p className="text-sm text-muted-foreground">Get structured feedback, then ask follow-ups</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Explanation</CardTitle>
          <CardDescription>
            Add a topic title (recommended), then explain the concept in your own words.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <input
              type="text"
              placeholder="e.g., Photosynthesis, TCP/IP, Supply and demand…"
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

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleEvaluate}
              disabled={isEvaluating || explanation.trim().length < 50}
              className="gap-2"
            >
              {isEvaluating ? (
                <>
                  <Sparkles className="size-4 animate-spin" />
                  Evaluating…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Evaluate with Gemini
                </>
              )}
            </Button>
            {(feedback || messages.length > 0) && (
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
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                <Target className="size-5 text-primary" />
                Accuracy vs the real topic
              </CardTitle>
              <CardDescription>
                {feedback.spotOn ? (
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Spot on — strong alignment with the standard idea.
                  </span>
                ) : (
                  <span className="text-amber-700 dark:text-amber-400 font-medium">
                    Not quite spot on yet — review gaps below and keep iterating.
                  </span>
                )}{" "}
                Score: <span className="font-semibold">{feedback.accuracyScore}/100</span>
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="size-5" />
                Tutor chat
              </CardTitle>
              <CardDescription>Conversation with Gemini grounded in your topic</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-80 space-y-3 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Ask a follow-up (examples, analogies, ‘what did I get wrong?’)…"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  rows={2}
                  className="resize-none min-h-[3rem]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isChatSending) void handleSendChat();
                    }
                  }}
                />
                <Button
                  type="button"
                  className="shrink-0 self-end gap-2"
                  disabled={isChatSending || !chatInput.trim()}
                  onClick={() => void handleSendChat()}
                >
                  {isChatSending ? (
                    <Sparkles className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

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
                Gaps &amp; misconceptions
              </CardTitle>
              <CardDescription>Areas that need more detail</CardDescription>
            </CardHeader>
            <CardContent>
              {feedback.missing.length === 0 ? (
                <p className="text-sm text-muted-foreground">No major gaps flagged.</p>
              ) : (
                <ul className="space-y-2">
                  {feedback.missing.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="size-5 text-blue-600" />
                Suggestions for improvement
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
