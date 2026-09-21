import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  books,
  friendships,
  inviteLinks,
  recommendations,
  users,
} from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const FIXTURE_CLERK_ID = "user_landing_fixture_dev_only";
const FIXTURE_USERNAME = "landingfixture";
const FIXTURE_TOKEN_PREFIX = "landing-fixture-token-";

type SeededFixture = {
  ownerClerkId: string;
  ownerUsername: string;
  ownerId: string;
  friendClerkId: string;
  friendUsername: string;
  friendId: string;
  publicShelfToken: string;
  inviteToken: string;
};

function nowIso() {
  return new Date().toISOString();
}

function assertCaptureMode() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "fixture_disabled_in_production" },
      { status: 404 },
    );
  }
  if (process.env.LANDING_CAPTURE !== "1") {
    return NextResponse.json(
      { error: "fixture_disabled_set_LANDING_CAPTURE=1" },
      { status: 404 },
    );
  }
  return null;
}

async function upsertUser(input: {
  clerkId: string;
  username: string;
}): Promise<{ id: string }> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkId, input.clerkId))
    .limit(1);
  if (existing) {
    await db
      .update(users)
      .set({
        username: input.username,
        publicShelfEnabled: "1",
        pendingInviteToken: null,
      })
      .where(eq(users.id, existing.id));
    return { id: existing.id };
  }
  const id = crypto.randomUUID();
  const publicShelfToken = input.username === FIXTURE_USERNAME
    ? `${FIXTURE_TOKEN_PREFIX}${id}`
    : null;
  await db.insert(users).values({
    id,
    clerkId: input.clerkId,
    username: input.username,
    pendingInviteToken: null,
    publicShelfToken,
    publicShelfEnabled: publicShelfToken ? "1" : "0",
    createdAt: nowIso(),
  });
  return { id };
}

async function resetFixtureState(ownerId: string, friendId: string) {
  await db
    .delete(books)
    .where(inArray(books.ownerId, [ownerId, friendId]));
  await db
    .delete(friendships)
    .where(
      inArray(friendships.requesterId, [ownerId, friendId]),
    );
  await db
    .delete(friendships)
    .where(
      inArray(friendships.addresseeId, [ownerId, friendId]),
    );
  await db
    .delete(recommendations)
    .where(
      inArray(recommendations.senderId, [ownerId, friendId]),
    );
  await db
    .delete(recommendations)
    .where(
      inArray(recommendations.receiverId, [ownerId, friendId]),
    );
}

