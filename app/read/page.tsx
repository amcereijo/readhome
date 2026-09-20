import { AddBookButton } from "@/app/components/add-book-button";
import { BookList } from "@/app/components/book-list";
import { ShelfNav } from "@/app/components/shelf-nav";
import { PageTitle } from "@/app/components/ui";
import { requireAppUser } from "@/lib/auth";
import { countBooksByStatus, listBooks } from "@/lib/books";
import { listAcceptedFriends } from "@/lib/friendships";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function ReadPage() {
  const user = await requireAppUser();
  const { dictionary, locale, t } = await getDictionaryForLocale();
  const [books, counts, friends] = await Promise.all([
    listBooks(user.id, "read"),
    countBooksByStatus(user.id),
    listAcceptedFriends(user.id),
  ]);
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle>{t("status.read")}</PageTitle>
        <AddBookButton dictionary={dictionary} locale={locale} />
      </div>
      <ShelfNav
        basePath=""
        current="read"
        counts={counts}
        dictionary={dictionary}
      />
      <BookList books={books} editable dictionary={dictionary} locale={locale} recommendFriends={friends} />
    </div>
  );
}
