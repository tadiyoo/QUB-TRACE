import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

/** Use DATABASE_PATH for deployment (e.g. /data/trace-data.sqlite on Railway/Fly volume). */
const dbPath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "trace-data.sqlite");

let db: any = null;

/**
 * Lazy-initialize the database so better-sqlite3 (native module) is only
 * loaded when the first API request runs, not when Next.js compiles the app.
 */
function getDb() {
  if (db) return db;
  const Database = require("better-sqlite3");
  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = new Database(dbPath);
  } catch (e) {
    console.error("Failed to open SQLite database", { dbPath, error: e });
    throw e;
  }
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      firstName TEXT,
      lastName TEXT,
      school TEXT,
      department TEXT,
      passwordHash TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      report_id INTEGER,
      title TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      totalKgCo2e REAL,
      dataJson TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS feedback (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  try {
    db.exec(`
      ALTER TABLE reports ADD COLUMN report_id INTEGER;
      UPDATE reports
      SET report_id = (
        SELECT COUNT(*) FROM reports r2
        WHERE r2.createdAt <= reports.createdAt
      )
      WHERE report_id IS NULL;
    `);
  } catch (_e) {
    /* column already exists */
  }

  try {
    db.exec(`ALTER TABLE reports ADD COLUMN resultJson TEXT;`);
  } catch (_e) {
    /* column already exists */
  }

  return db;
}

export interface DbUser {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  school: string | null;
  department: string | null;
  passwordHash: string;
  createdAt: string;
}

export function createUser(user: Omit<DbUser, "id" | "createdAt"> & { passwordHash: string }): DbUser {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const stmt = getDb().prepare(`
    INSERT INTO users (id, email, username, firstName, lastName, school, department, passwordHash, createdAt)
    VALUES (@id, @email, @username, @firstName, @lastName, @school, @department, @passwordHash, @createdAt)
  `);
  stmt.run({ id, createdAt, ...user });
  return getUserById(id)!;
}

export function getUserByEmail(email: string): DbUser | undefined {
  const stmt = getDb().prepare("SELECT * FROM users WHERE email = ?");
  return stmt.get(email) as DbUser | undefined;
}

export function getUserById(id: string): DbUser | undefined {
  const stmt = getDb().prepare("SELECT * FROM users WHERE id = ?");
  return stmt.get(id) as DbUser | undefined;
}

export function updateUserProfile(
  id: string,
  patch: Partial<Pick<DbUser, "username" | "firstName" | "lastName" | "school" | "department">>
): DbUser | undefined {
  const current = getUserById(id);
  if (!current) return undefined;
  const next = {
    ...current,
    ...patch,
  };
  const stmt = getDb().prepare(`
    UPDATE users
    SET username = @username,
        firstName = @firstName,
        lastName = @lastName,
        school = @school,
        department = @department
    WHERE id = @id
  `);
  stmt.run(next);
  return getUserById(id) ?? undefined;
}

export interface DbSession {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export function createSession(userId: string, ttlDays = 7): DbSession {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString();
  const stmt = getDb().prepare(`
    INSERT INTO sessions (id, userId, createdAt, expiresAt)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, userId, createdAt, expiresAt);
  return { id, userId, createdAt, expiresAt };
}

export function getSession(id: string): DbSession | undefined {
  const stmt = getDb().prepare("SELECT * FROM sessions WHERE id = ?");
  const session = stmt.get(id) as DbSession | undefined;
  if (!session) return undefined;
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    deleteSession(id);
    return undefined;
  }
  return session;
}

export function deleteSession(id: string): void {
  const stmt = getDb().prepare("DELETE FROM sessions WHERE id = ?");
  stmt.run(id);
}

export interface DbReport {
  id: string;
  userId: string;
  report_id: number | null;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalKgCo2e: number | null;
  dataJson: string;
  resultJson?: string | null;
}

export function createReport(userId: string, title: string, data: unknown, status = "draft"): DbReport {
  const id = randomUUID();
  const now = new Date().toISOString();
  const nextSeqStmt = getDb().prepare(`
    SELECT COALESCE(MAX(report_id), 0) + 1 AS nextSeq
    FROM reports
  `);
  const nextSeqRow = nextSeqStmt.get() as { nextSeq: number } | undefined;
  const seq = nextSeqRow?.nextSeq ?? 1;
  const stmt = getDb().prepare(`
    INSERT INTO reports (id, userId, report_id, title, status, createdAt, updatedAt, totalKgCo2e, dataJson)
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?)
  `);
  stmt.run(id, userId, seq, title, status, now, now, JSON.stringify(data));
  return getReportById(id)!;
}

export function updateReport(id: string, patch: Partial<Pick<DbReport, "title" | "status" | "totalKgCo2e" | "dataJson" | "resultJson">>): DbReport | undefined {
  const current = getReportById(id);
  if (!current) return undefined;
  const next = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const stmt = getDb().prepare(`
    UPDATE reports
    SET title = @title,
        status = @status,
        updatedAt = @updatedAt,
        totalKgCo2e = @totalKgCo2e,
        dataJson = @dataJson,
        resultJson = @resultJson
    WHERE id = @id
  `);
  stmt.run(next);
  return getReportById(id)!;
}

export function getReportById(id: string): DbReport | undefined {
  const stmt = getDb().prepare("SELECT * FROM reports WHERE id = ?");
  return stmt.get(id) as DbReport | undefined;
}

export function listReportsForUser(userId: string): DbReport[] {
  const stmt = getDb().prepare("SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC");
  return stmt.all(userId) as DbReport[];
}

export function deleteReport(id: string): void {
  const stmt = getDb().prepare("DELETE FROM reports WHERE id = ?");
  stmt.run(id);
}

export interface DbFeedback {
  id: string;
  userId: string;
  type: string;
  subject: string;
  message: string;
  createdAt: string;
}

export function createFeedback(userId: string, type: string, subject: string, message: string): DbFeedback {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const stmt = getDb().prepare(`
    INSERT INTO feedback (id, userId, type, subject, message, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, type, subject, message, createdAt);
  return { id, userId, type, subject, message, createdAt };
}

export function listAllUsers(): DbUser[] {
  const stmt = getDb().prepare(
    "SELECT * FROM users ORDER BY datetime(createdAt) DESC"
  );
  return stmt.all() as DbUser[];
}

export function listAllReports(): DbReport[] {
  const stmt = getDb().prepare(
    "SELECT * FROM reports ORDER BY datetime(updatedAt) DESC"
  );
  return stmt.all() as DbReport[];
}

export interface DbFeedbackWithUser extends DbFeedback {
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
}

export function listAdminRequestsWithUser(): DbFeedbackWithUser[] {
  const stmt = getDb().prepare(`
    SELECT
      f.id, f.userId, f.type, f.subject, f.message, f.createdAt,
      u.email, u.username, u.firstName, u.lastName
    FROM feedback f
    JOIN users u ON u.id = f.userId
    WHERE f.type = 'admin'
    ORDER BY datetime(f.createdAt) DESC
  `);
  return stmt.all() as DbFeedbackWithUser[];
}
