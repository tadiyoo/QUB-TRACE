import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createReport, listReportsForUser, updateReport } from "@/lib/db";
import { calculateTraceResult, type TraceInputs } from "@/lib/calc";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reports = listReportsForUser(user.id);
  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { title, data } = body as { title: string; data: TraceInputs };
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    const inputs = data ?? {};
    const calc = calculateTraceResult(title, inputs);
    const report = createReport(user.id, title, inputs, "draft");
    // persist the calculation result on create
    const withResult = updateReport(report.id, {
      totalKgCo2e: calc.totalKgCo2e,
      dataJson: JSON.stringify(inputs),
      resultJson: JSON.stringify(calc),
    });
    return NextResponse.json({ report: withResult }, { status: 201 });
  } catch (e) {
    console.error("Create report error", e);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}

