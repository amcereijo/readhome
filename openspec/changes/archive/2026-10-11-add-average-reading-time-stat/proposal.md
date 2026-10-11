## Why

The statistics page currently reports how many books the owner finished and how many pages they read in a period, but it does not tell the owner *how long* those books took them. Adding a single "average time to read a book" card — measured from start date to finish date — gives a more intuitive sense of reading pace than pages-per-day and matches what readers ask themselves most often about their habit.

## What Changes

- Add an **average days to read a book** metric to the statistics page, computed from `finishedAt - startedAt` across finished books in the selected period that have both dates.
- Add a **footnote** under the new card explaining the inclusion rule (both dates required, non-positive spans excluded) so the average is interpretable when it disagrees with the books-finished count.
- Add a **warning** mirroring the existing missing-page-count pattern: when at least one finished book in the period lacks a `startedAt`, surface the count and invite the owner to add start dates.
- Extend the empty state so the new card is hidden when zero books qualify (instead of showing "0 days").
- Add localized strings for the new label, footnote, and warning in both English and Spanish.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `book-statistics`: Add requirements covering (i) the average-days-to-read metric, (ii) the footnote describing the inclusion rule, (iii) the warning when finished books are missing a `startedAt`, and (iv) the extended empty state for the new card.

## Impact

- `lib/statistics.ts` — extend `ReadingStats` and `getReadingStats` to compute the new metric and the count of qualifying books. Pure addition; no signature change for existing callers.
- `app/components/statistics-cards.tsx` — render a third card, the footnote, and a parallel amber warning when applicable.
- `lib/i18n/en.json` / `lib/i18n/es.json` — three new keys each (label with plural variants, footnote copy, warning copy).
- No schema migration, no API change, no new dependency.