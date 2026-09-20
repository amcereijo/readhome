"use client";

import { useEffect, useState } from "react";
import { ShareShelfPanel } from "./share-shelf-panel";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Props = {
  enabled: boolean;
  token: string | null;
  dictionary: Dictionary;
};

export function ShareShelfPopover({ enabled, token, dictionary }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const ariaLabel = enabled
    ? `${dictionary.share.buttonLabel} — ${dictionary.share.indicatorLabel}`
    : dictionary.share.buttonLabel;

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        title={dictionary.share.buttonTooltip}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-200 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-1"
      >
        {dictionary.share.buttonLabel}
        {enabled ? (
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-teal-700"
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dictionary.share.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-xl">
            <ShareShelfPanel enabled={enabled} token={token} dictionary={dictionary} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
