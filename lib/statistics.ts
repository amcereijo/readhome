import { listBooks } from "./books";
import type { BookRecord } from "./types";

export type ReadingPeriod = {
  year: number;
  month: number | null;
};

export type ReadingStats = {
  booksFinished: number;
  pagesRead: number;
  booksWithoutPageCount: number;
  averageDaysToRead: number | null;
  booksMissingStartDate: number;
};

export function currentYear(): number {
  return new Date().getUTCFullYear();
}

export function parsePeriod(
  searchParams: { year?: string; month?: string },
  fallbackYear: number = currentYear(),
): ReadingPeriod {
  const yearRaw = Number.parseInt(searchParams.year ?? "", 10);
  const year = Number.isInteger(yearRaw) ? yearRaw : fallbackYear;

  const monthRaw = Number.parseInt(searchParams.month ?? "", 10);
  const month =
    Number.isInteger(monthRaw) && monthRaw >= 1 && monthRaw <= 12 ? monthRaw : null;

  return { year, month };
}

function finishedInPeriod(book: BookRecord, period: ReadingPeriod): boolean {
  const finishedAt = book.finishedAt;
  if (!finishedAt) return false;
  const yearPrefix = String(period.year);
  if (period.month === null) {
    return finishedAt.startsWith(`${yearPrefix}-`);
  }
  const monthPrefix = `${yearPrefix}-${String(period.month).padStart(2, "0")}`;
  return finishedAt.startsWith(monthPrefix);
}

function pageCountOf(book: BookRecord): number | null {
  const raw = book.metadata.pageCount;
  if (typeof raw !== "number") return null;
  if (!Number.isFinite(raw)) return null;
  if (raw <= 0) return null;
  return raw;
}

export async function getReadingStats(
  ownerId: string,
  period: ReadingPeriod,
): Promise<ReadingStats> {
  const books = await listBooks(ownerId, "read");

  let booksFinished = 0;
  let pagesRead = 0;
  let booksWithoutPageCount = 0;
  let booksMissingStartDate = 0;
  const daySpans: number[] = [];

  for (const book of books) {
    if (!finishedInPeriod(book, period)) continue;
    booksFinished += 1;

    const pages = pageCountOf(book);
    if (pages === null) {
      booksWithoutPageCount += 1;
    } else {
      pagesRead += pages;
    }

    if (book.startedAt === null) {
      booksMissingStartDate += 1;
    } else {
      const startedMs = new Date(book.startedAt).getTime();
      const finishedMs = new Date(book.finishedAt as string).getTime();
      if (startedMs < finishedMs) {
        daySpans.push(Math.round((finishedMs - startedMs) / 86_400_000));
      }
    }
  }

  const averageDaysToRead =
    daySpans.length > 0
      ? Math.round(daySpans.reduce((sum, n) => sum + n, 0) / daySpans.length)
      : null;

  return {
    booksFinished,
    pagesRead,
    booksWithoutPageCount,
    averageDaysToRead,
    booksMissingStartDate,
  };
}

export async function listFinishedYears(ownerId: string): Promise<number[]> {
  const books = await listBooks(ownerId, "read");
  const years = new Set<number>();
  for (const book of books) {
    const finishedAt = book.finishedAt;
    if (!finishedAt) continue;
    const yearRaw = Number.parseInt(finishedAt.slice(0, 4), 10);
    if (Number.isInteger(yearRaw)) years.add(yearRaw);
  }
  years.add(currentYear());
  return [...years];
}
