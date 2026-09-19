import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { PublicShelfView } from "@/app/components/public-shelf-view";
import { getPublicShelfByToken } from "@/lib/users";
import { getDictionaryForLocale } from "@/lib/i18n/server";

export default async function PublicShelfPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const snapshot = await getPublicShelfByToken(token);
  if (!snapshot) notFound();

  const { userId } = await auth();
  const { dictionary, locale } = await getDictionaryForLocale();

  return (
    <PublicShelfView
      snapshot={snapshot}
      dictionary={dictionary}
      locale={locale}
      showSignUpCta={!userId}
    />
  );
}
