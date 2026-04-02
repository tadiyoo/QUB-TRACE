import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getReportById, updateReport, deleteReport } from "@/lib/db";
import { calculateTraceResult, mergeTraceDataForPatch, type TraceInputs } from "@/lib/calc";

// Prevent Next.js from attempting any build-time/static work for this dynamic API route.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const report = getReportById(params.id);
  if (!report || report.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ report });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = getReportById(params.id);
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  try {
    const body = await request.json();
    const { title, status, totalKgCo2e, data } = body as {
      title?: string;
      status?: string;
      totalKgCo2e?: number | null;
      data?: unknown;
    };
    const existingInputs = JSON.parse(existing.dataJson) as TraceInputs;
    const inputs = data != null ? mergeTraceDataForPatch(existingInputs, data as Partial<TraceInputs>) : existingInputs;
    const calc = calculateTraceResult(title ?? existing.title, inputs);
    const updated = updateReport(params.id, {
      title,
      status,
      totalKgCo2e: totalKgCo2e ?? calc.totalKgCo2e,
      dataJson: JSON.stringify(inputs),
      resultJson: JSON.stringify(calc),
    });
    return NextResponse.json({ report: updated });
  } catch (e) {
    console.error("Update report error", e);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = getReportById(params.id);
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  deleteReport(params.id);
  return NextResponse.json({ ok: true });
}

