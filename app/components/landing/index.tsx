import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getLandingAsset } from "@/lib/landing/assets";
import { LinkButton } from "../ui";
import { LandingFeatureSection, LandingFeatureSections } from "./landing-feature-section";
import { LandingHero } from "./landing-hero";

const FEATURE_ORDER = [
  "add-book",
  "shelf",
  "statuses",
  "statistics",
  "public-share",
  "friends",
  "friend-shelf",
  "recommendations",
  "goodreads-import",
] as const;

export function LandingPage({ dictionary }: { dictionary: Dictionary }) {
  const heroAsset = getLandingAsset("hero");
  const footer = dictionary.landing.footer;

  return (
    <div className="flex flex-col">
      <LandingHero dictionary={dictionary} asset={heroAsset} />
      <LandingFeatureSections>
        {FEATURE_ORDER.map((key, index) => {
          const headline = dictionary.landing.features[key]?.headline;
          const body = dictionary.landing.features[key]?.body;
          if (!headline || !body) return null;
          const asset = getLandingAsset(key);
          return (
            <LandingFeatureSection
              key={key}
              featureKey={key}
              headline={headline}
              body={body}
              asset={asset}
              imageSide={index % 2 === 0 ? "right" : "left"}
            />
          );
        })}
      </LandingFeatureSections>

      <footer className="relative isolate overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-amber-500 text-white">
        <div
          aria-hidden="true"
          className="landing-drift-slow pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-400/40 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="landing-drift-fast pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-sky-300/40 blur-3xl"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center">
          <span className="text-4xl" aria-hidden="true">🌈</span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {footer.title}
          </h2>
          <p className="max-w-xl text-base text-white/90 sm:text-lg">
            {footer.body}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LinkButton
              href="/sign-up"
              className="w-full !bg-white !text-emerald-700 shadow-lg hover:!bg-emerald-50 sm:w-auto"
            >
              <span aria-hidden="true" className="mr-1">✨</span>
              {footer.primaryCta}
            </LinkButton>
            <LinkButton
              href="/sign-in"
              variant="ghost"
              className="w-full text-white hover:bg-white/10 sm:w-auto"
            >
              {footer.secondaryCta}
            </LinkButton>
          </div>
          <p className="mt-4 text-xs text-white/70">{dictionary.landing.tagline}</p>
        </div>
      </footer>
    </div>
  );
}
