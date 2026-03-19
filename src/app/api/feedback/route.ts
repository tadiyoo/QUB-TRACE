import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createFeedback } from "@/lib/db";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { type, subject, message } = body as {
      type: "feedback" | "admin";
      subject: string;
      message: string;
    };
    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
    }
    const fb = createFeedback(user.id, type ?? "feedback", subject, message);
    return NextResponse.json({ feedback: fb }, { status: 201 });
  } catch (e) {
    console.error("Feedback error", e);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}

