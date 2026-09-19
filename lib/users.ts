import { cookies } from "next/headers";
import { and, eq, inArray } from "drizzle-orm";
import { INVITE_COOKIE } from "./auth-constants";
import { type BookCounts, countBooksByStatus, listBooks } from "./books";
import { db } from "./db";
import { users } from "./db/schema";
import type { AppUser, BookRecord } from "./types";

function nowIso() {
  return new Date().toISOString();
}

function toUser(row: typeof users.$inferSelect): AppUser {
  return {
    id: row.id,
    clerkId: row.clerkId,
    username: row.username,
    pendingInviteToken: row.pendingInviteToken,
    publicShelfToken: row.publicShelfToken,
    publicShelfEnabled: row.publicShelfEnabled === "1",
    createdAt: row.createdAt,
  };
}

export function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase();
}

export function isValidUsername(raw: string) {
  return /^[a-z0-9_]{3,32}$/.test(normalizeUsername(raw));
}

export async function getUserByClerkId(clerkId: string) {
  const [row] = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return row ? toUser(row) : null;
}

export async function getUserByUsername(username: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.username, normalizeUsername(username)))
    .limit(1);
  return row ? toUser(row) : null;
}

export async function listUsernamesById(ids: string[]): Promise<Map<string, string>> {
  if (ids.length === 0) return new Map();
  const rows = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(inArray(users.id, ids));
  return new Map(rows.filter((r) => r.username).map((r) => [r.id, r.username as string]));
}

export async function ensureUser(clerkId: string) {
  const existing = await getUserByClerkId(clerkId);
  if (existing) return { user: existing, created: false };

  const jar = await cookies();
  const pendingInviteToken = jar.get(INVITE_COOKIE)?.value ?? null;
  await db.insert(users).values({
    id: crypto.randomUUID(),
    clerkId,
    username: null,
    pendingInviteToken,
    publicShelfToken: null,
    publicShelfEnabled: "0",
    createdAt: nowIso(),
  });
  const user = await getUserByClerkId(clerkId);
  if (!user) {
    throw new Error("User not found immediately after creation");
  }
  return { user, created: true };
}

export async function claimUsername(userId: string, username: string) {
  const normalized = normalizeUsername(username);
  await db.update(users).set({ username: normalized }).where(eq(users.id, userId));
}

export async function clearPendingInvite(userId: string) {
  await db.update(users).set({ pendingInviteToken: null }).where(eq(users.id, userId));
}

export type PublicShelfSnapshot = {
  owner: { id: string; username: string; createdAt: string };
  books: BookRecord[];
  counts: BookCounts;
};

export async function getPublicShelfByToken(token: string): Promise<PublicShelfSnapshot | null> {
  const [row] = await db
    .select({
      id: users.id,
      username: users.username,
      publicShelfEnabled: users.publicShelfEnabled,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.publicShelfToken, token), eq(users.publicShelfEnabled, "1")))
    .limit(1);
  if (!row || !row.username) return null;

  const [books, counts] = await Promise.all([
    listBooks(row.id),
    countBooksByStatus(row.id),
  ]);

  return {
    owner: { id: row.id, username: row.username, createdAt: row.createdAt },
    books,
    counts,
  };
}

export async function mintPublicShelfToken(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  await db
    .update(users)
    .set({ publicShelfToken: token, publicShelfEnabled: "1" })
    .where(eq(users.id, userId));
  return token;
}

export async function rotatePublicShelfToken(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  await db
    .update(users)
    .set({ publicShelfToken: token })
    .where(eq(users.id, userId));
  return token;
}

export async function disablePublicShelf(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ publicShelfToken: null, publicShelfEnabled: "0" })
    .where(eq(users.id, userId));
}
