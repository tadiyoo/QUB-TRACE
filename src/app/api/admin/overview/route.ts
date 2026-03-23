import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";
import {
  listAllUsers,
  listAllReports,
  listAdminRequestsWithUser,
} from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = listAllUsers().map((u) => ({
    id: u.id,
    email: u.email,
    username: u.username,
    firstName: u.firstName,
    lastName: u.lastName,
    school: u.school,
    department: u.department,
    createdAt: u.createdAt,
  }));

  const reports = listAllReports().map((r) => ({
    id: r.id,
    report_id: r.report_id,
    userId: r.userId,
    title: r.title,
    status: r.status,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    totalKgCo2e: r.totalKgCo2e,
  }));

  const adminRequests = listAdminRequestsWithUser();

  return NextResponse.json({ users, reports, adminRequests });
}

