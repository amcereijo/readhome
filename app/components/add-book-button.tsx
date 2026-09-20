"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { Button } from "./ui";
import { CreateBookForm } from "./create-book-form";

type Props = {
  dictionary: Dictionary;
  locale: Locale;
};

export function AddBookButton({ dictionary, locale }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function close() {
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
        {dictionary.shelf.addBook}
      </Button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-book-title"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="add-book-title" className="text-lg font-semibold text-zinc-900">
                  {dictionary.newBook.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600">{dictionary.newBook.subtitle}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={close}
                aria-label={dictionary.bookForm.cancel}
              >
                ×
              </Button>
            </div>
            <CreateBookForm
              dictionary={dictionary}
              locale={locale}
              onSuccess={close}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
