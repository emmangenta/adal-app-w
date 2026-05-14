import { NextRequest, NextResponse } from "next/server";
import { feynmanChatReply, feynmanEvaluate, getGeminiApiKey } from "@/lib/gemini";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  try {
    if (!getGeminiApiKey()) {
      return NextResponse.json(
        {
          error:
            "Gemini API key not configured. Add GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY in Vercel environment variables.",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      type?: string;
      topic?: string;
      explanation?: string;
      messages?: ChatMessage[];
    };

    const topic = typeof body.topic === "string" ? body.topic : "";

    if (body.type === "evaluate") {
      const explanation = typeof body.explanation === "string" ? body.explanation : "";
      if (explanation.trim().length < 50) {
        return NextResponse.json(
          { error: "Explanation must be at least 50 characters." },
          { status: 400 }
        );
      }
      const feedback = await feynmanEvaluate(topic, explanation);
      return NextResponse.json({ ok: true, feedback }, { status: 200 });
    }

    if (body.type === "chat") {
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const normalized: ChatMessage[] = messages
        .filter(
          (m): m is ChatMessage =>
            m != null &&
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string"
        )
        .map((m) => ({ role: m.role, content: m.content.trim() }))
        .filter((m) => m.content.length > 0);

      if (normalized.length === 0) {
        return NextResponse.json({ error: "messages must include at least one user turn." }, { status: 400 });
      }

      const reply = await feynmanChatReply(topic, normalized);
      return NextResponse.json({ ok: true, reply }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Invalid type. Use "evaluate" or "chat".' },
      { status: 400 }
    );
  } catch (error) {
    console.error("Feynman API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Feynman request failed" },
      { status: 500 }
    );
  }
}
