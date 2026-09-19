import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "./db";
import { friendships, inviteLinks, users } from "./db/schema";

function nowIso() {
  return new Date().toISOString();
}

export async function areAcceptedFriends(userIdA: string, userIdB: string) {
  if (userIdA === userIdB) return true;
  const [row] = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(
          and(eq(friendships.requesterId, userIdA), eq(friendships.addresseeId, userIdB)),
          and(eq(friendships.requesterId, userIdB), eq(friendships.addresseeId, userIdA)),
        ),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function canReadShelf(viewerId: string, ownerId: string) {
  return areAcceptedFriends(viewerId, ownerId);
}

export async function getFriendshipBetween(userIdA: string, userIdB: string) {
  const [row] = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, userIdA), eq(friendships.addresseeId, userIdB)),
        and(eq(friendships.requesterId, userIdB), eq(friendships.addresseeId, userIdA)),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function createUsernameInvite(requesterId: string, addresseeId: string) {
  await db.insert(friendships).values({
    id: crypto.randomUUID(),
    requesterId,
    addresseeId,
    status: "pending",
    createdAt: nowIso(),
  });
}

export async function acceptFriendship(id: string) {
  await db.update(friendships).set({ status: "accepted" }).where(eq(friendships.id, id));
}

export async function declineFriendship(id: string) {
  await db.delete(friendships).where(eq(friendships.id, id));
}

export async function listIncomingPending(userId: string) {
  return db
    .select({
      id: friendships.id,
      requesterUsername: users.username,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.requesterId))
    .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, "pending")));
}

export async function listOutgoingPending(userId: string) {
  return db
    .select({
      id: friendships.id,
      addresseeUsername: users.username,
      createdAt: friendships.createdAt,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.addresseeId))
    .where(and(eq(friendships.requesterId, userId), eq(friendships.status, "pending")));
}

export async function listAcceptedFriends(userId: string) {
  const rows = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.status, "accepted"),
        or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      ),
    );

  const friendIds = rows.map((row) => (row.requesterId === userId ? row.addresseeId : row.requesterId));
  if (friendIds.length === 0) return [];

  const friendRows = await db.select().from(users);
  return friendRows.filter((user) => friendIds.includes(user.id) && user.username).map(toUser);
}

function toUser(row: typeof users.$inferSelect) {
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

export async function createInviteLink(creatorId: string) {
  const token = crypto.randomUUID();
  await db.insert(inviteLinks).values({
    id: crypto.randomUUID(),
    creatorId,
    token,
    usedAt: null,
    createdAt: nowIso(),
  });
  return token;
}

export async function getInviteLink(token: string) {
  const [row] = await db.select().from(inviteLinks).where(eq(inviteLinks.token, token)).limit(1);
  return row ?? null;
}

export async function consumeInviteForNewUser(token: string, newUserId: string) {
  const link = await getInviteLink(token);
  if (!link || link.usedAt) return false;
  if (link.creatorId === newUserId) return false;

  const existing = await getFriendshipBetween(link.creatorId, newUserId);

  await db.transaction(async (tx) => {
    await tx
      .update(inviteLinks)
      .set({ usedAt: nowIso() })
      .where(and(eq(inviteLinks.token, token), isNull(inviteLinks.usedAt)));
    if (existing?.status === "accepted") return;
    if (existing?.status === "pending") {
      await tx.update(friendships).set({ status: "accepted" }).where(eq(friendships.id, existing.id));
      return;
    }
    await tx.insert(friendships).values({
      id: crypto.randomUUID(),
      requesterId: link.creatorId,
      addresseeId: newUserId,
      status: "accepted",
      createdAt: nowIso(),
    });
  });

  return true;
}
