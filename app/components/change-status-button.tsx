"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { changeBookStatusAction } from "@/app/actions/books";
import { BOOK_STATUSES, getStatusLabel, type BookStatus } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, ErrorMessage, IconButton, Select, TextArea } from "./ui";

type Props = {
  bookId: string;
  currentStatus: BookStatus;
  dictionary: Dictionary;
  ariaLabel?: string;
};

type Step = "status" | "review";

export function ChangeStatusButton({ bookId, currentStatus, dictionary, ariaLabel }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("status");
  const [selectedStatus, setSelectedStatus] = useState<BookStatus>(currentStatus);
  const [note, setNote] = useState("");
  const [state, formAction, pending] = useActionState(changeBookStatusAction, {
    error: null as string | null,
    success: false as boolean,
  });

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
      router.refresh();
    }
  }, [state?.success, router]);

  function closeModal() {
    setOpen(false);
    setStep("status");
    setSelectedStatus(currentStatus);
    setNote("");
  }

  function handleOpen() {
    setStep("status");
    setSelectedStatus(currentStatus);
    setNote("");
    setOpen(true);
  }

  function handleStatusPrimary() {
    if (selectedStatus === "read" && currentStatus !== "read") {
      setStep("review");
      return;
    }
    const form = document.getElementById(`change-status-form-${bookId}`) as HTMLFormElement | null;
    form?.requestSubmit();
  }

  return (
    <div className="relative inline-block">
      {ariaLabel ? (
        <IconButton
          variant="secondary"
          onClick={handleOpen}
          aria-label={ariaLabel}
          title={dictionary.shelf.changeStatus}
          icon={<RefreshCw className="h-5 w-5" />}
        />
      ) : (
        <Button variant="secondary" onClick={handleOpen}>
          {dictionary.shelf.changeStatus}
        </Button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl">
            {step === "status" ? (
              <>
                <h3 className="text-base font-semibold text-zinc-900">{dictionary.shelf.changeStatus}</h3>

                <form
                  id={`change-status-form-${bookId}`}
                  action={formAction}
                  className="mt-4 space-y-4"
                >
                  <input type="hidden" name="id" value={bookId} />
                  <Select
                    name="status"
                    required
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as BookStatus)}
                  >
                    {BOOK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {getStatusLabel(dictionary, s)}
                      </option>
                    ))}
                  </Select>

                  {state.error ? <ErrorMessage>{translateError(dictionary, state.error)}</ErrorMessage> : null}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={closeModal}>
                      {dictionary.bookForm.cancel}
                    </Button>
                    <Button type="button" loading={pending} loadingText={dictionary.shelf.saving} onClick={handleStatusPrimary}>
                      {selectedStatus === "read" && currentStatus !== "read"
                        ? dictionary.shelf.continueToRead
                        : dictionary.shelf.save}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-zinc-900">{dictionary.shelf.reviewPromptTitle}</h3>
                <p className="mt-1 text-sm text-zinc-600">{dictionary.shelf.reviewPromptDescription}</p>

                <form action={formAction} className="mt-4 space-y-4">
                  <input type="hidden" name="id" value={bookId} />
                  <input type="hidden" name="status" value="read" />
                  <TextArea
                    name="note"
                    rows={4}
                    placeholder={dictionary.shelf.reviewPlaceholder}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />

                  {state.error ? <ErrorMessage>{translateError(dictionary, state.error)}</ErrorMessage> : null}

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setStep("status")}>
                      {dictionary.bookForm.cancel}
                    </Button>
                    <Button
                      type="submit"
                      name="skip"
                      value="1"
                      variant="secondary"
                      loading={pending}
                      loadingText={dictionary.shelf.saving}
                    >
                      {dictionary.shelf.skipReview}
                    </Button>
                    <Button type="submit" loading={pending} loadingText={dictionary.shelf.saving}>
                      {dictionary.shelf.saveWithReview}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
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
