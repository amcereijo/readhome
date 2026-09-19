"use client";

import { useEffect, useState, useTransition } from "react";
import { Copy, Link as LinkIcon, RotateCw, X } from "lucide-react";
import {
  disableShareAction,
  mintShareTokenAction,
  rotateShareTokenAction,
} from "@/app/actions/sharing";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Button, Card, cn } from "./ui";

type Props = {
  enabled: boolean;
  token: string | null;
  dictionary: Dictionary;
};

type Action = "idle" | "mint" | "rotate" | "disable";

export function ShareShelfPanel({ enabled, token, dictionary }: Props) {
  const [url, setUrl] = useState<string | null>(enabled && token ? `/share/${token}` : null);
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<Action>("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const runAction = (next: Exclude<Action, "idle">, work: () => Promise<{ url?: string } | void>) => {
    setAction(next);
    startTransition(async () => {
      const result = await work();
      if (next !== "disable" && result && "url" in result && result.url) {
        setUrl(result.url);
      } else if (next === "disable") {
        setUrl(null);
      }
      setAction("idle");
    });
  };

  const onCopy = async () => {
    if (!url) return;
    const absolute = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
    } catch {
      // Clipboard API unavailable; the link is still visible and selectable.
    }
  };

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <LinkIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
        <div>
          <h2 className="text-base font-semibold text-zinc-900">{dictionary.share.title}</h2>
          <p className="text-sm text-zinc-600">{dictionary.share.description}</p>
        </div>
      </div>

      {url ? (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {dictionary.share.linkLabel}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 break-all rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-teal-700 hover:border-zinc-300"
            >
              {url}
            </a>
            <Button
              type="button"
              variant="secondary"
              onClick={onCopy}
              loading={false}
              disabled={pending}
              className="shrink-0"
            >
              <Copy aria-hidden="true" className="h-4 w-4" />
              {copied ? dictionary.share.copied : dictionary.share.copyLink}
            </Button>
          </div>
          <p className="text-xs text-zinc-500">{dictionary.share.enabledNotice}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              loading={pending && action === "rotate"}
              loadingText={dictionary.share.rotating}
              disabled={pending}
              onClick={() => runAction("rotate", rotateShareTokenAction)}
            >
              <RotateCw aria-hidden="true" className="h-4 w-4" />
              {dictionary.share.rotate}
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={pending && action === "disable"}
              loadingText={dictionary.share.disabling}
              disabled={pending}
              onClick={() => runAction("disable", disableShareAction)}
            >
              <X aria-hidden="true" className="h-4 w-4" />
              {dictionary.share.disable}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <Button
            type="button"
            loading={pending && action === "mint"}
            loadingText={dictionary.share.creating}
            disabled={pending}
            onClick={() => runAction("mint", mintShareTokenAction)}
            className={cn(pending && action === "mint" && "opacity-100")}
          >
            {dictionary.share.create}
          </Button>
        </div>
      )}
    </Card>
  );
}