async function seedBooks(ownerId: string, friendId: string) {
  const today = nowIso();
  const entries = [
    {
      owner: ownerId,
      title: "The Left Hand of Darkness",
      author: "Ursula K. Le Guin",
      status: "reading" as const,
      formats: ["paperback"],
      startedAt: today.slice(0, 10),
      metadata: fixtureMetadata("9780441478125", 304),
    },
    {
      owner: ownerId,
      title: "Piranesi",
      author: "Susanna Clarke",
      status: "read" as const,
      formats: ["hardcover", "ebook"],
      startedAt: "2025-12-01",
      finishedAt: "2025-12-10",
      metadata: fixtureMetadata("9781635577802", 272),
    },
    {
      owner: ownerId,
      title: "Project Hail Mary",
      author: "Andy Weir",
      status: "to-read" as const,
      formats: ["ebook"],
      startedAt: null,
      finishedAt: null,
      metadata: fixtureMetadata("9780593135204", 496),
    },
    {
      owner: ownerId,
      title: "Tomorrow, and Tomorrow, and Tomorrow",
      author: "Gabrielle Zevin",
      status: "abandoned" as const,
      formats: ["paperback"],
      startedAt: "2025-09-15",
      abandonedAt: "2025-10-04",
      metadata: fixtureMetadata("9780593321201", 416),
    },
    {
      owner: ownerId,
      title: "Atomic Habits",
      author: "James Clear",
      status: "read" as const,
      formats: ["hardcover"],
      startedAt: "2025-08-10",
      finishedAt: "2025-09-02",
      metadata: fixtureMetadata("9780735211292", 320),
    },
    {
      owner: ownerId,
      title: "The Dispossessed",
      author: "Ursula K. Le Guin",
      status: "read" as const,
      formats: ["paperback"],
      startedAt: "2025-06-01",
      finishedAt: "2025-06-19",
      metadata: fixtureMetadata("9780061054884", 387),
    },
    {
      owner: ownerId,
      title: "Sapiens",
      author: "Yuval Noah Harari",
      status: "read" as const,
      formats: ["paperback", "ebook"],
      startedAt: "2025-03-10",
      finishedAt: "2025-04-22",
      metadata: fixtureMetadata("9780062316097", 464),
    },
    {
      owner: ownerId,
      title: "The Three-Body Problem",
      author: "Cixin Liu",
      status: "to-read" as const,
      formats: ["paperback"],
      startedAt: null,
      finishedAt: null,
      metadata: fixtureMetadata("9780765382030", 400),
    },
    {
      owner: ownerId,
      title: "El monje que vendió su Ferrari",
      author: "Robin Sharma",
      status: "read" as const,
      formats: ["paperback"],
      startedAt: "2024-08-12",
      finishedAt: "2024-08-18",
      metadata: fixtureMetadata("9788499086735", 256),
    },
    {
      owner: ownerId,
      title: "Si lo crees, lo creas",
      author: "Brian Tracy",
      status: "read" as const,
      formats: ["paperback"],
      startedAt: "2024-09-20",
      finishedAt: "2024-09-27",
      metadata: fixtureMetadata("9788499086736", 224),
    },
    {
      owner: ownerId,
      title: "Pensar rápido, pensar despacio",
      author: "Daniel Kahneman",
      status: "read" as const,
      formats: ["paperback"],
      startedAt: "2025-01-02",
      finishedAt: "2025-01-04",
      metadata: fixtureMetadata("9788499923832", 528),
    },
    {
      owner: ownerId,
      title: "El planeta de los simios",
      author: "Pierre Boulle",
      status: "read" as const,
      formats: ["paperback"],
      startedAt: "2026-04-01",
      finishedAt: "2026-04-10",
      metadata: fixtureMetadata("9788497592206", 192),
    },
    {
      owner: ownerId,
      title: "Elon Musk",
      author: "Ashlee Vance",
      status: "read" as const,
      formats: ["ebook"],
      startedAt: "2023-11-10",
      finishedAt: "2023-11-18",
      metadata: fixtureMetadata("9780062301239", 416),
    },
    {
      owner: ownerId,
      title: "The CTO ToolBox",
      author: "Sergio Gago Huerta",
      status: "read" as const,
      formats: ["paperback"],
      startedAt: "2024-11-10",
      finishedAt: "2024-11-15",
      metadata: fixtureMetadata("9781098105286", 280),
    },
    {
      owner: friendId,
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      status: "reading" as const,
      formats: ["paperback"],
      startedAt: "2026-01-12",
      metadata: fixtureMetadata("9780593318171", 320),
    },
    {
      owner: friendId,
      title: "Sea of Tranquility",
      author: "Emily St. John Mandel",
      status: "read" as const,
      formats: ["paperback"],
      startedAt: "2024-02-12",
      finishedAt: "2024-02-25",
      metadata: fixtureMetadata("9781529081496", 272),
    },
  ];
  for (const entry of entries) {
    await db.insert(books).values({
      id: crypto.randomUUID(),
      ownerId: entry.owner,
      title: entry.title,
      status: entry.status,
      formatsJson: JSON.stringify(entry.formats),
      startedAt: entry.startedAt,
      finishedAt: "finishedAt" in entry ? entry.finishedAt : null,
      abandonedAt: "abandonedAt" in entry ? entry.abandonedAt : null,
      dateAdded: today,
      note: null,
      author: entry.author,
      metadataJson: JSON.stringify(entry.metadata),
      createdAt: today,
      updatedAt: today,
    });
  }
}

