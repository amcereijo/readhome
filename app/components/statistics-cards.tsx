import { Card } from "./ui";
import { PeriodSelector } from "./period-selector";
import { type ReadingPeriod, type ReadingStats } from "@/lib/statistics";
import { createT, type Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";

type Props = {
  dictionary: Dictionary;
  locale: Locale;
  stats: ReadingStats;
  period: ReadingPeriod;
  availableYears: number[];
};

function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value);
}

function monthNamesFor(locale: Locale): readonly string[] {
  const formatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", { month: "long" });
  return Array.from({ length: 12 }, (_, i) =>
    formatter.format(new Date(Date.UTC(2021, i, 1))),
  );
}

export function StatisticsCards({
  dictionary,
  locale,
  stats,
  period,
  availableYears,
}: Props) {
  const t = createT(dictionary);
  const monthLabels = monthNamesFor(locale);

  return (
    <div>
      <PeriodSelector
        year={period.year}
        month={period.month}
        availableYears={availableYears}
        yearLabel={dictionary.statistics.year}
        monthLabel={dictionary.statistics.month}
        allMonthsLabel={dictionary.statistics.allMonths}
        monthLabels={monthLabels}
      />

      {stats.booksFinished === 0 ? (
        <Card>
          <p className="text-sm text-zinc-500">{dictionary.statistics.empty}</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-zinc-500">
              {t("statistics.booksFinished", { count: stats.booksFinished })}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              {formatNumber(stats.booksFinished, locale)}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-zinc-500">
              {t("statistics.pagesRead", { count: stats.pagesRead })}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              {formatNumber(stats.pagesRead, locale)}
            </p>
          </Card>
          {stats.averageDaysToRead !== null ? (
            <Card>
              <p className="text-sm font-medium text-zinc-500">
                {t("statistics.averageDaysToRead", { days: stats.averageDaysToRead })}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
                {formatNumber(stats.averageDaysToRead, locale)}
              </p>
              <p className="mt-3 text-xs text-zinc-500">
                {dictionary.statistics.averageFootnote}
              </p>
            </Card>
          ) : null}
        </div>
      )}

      {stats.booksMissingStartDate > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("statistics.missingStartDateWarning", { count: stats.booksMissingStartDate })}
        </div>
      ) : null}

      {stats.booksWithoutPageCount > 0 ? (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t("statistics.warningWithCount", { count: stats.booksWithoutPageCount })}
        </div>
      ) : null}
    </div>
  );
}
