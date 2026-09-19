import { eq } from "drizzle-orm";
import { computeNextNote, createBook, deleteBook, getBook, updateBook } from "../lib/books";
import { db } from "../lib/db";
import { users } from "../lib/db/schema";

function assertEqual<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function unitTests() {
  // Move to read with text → note is the submitted text.
  assertEqual(
    computeNextNote({
      newStatus: "read",
      oldStatus: "reading",
      submittedNote:  "loved it",
      skipped: false,
      existingNote: null,
    }),
    "loved it",
    "move to read + text",
  );

  // Move to read with empty text → note preserved (existing kept).
  assertEqual(
    computeNextNote({
      newStatus: "read",
      oldStatus: "reading",
      submittedNote:  "   ",
      skipped: false,
      existingNote: "old thought",
    }),
    "old thought",
    "move to read + empty text preserves note",
  );

  // Move to read with skip → note preserved even if text was typed.
  assertEqual(
    computeNextNote({
      newStatus: "read",
      oldStatus: "reading",
      submittedNote:  "should not save",
      skipped: true,
      existingNote: null,
    }),
    null,
    "move to read + skip preserves null note",
  );

  // Move away from read → submitted note is ignored, existing kept.
  assertEqual(
    computeNextNote({
      newStatus: "to-read",
      oldStatus: "read",
      submittedNote:  "should not save",
      skipped: false,
      existingNote: "kept thought",
    }),
    "kept thought",
    "non-read target ignores submitted note",
  );

  // Re-saving read → read → submitted note ignored, existing kept.
  assertEqual(
    computeNextNote({
      newStatus: "read",
      oldStatus: "read",
      submittedNote:  "should not save",
      skipped: false,
      existingNote: "kept thought",
    }),
    "kept thought",
    "same status ignores submitted note",
  );

  // Move to read with text and no existing note → note is the submitted text.
  assertEqual(
    computeNextNote({
      newStatus: "read",
      oldStatus: "reading",
      submittedNote:  "fresh review",
      skipped: false,
      existingNote: null,
    }),
    "fresh review",
    "move to read + text + no existing",
  );
}

async function endToEnd() {
  const owner = {
    id: crypto.randomUUID(),
    clerkId: `clerk_${crypto.randomUUID()}`,
    username: `review_${Date.now()}`,
    pendingInviteToken: null,
    createdAt: new Date().toISOString(),
  };
  await db.insert(users).values(owner);

  const bookId = await createBook({
    ownerId: owner.id,
    title: "Test Book",
    author: null,
    status: "reading",
    formats: [],
    startedAt: null,
    finishedAt: null,
    abandonedAt: null,
    note: null,
  });

  let bookId2: string | null = null;

  try {
    const created = await getBook(bookId);
    if (!created) throw new Error("book not created");

    // Scenario: move to read with a review.
    const withReview = computeNextNote({
      newStatus: "read",
      oldStatus: created.status,
      submittedNote: "loved it",
      skipped: false,
      existingNote: created.note,
    });
    await updateBook(bookId, {
      title: created.title,
      status: "read",
      formats: created.formats,
      startedAt: created.startedAt,
      finishedAt: created.finishedAt,
      abandonedAt: created.abandonedAt,
      note: withReview,
      author: created.author,
      metadata: created.metadata,
      oldStatus: created.status,
      currentStartedAt: created.startedAt,
    });
    const moved = await getBook(bookId);
    if (!moved) throw new Error("book missing after update");
    assertEqual(moved.status, "read", "e2e: status is read");
    assertEqual(moved.note, "loved it", "e2e: note persisted");

    // Scenario: move a fresh reading book to read with skip (no note change).
    bookId2 = await createBook({
      ownerId: owner.id,
      title: "Skip Book",
      author: null,
      status: "reading",
      formats: [],
      startedAt: null,
      finishedAt: null,
      abandonedAt: null,
      note: "pre-existing",
    });
    const created2 = await getBook(bookId2);
    if (!created2) throw new Error("book2 not created");
    const skipped = computeNextNote({
      newStatus: "read",
      oldStatus: created2.status,
      submittedNote: "should not save",
      skipped: true,
      existingNote: created2.note,
    });
    await updateBook(bookId2, {
      title: created2.title,
      status: "read",
      formats: created2.formats,
      startedAt: created2.startedAt,
      finishedAt: created2.finishedAt,
      abandonedAt: created2.abandonedAt,
      note: skipped,
      author: created2.author,
      metadata: created2.metadata,
      oldStatus: created2.status,
      currentStartedAt: created2.startedAt,
    });
    const moved2 = await getBook(bookId2);
    if (!moved2) throw new Error("book2 missing after update");
    assertEqual(moved2.status, "read", "e2e skip: status is read");
    assertEqual(moved2.note, "pre-existing", "e2e skip: note preserved");
  } finally {
    await deleteBook(bookId);
    if (bookId2) await deleteBook(bookId2);
    await db.delete(users).where(eq(users.id, owner.id));
  }
}

async function main() {
  unitTests();
  await endToEnd();
  console.log("smoke-review-prompt ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