// Returns the Google Books thumbnail URL for a given ISBN-13 plus a
// minimal `toStoredMetadata`-shaped object so the seeded shelf renders
// with real covers. The URL format is documented at
// https://developers.google.com/books/docs/v1/using#RetrievingVolumeImages
function fixtureMetadata(isbn13: string, pageCount: number) {
  return {
    coverUrl: `https://books.google.com/books/content?vid=ISBN${isbn13}&printsec=frontcover&img=1&zoom=1`,
    isbn: isbn13,
    isbn13,
    pageCount,
    publisher: null,
    publishedDate: null,
    description: null,
  };
}

async function seedFriendship(ownerId: string, friendId: string) {
  const [reverse] = await db
    .select({ id: friendships.id })
    .from(friendships)
    .where(
      and(
        eq(friendships.requesterId, friendId),
        eq(friendships.addresseeId, ownerId),
      ),
    )
    .limit(1);
  if (reverse) {
    await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(eq(friendships.id, reverse.id));
    return;
  }
  await db.insert(friendships).values({
    id: crypto.randomUUID(),
    requesterId: ownerId,
    addresseeId: friendId,
    status: "accepted",
    createdAt: nowIso(),
  });
}

async function seedRecommendation(ownerId: string, friendId: string) {
  const today = nowIso();
  await db.insert(recommendations).values({
    id: crypto.randomUUID(),
    senderId: friendId,
    receiverId: ownerId,
    bookId: null,
    title: "Sea of Tranquility",
    author: "Emily St. John Mandel",
    formatsJson: JSON.stringify(["paperback"]),
    note: null,
    message: "You'd love this one — quiet and strange in the best way.",
    reply: null,
    replyAt: null,
    status: "pending",
    sentAt: today,
    seenAt: null,
    acceptedAt: null,
    dismissedAt: null,
  });
}

async function seedInviteLink(ownerId: string): Promise<string> {
  const existing = await db
    .select({ token: inviteLinks.token })
    .from(inviteLinks)
    .where(eq(inviteLinks.creatorId, ownerId))
    .limit(1);
  if (existing.length > 0) return existing[0].token;
  const token = crypto.randomUUID();
  await db.insert(inviteLinks).values({
    id: crypto.randomUUID(),
    creatorId: ownerId,
    token,
    usedAt: null,
    createdAt: nowIso(),
  });
  return token;
}

export async function GET() {
  const gate = assertCaptureMode();
  if (gate) return gate;

  const owner = await upsertUser({
    clerkId: FIXTURE_CLERK_ID,
    username: FIXTURE_USERNAME,
  });
  const friend = await upsertUser({
    clerkId: `${FIXTURE_CLERK_ID}_friend`,
    username: "fixturefriend",
  });

  const [ownerRow] = await db
    .select({ publicShelfToken: users.publicShelfToken })
    .from(users)
    .where(eq(users.id, owner.id))
    .limit(1);

  await resetFixtureState(owner.id, friend.id);
  await seedBooks(owner.id, friend.id);
  await seedFriendship(owner.id, friend.id);
  await seedRecommendation(owner.id, friend.id);
  const inviteToken = await seedInviteLink(owner.id);

  const payload: SeededFixture = {
    ownerClerkId: FIXTURE_CLERK_ID,
    ownerUsername: FIXTURE_USERNAME,
    ownerId: owner.id,
    friendClerkId: `${FIXTURE_CLERK_ID}_friend`,
    friendUsername: "fixturefriend",
    friendId: friend.id,
    publicShelfToken: ownerRow?.publicShelfToken ?? "",
    inviteToken,
  };

  return NextResponse.json(payload);
}
