import { LinkButton, PageSubtitle, PageTitle } from "@/app/components/ui";
import { createT, type Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import type { PublicShelfSnapshot } from "@/lib/users";
import { BOOK_STATUSES } from "@/lib/types";
import { PublicShelfInteractive } from "./public-shelf-interactive";

type Props = {
  snapshot: PublicShelfSnapshot;
  dictionary: Dictionary;
  locale: Locale;
  showSignUpCta: boolean;
};

export function PublicShelfView({ snapshot, dictionary, locale, showSignUpCta }: Props) {
  const { owner, books, counts } = snapshot;
  const t = createT(dictionary);
  const sections = BOOK_STATUSES.filter((status) => counts[status] > 0).map((status) => ({
    status,
    books: books.filter((book) => book.status === status),
  }));

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <PageTitle>{t("publicShelf.title", { username: owner.username })}</PageTitle>
          <PageSubtitle>{t("publicShelf.subtitle", { count: counts.all })}</PageSubtitle>
        </div>
      </div>

      {books.length === 0 ? (
        <p className="text-sm text-zinc-500">{dictionary.publicShelf.empty}</p>
      ) : (
        <PublicShelfInteractive sections={sections} dictionary={dictionary} locale={locale} />
      )}

      {showSignUpCta ? (
        <div className="mt-10 flex flex-col items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-6 py-5 text-center">
          <p className="text-sm font-medium text-teal-900">
            {dictionary.publicShelf.signUpPrompt}
          </p>
          <LinkButton href="/sign-up" variant="primary">
            {dictionary.publicShelf.signUpCta}
          </LinkButton>
        </div>
      ) : null}
    </div>
  );
}
