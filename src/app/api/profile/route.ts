import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/db";

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { username, firstName, lastName, school, department } = body as {
      username?: string;
      firstName?: string;
      lastName?: string;
      school?: string;
      department?: string;
    };

    const updated = updateUserProfile(user.id, {
      username: username ?? user.username,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      school: school ?? user.school,
      department: department ?? user.department,
    });

    if (!updated) return NextResponse.json({ error: "Update failed" }, { status: 500 });

    return NextResponse.json({
      id: updated.id,
      username: updated.username,
      firstName: updated.firstName,
      lastName: updated.lastName,
      school: updated.school,
      department: updated.department,
      email: updated.email,
    });
  } catch (e) {
    console.error("Profile update error", e);
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }
}

