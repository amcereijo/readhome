"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createBookAction } from "@/app/actions/books";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import type { NormalizedVolume } from "@/lib/google-books";
import { toStoredMetadata } from "@/lib/google-books";
import { BookForm } from "./book-form";
import { BookSearch } from "./book-search";
import { BarcodeScannerButton } from "./barcode-scanner";

type Props = {
  dictionary: Dictionary;
  locale: Locale;
  onSuccess?: () => void;
};

export function CreateBookForm({ dictionary, locale, onSuccess }: Props) {
  const [state, action] = useActionState(createBookAction, {
    error: null as string | null,
    success: false as boolean,
  });
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [metadataJson, setMetadataJson] = useState("");
  const previousSuccess = useRef(false);

  useEffect(() => {
    if (state?.success && !previousSuccess.current) {
      previousSuccess.current = true;
      onSuccess?.();
    }
  }, [state?.success, onSuccess]);

  function handleSelect(volume: NormalizedVolume) {
    setTitle(volume.title);
    setAuthor(volume.authors.join(", "));
    setMetadataJson(JSON.stringify(toStoredMetadata(volume)));
  }

  return (
    <div className="space-y-6">
      <BookSearch locale={locale} dictionary={dictionary} onSelect={handleSelect} />
      <BarcodeScannerButton locale={locale} dictionary={dictionary} onSelect={handleSelect} />
      <BookForm
        action={action}
        error={state?.error ? translateError(dictionary, state.error) : null}
        submitLabel={dictionary.shelf.addBook}
        cancelHref={null}
        dictionary={dictionary}
        locale={locale}
        titleValue={title}
        onTitleChange={setTitle}
        authorValue={author}
        onAuthorChange={setAuthor}
        metadataValue={metadataJson}
      />
    </div>
  );
}

function translateError(dictionary: Dictionary, key: string): string {
  const value = dictionary[key as keyof Dictionary] as string | undefined;
  if (value) return value;
  const parts = key.split(".");
  let current: unknown = dictionary;
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}
