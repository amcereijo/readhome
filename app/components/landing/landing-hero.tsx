import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { LandingAsset } from "@/lib/landing/assets";
import { LinkButton } from "../ui";
import { LandingScreenshot } from "./landing-screenshot";
import { HERO_ACCENT } from "./accents";

type Props = {
  dictionary: Dictionary;
  asset?: LandingAsset;
};

export function LandingHero({ dictionary, asset }: Props) {
  const hero = dictionary.landing.hero;
  const accent = HERO_ACCENT;

  return (
    <section
      className={`relative isolate overflow-hidden ${accent.bg}`}
      aria-label={hero.title}
    >
      {/* Decorative blurred shapes */}
      <div
        aria-hidden="true"
        className="landing-drift-slow pointer-events-none absolute -left-24 -top-16 h-72 w-72 rounded-full bg-amber-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="landing-drift-fast pointer-events-none absolute -right-24 top-24 h-80 w-80 rounded-full bg-rose-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="landing-drift-slow pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-300/40 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-16 pt-20 sm:pb-20 sm:pt-28">
        <div
          className={`grid items-center gap-12 ${
            asset ? "md:grid-cols-2" : "md:grid-cols-1"
          }`}
        >
          <div className="flex flex-col items-start gap-6 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${accent.badge} ${accent.badgeText}`}
              >
                <span aria-hidden="true">{accent.emoji}</span>
                {hero.eyebrow}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200 backdrop-blur">
                <span aria-hidden="true">🇺🇸</span> EN
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200 backdrop-blur">
                <span aria-hidden="true">🇪🇸</span> ES
              </span>
            </div>

            <h1 className="bg-gradient-to-br from-zinc-900 via-rose-900 to-amber-900 bg-clip-text text-4xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-5xl md:text-6xl">
              {hero.title}
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-zinc-700 sm:text-lg">
              {hero.subtitle}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <LinkButton
                href="/sign-up"
                className="w-full !bg-gradient-to-r !from-teal-600 !to-emerald-600 !text-white shadow-lg shadow-emerald-600/20 hover:!from-teal-700 hover:!to-emerald-700 sm:w-auto"
              >
                <span aria-hidden="true" className="mr-1">
                  ✨
                </span>
                {hero.primaryCta}
              </LinkButton>
              <LinkButton
                href="/sign-in"
                variant="secondary"
                className="w-full !bg-white/80 backdrop-blur sm:w-auto"
              >
                {hero.secondaryCta}
              </LinkButton>
            </div>

            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-600">
              <div className="flex -space-x-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-base ring-2 ring-white">
                  📕
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-200 text-base ring-2 ring-white">
                  📗
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-200 text-base ring-2 ring-white">
                  📘
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-200 text-base ring-2 ring-white">
                  📙
                </span>
              </div>
              <span>{hero.socialProof}</span>
            </div>
          </div>

          {asset ? (
            <div className="order-first flex items-center justify-center md:order-last">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className={`absolute -inset-6 rounded-3xl blur-2xl ${accent.glow}`}
                />
                <div className="landing-float relative">
                  <LandingScreenshot
                    asset={asset}
                    priority
                    className="relative h-auto w-full rounded-2xl border border-white/60 bg-white shadow-2xl shadow-zinc-900/10 ring-1 ring-zinc-900/5"
                  />
                </div>
                {/* Floating accent chip */}
                <div className="landing-float absolute -right-6 -top-6 hidden rotate-6 rounded-2xl bg-white px-3 py-2 shadow-lg ring-1 ring-zinc-900/5 sm:block">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                    <span aria-hidden="true">⚡</span>
                    {hero.speedChip}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
