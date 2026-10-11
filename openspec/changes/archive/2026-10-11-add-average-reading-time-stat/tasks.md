## 1. i18n

- [x] 1.1 Add `averageDaysToRead` (with `_plural`), `averageFootnote`, and `missingStartDateWarning` (with `_plural`) under `statistics` in `lib/i18n/en.json`
- [x] 1.2 Add the same three keys under `statistics` in `lib/i18n/es.json`

## 2. Statistics computation

- [x] 2.1 Extend the `ReadingStats` type in `lib/statistics.ts` with `averageDaysToRead: number | null` and `booksMissingStartDate: number`
- [x] 2.2 Inside `getReadingStats`, accumulate `daySpans: number[]` and `booksMissingStartDate` while iterating the existing book loop, parsing `startedAt` and `finishedAt` with `new Date(...).getTime()`, dropping entries where either is null or `startedMs >= finishedMs`, and computing the rounded mean with `Math.round(...) / 86_400_000`
- [x] 2.3 Return `averageDaysToRead` as `Math.round(mean(spans))` when `spans.length > 0`, otherwise `null`; return `booksMissingStartDate` as the count of finished books in the period with non-null `finishedAt` and null `startedAt`

## 3. UI

- [x] 3.1 In `app/components/statistics-cards.tsx`, change the existing `sm:grid-cols-2` grid to `sm:grid-cols-3` and add a third card that renders `averageDaysToRead` only when it is not `null`
- [x] 3.2 Add a localized footnote paragraph under the new card using the new `averageFootnote` key, rendered whenever the card is rendered
- [x] 3.3 Add a parallel amber warning (matching the existing `booksWithoutPageCount` style) that shows only when `booksMissingStartDate > 0`, using the new `missingStartDateWarning` key
- [x] 3.4 Confirm the existing empty state (`booksFinished === 0`) still hides all three cards correctly; verify the new card stays hidden when `booksFinished > 0` but `averageDaysToRead === null`

## 4. Verify

- [x] 4.1 `npm run lint` passes with no new errors
- [x] 4.2 `npm run build` passes
- [x] 4.3 Manual smoke at `/stats` for a period with several finished books that all have both dates: average renders as a whole number, footnote shows, no amber warning
- [x] 4.4 Manual smoke for a finished book missing `startedAt`: amber missing-start-date warning appears with the correct count, and the average either reflects only the books with both dates or hides if zero qualify
- [x] 4.5 Manual smoke for a period with zero qualifying books (or all finished books in the period missing start dates): the average card and footnote are hidden, empty-state card is the sole message
- [x] 4.6 Visual check at 360px and 1280px viewport widths: three cards stack on mobile and lay out in one row on `sm+`, no horizontal scroll