import { auth } from "@clerk/nextjs/server";
import { AddBookButton } from "@/app/components/add-book-button";
import { BookList } from "@/app/components/book-list";
import { LandingPage } from "@/app/components/landing";
import { ShelfNav } from "@/app/components/shelf-nav";
import { ShareShelfPopover } from "@/app/components/share-shelf-popover";
import { LinkButton, PageSubtitle, PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { countBooksByStatus, listBooks } from "@/lib/books";
import { listAcceptedFriends } from "@/lib/friendships";
import { isBookStatus } from "@/lib/types";
import { getDictionaryForLocale } from "@/lib/i18n/server";

function captureModeActive(): boolean {
  return (
    process.env.NODE_ENV !== "production" && process.env.LANDING_CAPTURE === "1"
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; captureView?: string }>;
}) {
  const params = await searchParams;
  const forceLanding =
    captureModeActive() && params.captureView === "landing";
  const { userId } = forceLanding
    ? { userId: null }
    : captureModeActive()
    ? { userId: "fixture" }
    : await auth();
  const { dictionary, locale, t } = await getDictionaryForLocale();

  if (!userId) {
    return <LandingPage dictionary={dictionary} />;
  }

  const user = await requireAppUser();
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
          <ShareShelfPopover
            enabled={user.publicShelfEnabled}
            token={user.publicShelfToken}
            dictionary={dictionary}
          />
          <AddBookButton dictionary={dictionary} locale={locale} />
        </div>
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
