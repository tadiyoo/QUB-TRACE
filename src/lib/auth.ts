import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createSession, deleteSession, getSession, getUserById, type DbUser } from "./db";

const SESSION_COOKIE = "trace_session";

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setSessionCookie(userId: string) {
  const session = createSession(userId);
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });
}

export function clearSessionCookie() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    deleteSession(sessionId);
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<DbUser | null> {
  const cookieStore = cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  const session = getSession(sessionId);
  if (!session) return null;
  const user = getUserById(session.userId);
  return user ?? null;
}

