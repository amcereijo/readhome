"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { BOOK_FORMATS, BOOK_STATUSES, getStatusLabel, type BookFormat, type BookRecord, type BookStatus } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/locales";
import { Button, ErrorMessage, Input, Label, LinkButton, Select, TextArea } from "./ui";

function SubmitButton({ label, savingLabel }: { label: string; savingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} loadingText={savingLabel}>
      {label}
    </Button>
  );
}

type Props = {
  action: React.ComponentProps<"form">["action"];
  book?: BookRecord;
  error?: string | null;
  submitLabel: string;
  cancelHref?: string | null;
  dictionary: Dictionary;
  locale: Locale;
  titleValue?: string;
  onTitleChange?: (value: string) => void;
  authorValue?: string;
  onAuthorChange?: (value: string) => void;
  metadataValue?: string;
};

const defaultBook: BookRecord = {
  id: "",
  ownerId: "",
  title: "",
  author: null,
  status: "to-read" as BookStatus,
  formats: [],
  startedAt: null,
  finishedAt: null,
  abandonedAt: null,
  dateAdded: null,
  note: null,
  metadata: {},
  createdAt: "",
  updatedAt: "",
};

export function BookForm({
  action,
  book,
  error,
  submitLabel,
  cancelHref,
  dictionary,
  locale,
  titleValue,
  onTitleChange,
  authorValue,
  onAuthorChange,
  metadataValue,
}: Props) {
  const initial = book ?? defaultBook;
  const [titleInternal, setTitleInternal] = useState(initial.title);
  const [authorInternal, setAuthorInternal] = useState(initial.author ?? "");
  const [status, setStatus] = useState<BookStatus>(initial.status);
  const [formats, setFormats] = useState<BookFormat[]>(initial.formats);
  const [startedAt, setStartedAt] = useState(initial.startedAt ?? "");
  const [finishedAt, setFinishedAt] = useState(initial.finishedAt ?? "");
  const [abandonedAt, setAbandonedAt] = useState(initial.abandonedAt ?? "");
  const [note, setNote] = useState(initial.note ?? "");

  const titleControlled = titleValue !== undefined && onTitleChange !== undefined;
  const authorControlled = authorValue !== undefined && onAuthorChange !== undefined;
  const title = titleControlled ? (titleValue as string) : titleInternal;
  const author = authorControlled ? (authorValue as string) : authorInternal;

  function setTitle(value: string) {
    if (titleControlled) {
      onTitleChange?.(value);
    } else {
      setTitleInternal(value);
    }
  }

  function setAuthor(value: string) {
    if (authorControlled) {
      onAuthorChange?.(value);
    } else {
      setAuthorInternal(value);
    }
  }

  function reset() {
    setTitle(initial.title);
    setAuthor(initial.author ?? "");
    setStatus(initial.status);
    setFormats(initial.formats);
    setStartedAt(initial.startedAt ?? "");
    setFinishedAt(initial.finishedAt ?? "");
    setAbandonedAt(initial.abandonedAt ?? "");
    setNote(initial.note ?? "");
  }

  function toggleFormat(format: BookFormat) {
    setFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
    );
  }

  return (
    <form action={action} className="max-w-xl space-y-5">
      {book ? <input type="hidden" name="id" value={book.id} /> : null}
      <input type="hidden" name="formats" value={formats.join(",")} />
      {metadataValue !== undefined ? <input type="hidden" name="metadata" value={metadataValue} /> : null}
      <ErrorMessage>{error ? translateError(dictionary, error) : null}</ErrorMessage>

      <div>
        <Label htmlFor="title">{dictionary.bookForm.title}</Label>
        <Input id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="author">{dictionary.bookForm.author}</Label>
        <Input id="author" name="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="status">{dictionary.bookForm.status}</Label>
        <Select id="status" name="status" value={status} onChange={(e) => setStatus(e.target.value as BookStatus)}>
          {BOOK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {getStatusLabel(dictionary, s)}
            </option>
          ))}
        </Select>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-zinc-700">{dictionary.bookForm.formats}</legend>
        <div className="flex flex-wrap gap-3 text-sm text-zinc-700">
          {BOOK_FORMATS.map((format) => (
            <label key={format} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-zinc-200">
              <input
                type="checkbox"
                checked={formats.includes(format)}
                onChange={() => toggleFormat(format)}
                className="h-4 w-4 text-teal-700 focus:ring-teal-600"
              />
              {format}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="startedAt">{dictionary.bookForm.started}</Label>
          <Input id="startedAt" type="date" name="startedAt" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} lang={locale} />
        </div>
        <div>
          <Label htmlFor="finishedAt">{dictionary.bookForm.finished}</Label>
          <Input id="finishedAt" type="date" name="finishedAt" value={finishedAt} onChange={(e) => setFinishedAt(e.target.value)} lang={locale} />
        </div>
        <div>
          <Label htmlFor="abandonedAt">{dictionary.bookForm.abandoned}</Label>
          <Input id="abandonedAt" type="date" name="abandonedAt" value={abandonedAt} onChange={(e) => setAbandonedAt(e.target.value)} lang={locale} />
        </div>
      </div>

      <div>
        <Label htmlFor="note">{dictionary.bookForm.note}</Label>
        <TextArea id="note" name="note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} savingLabel={dictionary.shelf.saving} />
        {cancelHref ? (
          <LinkButton href={cancelHref} variant="secondary">
            {dictionary.bookForm.cancel}
          </LinkButton>
        ) : null}
        {book ? (
          <Button type="button" variant="secondary" onClick={reset}>
            {dictionary.bookForm.discardChanges}
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function translateError(dictionary: Dictionary, key: string): string {
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
