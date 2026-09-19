import { and, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { books } from "./db/schema";
import {
  type BookFormat,
  type BookRecord,
  type BookStatus,
  isBookFormat,
  isBookStatus,
} from "./types";

function nowIso() {
  return new Date().toISOString();
}

function todayYmd() {
  return nowIso().slice(0, 10);
}

export type DateOverrides = {
  startedAt: string | undefined | null;
  finishedAt: string | undefined | null;
  abandonedAt: string | undefined | null;
};

export function computeDatesForStatus(
  newStatus: BookStatus,
  oldStatus: BookStatus,
  today: string,
  currentStartedAt?: string | null,
): DateOverrides {
  if (newStatus === oldStatus) {
    return { startedAt: undefined, finishedAt: undefined, abandonedAt: undefined };
  }

  switch (newStatus) {
    case "read":
      return { startedAt: undefined, finishedAt: today, abandonedAt: null };
    case "reading":
      return { startedAt: currentStartedAt ?? today, finishedAt: null, abandonedAt: null };
    case "abandoned":
      return { startedAt: undefined, finishedAt: null, abandonedAt: today };
    case "to-read":
      return { startedAt: null, finishedAt: null, abandonedAt: null };
  }
}

export function computeNextNote(args: {
  newStatus: BookStatus;
  oldStatus: BookStatus;
  submittedNote: string;
  skipped: boolean;
  existingNote: string | null;
}): string | null {
  const { newStatus, oldStatus, submittedNote, skipped, existingNote } = args;
  const trimmed = submittedNote.trim();
  if (newStatus === "read" && oldStatus !== "read" && !skipped && trimmed.length > 0) {
    return trimmed;
  }
  return existingNote;
}

function parseFormats(raw: string): BookFormat[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is BookFormat => typeof value === "string" && isBookFormat(value));
  } catch {
    return [];
  }
}

