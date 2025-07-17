import { NextResponse } from "next/server";
import { generateSummary } from "@/lib/ai/openai";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const summary = await generateSummary(text);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error in summarize route:", error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
} 