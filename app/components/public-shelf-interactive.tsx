"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { BookList } from "@/app/components/book-list";
import { createT, type Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import type { BookRecord } from "@/lib/types";
import { type BookStatus, getStatusLabel } from "@/lib/types";

type Section = {
  status: BookStatus;
  books: BookRecord[];
};

type Props = {
  sections: Section[];
  dictionary: Dictionary;
  locale: Locale;
};

function matches(book: BookRecord, needle: string): boolean {
  if (book.title.toLowerCase().includes(needle)) return true;
  if (book.author && book.author.toLowerCase().includes(needle)) return true;
  return false;
}

export function PublicShelfInteractive({ sections, dictionary, locale }: Props) {
  const t = createT(dictionary);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<BookStatus>>(() => new Set());

  const needle = query.trim().toLowerCase();
  const filteredSections = useMemo(() => {
    if (!needle) return sections;
    return sections.map((section) => ({
      status: section.status,
      books: section.books.filter((book) => matches(book, needle)),
    }));
  }, [sections, needle]);

  const totalAfterFilter = filteredSections.reduce((sum, section) => sum + section.books.length, 0);
  const showNoMatches = needle.length > 0 && totalAfterFilter === 0;

  const toggleCollapsed = (status: BookStatus) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dictionary.publicShelf.searchPlaceholder}
          aria-label={dictionary.publicShelf.searchLabel}
          className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
      </div>

      {showNoMatches ? (
        <p className="text-sm text-zinc-500">{dictionary.publicShelf.noMatches}</p>
      ) : null}

      <div className="space-y-8">
        {filteredSections.map((section) => {
          const isCollapsed = collapsed.has(section.status);
          const sectionLabel = getStatusLabel(dictionary, section.status);
          const ariaLabel = isCollapsed
            ? t("publicShelf.expandSectionAria", { status: sectionLabel })
            : t("publicShelf.collapseSectionAria", { status: sectionLabel });

          return (
            <section key={section.status} aria-labelledby={`section-${section.status}`}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2
                  id={`section-${section.status}`}
                  className="text-lg font-semibold text-zinc-900"
                >
                  <button
                    type="button"
                    onClick={() => toggleCollapsed(section.status)}
                    aria-expanded={!isCollapsed}
                    aria-label={ariaLabel}
                    className="inline-flex items-center gap-1.5 rounded text-left transition hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1"
                  >
                    {sectionLabel}
                    {isCollapsed ? (
                      <ChevronDown aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <ChevronUp aria-hidden="true" className="h-4 w-4" />
                    )}
                  </button>
                </h2>
                <p className="text-sm text-zinc-500">
                  {t("publicShelf.sectionCount", { count: section.books.length })}
                </p>
              </div>
              {isCollapsed || section.books.length === 0 ? null : (
                <BookList
                  books={section.books}
                  publicView
                  dictionary={dictionary}
                  locale={locale}
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
