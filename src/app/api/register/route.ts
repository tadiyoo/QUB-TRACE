import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      username,
      firstName,
      lastName,
      school,
      department,
    } = body as {
      email: string;
      password: string;
      username: string;
      firstName?: string;
      lastName?: string;
      school?: string;
      department?: string;
    };

    if (!email || !password || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = getUserByEmail(email.toLowerCase());
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const user = createUser({
      email: email.toLowerCase(),
      username,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      school: school ?? null,
      department: department ?? null,
      passwordHash,
    });

    setSessionCookie(user.id);

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        school: user.school,
        department: user.department,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("Register error", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