function parseMetadata(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toBook(row: typeof books.$inferSelect): BookRecord {
  if (!isBookStatus(row.status)) {
    throw new Error("Invalid book status");
  }
  return {
    id: row.id,
    ownerId: row.ownerId,
    title: row.title,
    status: row.status,
    formats: parseFormats(row.formatsJson),
    startedAt: row.startedAt,
    finishedAt: row.finishedAt,
    abandonedAt: row.abandonedAt,
    dateAdded: row.dateAdded,
    note: row.note,
    author: row.author,
    metadata: parseMetadata(row.metadataJson),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function listBooks(ownerId: string, status?: BookStatus) {
  const rows = status
    ? await db
        .select()
        .from(books)
        .where(and(eq(books.ownerId, ownerId), eq(books.status, status)))
        .orderBy(desc(books.dateAdded))
    : await db
        .select()
        .from(books)
        .where(eq(books.ownerId, ownerId))
        .orderBy(desc(books.dateAdded));
  return rows.map(toBook);
}

export async function getBook(id: string) {
  const [row] = await db.select().from(books).where(eq(books.id, id)).limit(1);
  return row ? toBook(row) : null;
}

function extractCoverUrl(metadataJson: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(metadataJson);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  const raw = (parsed as Record<string, unknown>).coverUrl;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  return trimmed ? trimmed : null;
}

export async function listCoverUrlsByBookId(bookIds: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const unique = Array.from(new Set(bookIds.filter((id) => typeof id === "string" && id.length > 0)));
  if (unique.length === 0) return result;

  const rows = await db
    .select({ id: books.id, metadataJson: books.metadataJson })
    .from(books)
    .where(inArray(books.id, unique));

  for (const row of rows) {
    const coverUrl = extractCoverUrl(row.metadataJson);
    if (coverUrl) result.set(row.id, coverUrl);
  }

  return result;
}

export async function createBook(input: {
  ownerId: string;
  title: string;
  status: BookStatus;
  formats: BookFormat[];
  startedAt: string | null;
  finishedAt: string | null;
  abandonedAt: string | null;
  dateAdded?: string | null;
  note: string | null;
  author?: string | null;
  metadata?: Record<string, unknown>;
  oldStatus?: BookStatus;
}) {
  const timestamp = nowIso();
  const id = crypto.randomUUID();
  const oldStatus = input.oldStatus ?? "to-read";
  const dates = computeDatesForStatus(input.status, oldStatus, timestamp.slice(0, 10));
  await db.insert(books).values({
    id,
    ownerId: input.ownerId,
    title: input.title,
    status: input.status,
    formatsJson: JSON.stringify(input.formats),
    startedAt: dates.startedAt ?? null,
    finishedAt: dates.finishedAt ?? null,
    abandonedAt: dates.abandonedAt ?? null,
    dateAdded: input.dateAdded || timestamp.slice(0, 10),
    note: input.note,
    author: input.author,
    metadataJson: JSON.stringify(input.metadata ?? {}),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return id;
}

export async function updateBook(
  id: string,
  input: {
    title: string;
    status: BookStatus;
    formats: BookFormat[];
    startedAt: string | null;
    finishedAt: string | null;
    abandonedAt: string | null;
    dateAdded?: string | null;
    note: string | null;
    author?: string | null;
    metadata?: Record<string, unknown>;
    oldStatus?: BookStatus;
    currentStartedAt?: string | null;
  },
) {
  const oldStatus = input.oldStatus;
  let startedAt: string | null;
  let finishedAt: string | null;
  let abandonedAt: string | null;

  if (oldStatus !== undefined && oldStatus !== input.status) {
    const dates = computeDatesForStatus(input.status, oldStatus, todayYmd(), input.currentStartedAt);
    startedAt = dates.startedAt === undefined ? input.startedAt : dates.startedAt;
    finishedAt = dates.finishedAt === undefined ? input.finishedAt : dates.finishedAt;
    abandonedAt = dates.abandonedAt === undefined ? input.abandonedAt : dates.abandonedAt;
  } else {
    startedAt = input.startedAt;
    finishedAt = input.finishedAt;
    abandonedAt = input.abandonedAt;
  }

  await db
    .update(books)
    .set({
      title: input.title,
      status: input.status,
      formatsJson: JSON.stringify(input.formats),
      startedAt,
      finishedAt,
      abandonedAt,
      dateAdded: input.dateAdded,
      note: input.note,
      author: input.author,
      metadataJson: JSON.stringify(input.metadata ?? {}),
      updatedAt: nowIso(),
    })
    .where(eq(books.id, id));
}

export async function deleteBook(id: string) {
  await db.delete(books).where(eq(books.id, id));
}

export async function copyBook(
  sourceBookId: string,
  destinationOwnerId: string,
  status: BookStatus,
) {
  const source = await getBook(sourceBookId);
  if (!source) return null;

  const timestamp = nowIso();
  const id = crypto.randomUUID();
  const dates = computeDatesForStatus(status, "to-read", timestamp.slice(0, 10));
  await db.insert(books).values({
    id,
    ownerId: destinationOwnerId,
    title: source.title,
    status,
    formatsJson: JSON.stringify(source.formats),
    startedAt: dates.startedAt,
    finishedAt: dates.finishedAt,
    abandonedAt: dates.abandonedAt,
    dateAdded: timestamp.slice(0, 10),
    note: source.note,
    author: source.author,
    metadataJson: JSON.stringify({}),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return id;
}

export async function copyBookFromSnapshot(input: {
  ownerId: string;
  title: string;
  author: string | null;
  formats: BookFormat[];
  note: string | null;
  status: BookStatus;
}) {
  const timestamp = nowIso();
  const id = crypto.randomUUID();
  const dates = computeDatesForStatus(input.status, "to-read", timestamp.slice(0, 10));
  await db.insert(books).values({
    id,
    ownerId: input.ownerId,
    title: input.title,
    status: input.status,
    formatsJson: JSON.stringify(input.formats),
    startedAt: dates.startedAt,
    finishedAt: dates.finishedAt,
    abandonedAt: dates.abandonedAt,
    dateAdded: timestamp.slice(0, 10),
    note: input.note,
    author: input.author,
    metadataJson: JSON.stringify({}),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  return id;
}

export type BookCounts = { all: number } & Record<BookStatus, number>;

export async function countBooksByStatus(ownerId: string): Promise<BookCounts> {
  const rows = await db
    .select({ status: books.status, n: count() })
    .from(books)
    .where(eq(books.ownerId, ownerId))
    .groupBy(books.status);

  const counts: BookCounts = {
    all: 0,
    "to-read": 0,
    reading: 0,
    read: 0,
    abandoned: 0,
  };

  for (const row of rows) {
    if (isBookStatus(row.status)) {
      counts[row.status] = row.n;
      counts.all += row.n;
    }
  }

  return counts;
}
