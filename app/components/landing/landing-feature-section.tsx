import type { ReactNode } from "react";
import { cn } from "../ui";
import type { LandingAsset } from "@/lib/landing/assets";
import { LandingScreenshot } from "./landing-screenshot";
import { accentFor } from "./accents";

type Props = {
  featureKey: string;
  headline: string;
  body: string;
  asset?: LandingAsset;
  imageSide?: "left" | "right";
};

export function LandingFeatureSection({
  featureKey,
  headline,
  body,
  asset,
  imageSide = "right",
}: Props) {
  const accent = accentFor(featureKey);

  const copyColumn = (
    <div className="flex flex-col items-start gap-3">
      <span
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-2xl text-xl ring-1 ring-inset shadow-sm",
          accent.badge,
          accent.badgeText,
          accent.ring,
        )}
        aria-hidden="true"
      >
        {accent.emoji}
      </span>
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
        {headline}
      </h2>
      <p className="max-w-md text-base leading-relaxed text-zinc-700">{body}</p>
    </div>
  );

  const imageColumn = asset ? (
    <div className="flex items-center justify-center">
      <div className="relative">
        <div
          aria-hidden="true"
          className={cn(
            "absolute -inset-6 rounded-3xl blur-2xl",
            accent.glow,
          )}
        />
        <div className="landing-float relative">
          <LandingScreenshot
            asset={asset}
            priority
            className="relative h-auto w-full rounded-2xl border border-white/70 bg-white shadow-xl shadow-zinc-900/10 ring-1 ring-zinc-900/5"
          />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-y border-white/60",
        accent.bg,
      )}
      aria-label={headline}
    >
      {/* Decorative blurred shapes per section */}
      <div
        aria-hidden="true"
        className={cn(
          "landing-drift-slow pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full blur-3xl",
          accent.glow,
        )}
      />
      <div
        aria-hidden="true"
        className={cn(
          "landing-drift-fast pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full blur-3xl opacity-60",
          accent.glow,
        )}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-20">
        <div
          className={cn(
            "grid items-center gap-10 md:gap-16",
            imageColumn ? "md:grid-cols-2" : "md:grid-cols-1",
            imageSide === "left" ? "md:[&>div:first-child]:order-2" : null,
          )}
        >
          {imageSide === "left" ? (
            <>
              {imageColumn}
              {copyColumn}
            </>
          ) : (
            <>
              {copyColumn}
              {imageColumn}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function LandingFeatureSections({ children }: { children: ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}
