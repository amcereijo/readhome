import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "./db";
import { users } from "./db/schema";
import { ensureUser } from "./users";
import type { AppUser } from "./types";

export { INVITE_COOKIE } from "./auth-constants";

// Landing-page capture mode is dev-only and refuses to run in production.
// When active, server-side auth helpers substitute the seeded fixture user so
// Playwright can render signed-in screens without a real Clerk session.
const FIXTURE_CLERK_ID = "user_landing_fixture_dev_only";

function captureModeActive(): boolean {
  return (
    process.env.NODE_ENV !== "production" && process.env.LANDING_CAPTURE === "1"
  );
}

async function fixtureUser() {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, FIXTURE_CLERK_ID))
    .limit(1);
  return row ?? null;
}

export async function requireSignedIn() {
  if (captureModeActive()) {
    const row = await fixtureUser();
    if (row) return { user: ensureFixtureUser(row), created: false };
  }
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return ensureUser(userId);
}

export async function requireAppUser(): Promise<AppUser & { username: string }> {
  const { user } = await requireSignedIn();
  if (!user.username) {
    redirect("/claim-username");
  }
  return { ...user, username: user.username };
}

export async function requireClaimableUser() {
  const { user, created } = await requireSignedIn();
  if (user.username) {
    redirect("/");
  }
  return { user, created };
}

function ensureFixtureUser(row: typeof users.$inferSelect): AppUser {
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
