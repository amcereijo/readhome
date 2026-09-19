"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireAppUser } from "@/lib/auth";
import {
  disablePublicShelf,
  mintPublicShelfToken,
  rotatePublicShelfToken,
} from "@/lib/users";

async function buildShareUrl(token: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}/share/${token}` : `/share/${token}`;
}

export async function mintShareTokenAction(): Promise<{ url: string }> {
  const user = await requireAppUser();
  const token = await mintPublicShelfToken(user.id);
  const url = await buildShareUrl(token);
  revalidatePath("/");
  return { url };
}

export async function rotateShareTokenAction(): Promise<{ url: string }> {
  const user = await requireAppUser();
  const token = await rotatePublicShelfToken(user.id);
  const url = await buildShareUrl(token);
  revalidatePath("/");
  return { url };
}

export async function disableShareAction(): Promise<void> {
  const user = await requireAppUser();
  await disablePublicShelf(user.id);
  revalidatePath("/");
}
