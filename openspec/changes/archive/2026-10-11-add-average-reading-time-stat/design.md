## Context

The statistics page at `app/stats/page.tsx` renders two metric cards today — `booksFinished` and `pagesRead` — sourced from `getReadingStats()` in `lib/statistics.ts`. The function iterates `listBooks(ownerId, "read")` once, applies the period filter via `finishedAt` prefix matching, and accumulates counters. We are adding a third metric (average days to read) that fits naturally inside the same iteration loop, plus UI pieces that mirror the existing patterns.

Data we rely on: `BookRecord.startedAt` and `BookRecord.finishedAt` are ISO date strings (`YYYY-MM-DDTHH:mm:ss.sssZ`) already populated for many books by `computeDatesForStatus`. `metadata.pageCount` is already handled defensively by `pageCountOf()`; we need the same defensive style for date math.

## Goals / Non-Goals

**Goals:**
- Compute the new metric inside the existing `getReadingStats` loop with one additional pass — no second query to `listBooks`.
- Keep the public surface additive: `ReadingStats` gains new fields, no existing field semantics change.
- Match the UI conventions of the existing cards (grid layout, plural-aware i18n, amber warning style).

**Non-Goals:**
- Per-format breakdowns (audiobook vs paper etc.). The metric is global for the period.
- Median, distribution, or pace (pages/day). Mean days only.
- Schema changes — both dates are already on `BookRecord`.
- Storing the average — it's recomputed on each page load, like the rest.

## Decisions

### Decision 1: Compute in the same iteration as existing stats
The metric is added to the existing `for (const book of books)` loop in `getReadingStats`. We already pay for the iteration and the period filter; reusing it costs O(1) extra work per book.

**Alternative considered**: a separate function that queries `listBooks` again. Rejected — duplicated work and a second spot to maintain the period filter.

### Decision 2: Days computed as `floor((finishedMs - startedMs) / 86_400_000)` with a `startedMs < finishedMs` guard
Date strings are ISO; we parse with `new Date(...).getTime()` and subtract. Whole-day units match the page's existing number style (integers via `Intl.NumberFormat`). We guard with `startedMs < finishedMs` so equal-day and inverted-day spans are dropped — this matches the spec's exclusion rule and keeps the result robust to data oddities (re-reads, manual edits, bugs).

**Alternative considered**: `Math.ceil((finishedMs - startedMs) / 86_400_000)` so a "started in the evening, finished next morning" book rounds to 1 day instead of 0. Rejected — `Math.ceil` would cause same-day reads (`finishedMs === startedMs`) to round up to 1, and the spec excludes them. `Math.floor` is consistent with the spec.

**Alternative considered**: DST-safe counting via `Intl.DurationFormat`. Rejected for this iteration — overkill, locale-dependent, and the spec says "whole days, rounded to nearest integer", which `Math.round` of `(finishedMs - startedMs) / 86_400_000` gives. We'll use `Math.round`.

### Decision 3: `ReadingStats` extended, not replaced
Add two fields:
- `averageDaysToRead: number | null` — the rounded mean, or `null` when zero books qualify.
- `booksMissingStartDate: number` — count of finished books in period with non-null `finishedAt` and null `startedAt`.

Existing fields (`booksFinished`, `pagesRead`, `booksWithoutPageCount`) keep their meaning. The new `booksMissingStartDate` is named parallel to `booksWithoutPageCount` for symmetry — both are "books excluded from a metric for a missing data reason".

**Alternative considered**: making `averageDaysToRead` a `number` and using `0` or `-1` as a sentinel for "no data". Rejected — null is honest, the UI already branches on `booksFinished === 0`, and `null` survives a future refactor better than a magic number.

### Decision 4: Third card joins the same `sm:grid-cols-2` grid
The existing grid has two cards in a 2-column layout on `sm+` and stacks on mobile. Adding a third card makes the grid `sm:grid-cols-3` (responsive: 1 col on mobile, 3 on `sm+`). This is the path of least resistance — the `Card` component is shared.

**Alternative considered**: stacking the third card below in its own row. Rejected — three cards of similar visual weight naturally sit side-by-side, and the page already has a precedent of 3-column hero stats on the landing pages (worth a quick check at implementation time, but `sm:grid-cols-3` is the obvious Tailwind utility).

### Decision 5: Always-visible footnote; amber warning only when there's a delta
- The footnote describing the inclusion rule is **always visible** whenever the average card renders. It's documentation, not an alert.
- The amber warning is shown **only when `booksMissingStartDate > 0`** — parallel to how the existing `booksWithoutPageCount` warning works. Distinct visual language means "this is fixable" vs "this is how the metric works".

### Decision 6: New i18n keys with plural variants
Three keys in each locale file, following the existing pattern:
- `statistics.averageDaysToRead` (with `_plural`) — for the card label
- `statistics.averageFootnote` — for the documentation line under the card
- `statistics.missingStartDateWarning` (with `_plural`) — for the amber warning

The label uses `{days}` interpolation (different from the existing `count`-style labels), since the singular/plural decision is driven by the *count of days*, not the count of books. `createT(dictionary)` already supports `{key}` interpolation — we'll verify this at implementation time.

**Alternative considered**: reusing `booksFinished` / `pagesRead` patterns. Rejected — those keys are anchored on `{count}`, the new key needs `{days}`.

## Risks / Trade-offs

- **[Risk]** Many existing books have `finishedAt` but no `startedAt`, so the new metric may show "no qualifying books" for users whose data predates the start-date feature. → **Mitigation**: the empty state is already designed to handle this gracefully; the amber warning also surfaces the count, prompting the owner to add start dates.
- **[Risk]** Same-day reads (`startedAt === finishedAt`) won't contribute to the average, even though they are real "I finished this in a day" data points. → **Mitigation**: this is the explicit spec choice (defensive against data bugs); users with a high same-day-read rate will see the missing-start-date warning and can add `startedAt = finishedAt - 1` if they want it counted.
- **[Risk]** Re-reads with `startedAt` from the first read and `finishedAt` from the latest read will produce very large day spans that distort the mean. → **Mitigation**: acceptable for v1; the footnote explains the rule and the warning invites data fixes. Future iterations could split re-reads out.
- **[Risk]** `Math.round((finishedMs - startedMs) / 86_400_000)` can over- or under-count by up to one day for reads that span a DST boundary, because some calendar days are 23 or 25 hours long. → **Mitigation**: acceptable approximation; reads that span DST are rare and the off-by-one is invisible against typical week/month-scale spans.
- **[Trade-off]** Mean over median means a single outlier can swing the number noticeably. → Acceptable: matches the simplicity of the rest of the page, and the spec calls for the mean.

## Migration Plan

None. Pure additive change:
- No DB migration (no schema change).
- No feature flag needed (the page already handles the "no data" empty state).
- Rollback = revert the commits; the existing `booksFinished` and `pagesRead` paths are untouched.

## Open Questions

None — design is fully specified against the proposal and spec. Implementation can proceed.