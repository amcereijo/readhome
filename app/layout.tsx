import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import { auth } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/users";
import { countUnreadReceived } from "@/lib/recommendations";
import { listIncomingPending } from "@/lib/friendships";
import { LocaleProvider } from "@/app/components/locale-provider";
import { NavHeader } from "@/app/components/nav-header";
import { SideNavDesktop } from "@/app/components/side-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  return {
    title: dictionary.meta.title,
    description: dictionary.meta.description,
    icons: {
      icon: "/icon.svg",
      shortcut: "/favicon.ico",
      apple: "/icon.svg",
    },
    manifest: "/manifest.json",
    themeColor: "#0f766e",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: dictionary.meta.title,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dictionary = getDictionary(locale);
  const { userId } = await auth();
  const { unreadRecommendations, incomingPendingRequests } = userId
    ? await (async () => {
        const { user } = await ensureUser(userId);
        const [unread, incoming] = await Promise.all([
          countUnreadReceived(user.id),
          listIncomingPending(user.id).then((rows) => rows.length),
        ]);
        return { unreadRecommendations: unread, incomingPendingRequests: incoming };
      })()
    : { unreadRecommendations: 0, incomingPendingRequests: 0 };

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-clip bg-zinc-50 text-zinc-900">
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            <NavHeader
              locale={locale}
              unreadRecommendations={unreadRecommendations}
              incomingPendingRequests={incomingPendingRequests}
            />
            <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-1">
              {userId ? (
                <SideNavDesktop
                  dictionary={dictionary}
                  unreadRecommendations={unreadRecommendations}
                  incomingPendingRequests={incomingPendingRequests}
                />
              ) : null}
              <main className="min-w-0 flex-1 px-3 py-6 sm:px-6 sm:py-8">{children}</main>
            </div>
          </ClerkProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
