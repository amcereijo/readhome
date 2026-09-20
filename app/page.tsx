import { auth } from "@clerk/nextjs/server";
import { BookList } from "@/app/components/book-list";
import { LandingPage } from "@/app/components/landing-page";
import { ShelfNav } from "@/app/components/shelf-nav";
import { ShareShelfPanel } from "@/app/components/share-shelf-panel";
import { LinkButton, PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { countBooksByStatus, listBooks } from "@/lib/books";
import { listAcceptedFriends } from "@/lib/friendships";
import { isBookStatus } from "@/lib/types";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { userId } = await auth();
  const { dictionary, locale, t } = await getDictionaryForLocale();

  if (!userId) {
    return <LandingPage dictionary={dictionary} />;
  }

  const user = await requireAppUser();
  const params = await searchParams;
  const status = params.status && isBookStatus(params.status) ? params.status : undefined;
  const [books, counts, friends] = await Promise.all([
    listBooks(user.id, status),
    countBooksByStatus(user.id),
    listAcceptedFriends(user.id),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageTitle>{t("shelf.yourShelf")}</PageTitle>
          <PageSubtitle>{t("shelf.booksCount", { count: books.length })}</PageSubtitle>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/books/import" variant="secondary">
            {t("shelf.import")}
          </LinkButton>
          <LinkButton
            href="#share-shelf"
            variant="secondary"
            title={t("share.buttonTooltip")}
          >
            {t("share.buttonLabel")}
          </LinkButton>
          <LinkButton href="/books/new">{t("shelf.addBook")}</LinkButton>
        </div>
      </div>

      <div id="share-shelf" className="mb-6">
        <ShareShelfPanel
          enabled={user.publicShelfEnabled}
          token={user.publicShelfToken}
          dictionary={dictionary}
        />
      </div>

      <ShelfNav
        basePath=""
        current={status ?? "all"}
        counts={counts}
        dictionary={dictionary}
      />

      <BookList books={books} editable dictionary={dictionary} locale={locale} recommendFriends={friends} />
    </div>
  );
}
