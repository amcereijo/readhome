import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { LanguageToggle } from "./language-toggle";
import { SideNav } from "./side-nav";

const userButtonAppearance = {
  elements: {
    userButtonPopover: "right-2 sm:right-auto",
  },
} as const;

type NavHeaderProps = {
  locale: "en" | "es";
  unreadRecommendations: number;
  incomingPendingRequests: number;
};

export async function NavHeader({
  locale,
  unreadRecommendations,
  incomingPendingRequests,
}: NavHeaderProps) {
  const dictionary = getDictionary(locale);

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="relative mx-auto flex h-14 max-w-5xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
        <div className="flex shrink-0 items-center justify-start sm:w-56">
          <Show when="signed-in">
            <SideNav
              dictionary={dictionary}
              unreadRecommendations={unreadRecommendations}
              incomingPendingRequests={incomingPendingRequests}
            />
          </Show>
        </div>
        <Link
          href="/"
          className="pointer-events-auto min-w-0 flex-1 text-center text-2xl font-bold tracking-tight text-teal-800 hover:text-teal-900 sm:absolute sm:left-1/2 sm:flex-none sm:-translate-x-1/2 sm:text-3xl"
        >
          <span className="block truncate">{dictionary.meta.title}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-3 sm:ml-auto">
          <Show when="signed-in">
            <LanguageToggle />
            <UserButton appearance={userButtonAppearance} />
          </Show>
        </div>
      </div>
    </header>
  );
}
