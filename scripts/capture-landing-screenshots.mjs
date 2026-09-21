#!/usr/bin/env node
// Capture landing-page screenshots and short animations.
//
// Run with: npm run landing.capture
//
// Requires:
//   - the dev server running with LANDING_CAPTURE=1 in the environment, OR
//     this script will boot `next dev` for you.
//   - @playwright/test installed in node_modules.
//   - `npx playwright install chromium` to have run once.
//
// Refuses to run when production-shaped env vars are present
// (TURSO_PRODUCTION_URL or NEXT_PUBLIC_APP_URL pointing at the deployed domain).

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { chromium } from "@playwright/test";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "public", "landing");
const MANIFEST_PATH = path.join(OUTPUT_DIR, "manifest.json");

const BASE_URL = process.env.LANDING_BASE_URL ?? "http://localhost:3000";

const DESKTOP = { width: 1280, height: 800 };
const MOBILE = { width: 390, height: 844 };

function assertSafeEnvironment() {
  const prodUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (prodUrl.includes("vercel.app") || prodUrl.includes("thereadingplace.com")) {
    throw new Error(
      `Refusing to capture: NEXT_PUBLIC_APP_URL=${prodUrl} looks like production`,
    );
  }
  if (process.env.TURSO_PRODUCTION_URL) {
    throw new Error(
      "Refusing to capture: TURSO_PRODUCTION_URL is set (production-shaped)",
    );
  }
}

async function startDevServerIfNeeded() {
  if (process.env.LANDING_BASE_URL) return null;
  if (process.env.LANDING_SKIP_DEV !== "1" && !await isServerUp(BASE_URL)) {
    console.log("Starting next dev with LANDING_CAPTURE=1...");
    const child = spawn("npx", ["next", "dev"], {
      env: { ...process.env, LANDING_CAPTURE: "1" },
      stdio: "inherit",
    });
    await waitForServer(BASE_URL);
    return child;
  }
  return null;
}

async function isServerUp(url) {
  try {
    const res = await fetch(url, { method: "GET" });
    return res.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(url, timeoutMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerUp(url)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

async function seedFixture() {
  const response = await fetch(`${BASE_URL}/dev/landing-fixture`, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Fixture seed failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

const SCREENSHOTS = [
  {
    feature: "hero",
    route: "/",
    viewport: DESKTOP,
    type: "image",
    alt: "Your personal reading shelf, in grid view",
    waitFor: "body",
    toggleGrid: true,
  },
  {
    feature: "shelf",
    route: "/",
    viewport: DESKTOP,
    type: "image",
    alt: "The personal book shelf",
    waitFor: "body",
    toggleGrid: true,
  },
  {
    feature: "add-book",
    route: "/",
    viewport: MOBILE,
    type: "image",
    alt: "Add a book in seconds — search by title or scan a barcode",
    waitFor: "body",
    openAddBook: true,
    cropToDialog: true,
  },
  {
    feature: "statistics",
    route: "/stats",
    viewport: DESKTOP,
    type: "image",
    alt: "Reading statistics",
    waitFor: "body",
  },
  {
    feature: "statuses",
    route: "/",
    viewport: DESKTOP,
    type: "image",
    alt: "Change a book's status — start and finish dates are stamped for you",
    waitFor: "body",
    toggleList: true,
    openChangeStatus: true,
  },
  {
    feature: "friends",
    route: "/friends",
    viewport: DESKTOP,
    type: "image",
    alt: "Friends management",
    waitFor: "body",
  },
  {
    feature: "recommendations",
    route: "/recommendations",
    viewport: DESKTOP,
    type: "image",
    alt: "Book recommendations",
    waitFor: "body",
  },
  {
    feature: "goodreads-import",
    route: "/books/import",
    viewport: DESKTOP,
    type: "image",
    alt: "Import your Goodreads library via CSV",
    waitFor: "body",
  },
];

async function captureStills(browser, fixture) {
  const context = await browser.newContext({
    viewport: DESKTOP,
    deviceScaleFactor: 2,
  });
  await context.addInitScript(() => {
    try {
      localStorage.setItem("shelf.viewMode", "grid");
    } catch {}
  });
  const page = await context.newPage();
  const manifest = [];

  for (const shot of SCREENSHOTS) {
    const url = `${BASE_URL}${shot.route}`;
    await page.setViewportSize(shot.viewport);
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForSelector(shot.waitFor, { timeout: 15000 });
    await page.waitForTimeout(2200);
    if (shot.toggleGrid) {
      // Make sure the shelf is in grid mode for a colourful capture.
      const gridBtn = page.getByRole("button", { name: /Switch to grid view/i });
      if ((await gridBtn.count()) > 0) {
        const pressed = await gridBtn.first().getAttribute("aria-pressed");
        if (pressed !== "true") {
          await gridBtn.first().click({ force: true });
          await page.waitForTimeout(1500);
        }
      }
    }
    if (shot.toggleList) {
      // Switch to list view (statuses capture needs the row actions).
      const listBtn = page.getByRole("button", { name: /Switch to list view/i });
      if ((await listBtn.count()) > 0) {
        const pressed = await listBtn.first().getAttribute("aria-pressed");
        if (pressed !== "true") {
          await listBtn.first().click({ force: true });
          await page.waitForTimeout(1500);
        }
      }
    }
    if (shot.openChangeStatus) {
      // Open the change-status modal on a "reading" book so the Started date
      // and the status options are both visible.
      const statusBtn = page.getByRole("button", { name: /Change status/i }).first();
      if ((await statusBtn.count()) > 0) {
        await statusBtn.click({ force: true });
        await page.waitForTimeout(800);
      }
    }
    if (shot.openAddBook) {
      // Open the Add book dialog so both the title search and the barcode
      // button are visible in the same shot.
      const addBtn = page.getByRole("button", { name: /^Add book$/i }).first();
      if ((await addBtn.count()) > 0) {
        await addBtn.click({ force: true });
        await page.waitForTimeout(900);
      }
    }
    const filename = `feature-${shot.feature}.png`;
    const filepath = path.join(OUTPUT_DIR, filename);
    if (shot.cropToDialog) {
      // Capture the full viewport then crop to a tight box around the dialog
      // content (skipping the backdrop and everything below the form top) so
      // the resulting image is compact and focused on the add paths.
      const fullPath = filepath.replace(/\.png$/, ".full.png");
      await page.screenshot({ path: fullPath, fullPage: false });
      const inner = await page
        .locator('div[role="dialog"] > div')
        .first()
        .boundingBox();
      const meta = await sharp(fullPath).metadata();
      const scale = meta.width / shot.viewport.width;
      const padX = 24;
      const padTop = 24;
      const bottomCap = 560;
      const left = Math.max(0, Math.round(inner.x * scale) - padX);
      const top = Math.max(0, Math.round(inner.y * scale) - padTop);
      const right = Math.min(
        meta.width,
        Math.round((inner.x + inner.width) * scale) + padX,
      );
      const bottom = Math.min(
        meta.height,
        Math.round((inner.y + bottomCap) * scale),
      );
      await sharp(fullPath)
        .extract({ left, top, width: right - left, height: bottom - top })
        .toFile(filepath);
      await fs.unlink(fullPath);
    } else {
      await page.screenshot({ path: filepath, fullPage: false });
    }
    manifest.push({
      feature: shot.feature,
      route: shot.route,
      viewport: shot.viewport,
      type: shot.type,
      src: `/landing/${filename}`,
      alt: shot.alt,
    });
    console.log(`captured ${filename}`);
  }

  const friendUrl = `${BASE_URL}/u/${fixture.friendUsername}`;
  await page.setViewportSize(DESKTOP);
  await page.goto(friendUrl, { waitUntil: "networkidle" });
  await page.waitForSelector("body");
  await page.waitForTimeout(400);
  const friendFilename = "feature-friend-shelf.png";
  await page.screenshot({ path: path.join(OUTPUT_DIR, friendFilename) });
  manifest.push({
    feature: "friend-shelf",
    route: `/u/${fixture.friendUsername}`,
    viewport: DESKTOP,
    type: "image",
    src: `/landing/${friendFilename}`,
    alt: "Browsing a friend's shelf",
  });
  console.log(`captured ${friendFilename}`);

  if (fixture.publicShelfToken) {
    const shareUrl = `${BASE_URL}/share/${fixture.publicShelfToken}`;
    await page.goto(shareUrl, { waitUntil: "networkidle" });
    await page.waitForSelector("body");
    await page.waitForTimeout(400);
    const shareFilename = "feature-public-share.png";
    await page.screenshot({ path: path.join(OUTPUT_DIR, shareFilename) });
    manifest.push({
      feature: "public-share",
      route: `/share/${fixture.publicShelfToken}`,
      viewport: DESKTOP,
      type: "image",
      src: `/landing/${shareFilename}`,
      alt: "Public shelf share preview",
    });
    console.log(`captured ${shareFilename}`);
  }

  await context.close();
  return manifest;
}

async function encodeGif(frames, outPath, fps = 10) {
  const delayMs = Math.max(50, Math.round(1000 / fps));
  const sharpFrames = [];
  for (const buffer of frames) {
    const image = sharp(buffer);
    const { width } = await image.metadata();
    sharpFrames.push({
      input: await image
        .resize({ width: Math.min(width ?? 600, 600), withoutEnlargement: true })
        .gif({ palette: true })
        .toBuffer(),
    });
  }
  await sharp({
    create: {
      width: 600,
      height: 1,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .gif({ delay: delayMs, loop: 0 })
    .composite(
      sharpFrames.map((f) => ({ input: f.input, top: 0, left: 0 })),
    )
    .toFile(outPath);
}

async function captureAnimations(browser, fixture, manifest) {
  const context = await browser.newContext({ viewport: MOBILE });
  await context.route("**/api/books/search**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        results: [
          {
            id: "fixture-volume-1",
            title: "The Left Hand of Darkness",
            authors: ["Ursula K. Le Guin"],
            publishedDate: "1969-01-01",
            publisher: "Ace",
            pageCount: 304,
            coverUrl: null,
            isbn13: "9780441478125",
          },
          {
            id: "fixture-volume-2",
            title: "The Dispossessed",
            authors: ["Ursula K. Le Guin"],
            publishedDate: "1974-01-01",
            publisher: "Harper Perennial",
            pageCount: 387,
            coverUrl: null,
            isbn13: "9780061054884",
          },
        ],
      }),
    });
  });

  const page = await context.newPage();
  const frames = [];
  async function snap(delayMs = 250) {
    await page.waitForTimeout(delayMs);
    frames.push(await page.screenshot({ type: "png" }));
  }

  await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle" });
  await snap(200);
  const addBtn = page.getByRole("button", { name: /add book/i }).first();
  await addBtn.click();
  await page.waitForTimeout(450);
  await snap(100);
  const input = page.getByPlaceholder(/title/i).first();
  await input.click();
  await input.fill("Le Guin");
  await page.waitForTimeout(700);
  await snap(200);
  const option = page.getByRole("option").first();
  if (await option.count()) {
    await option.click({ force: true });
    await snap(200);
  }

  await context.close();

  if (frames.length === 0) {
    console.warn("no frames captured for add-book animation");
    return;
  }

  const gifPath = path.join(OUTPUT_DIR, "feature-add-book.gif");
  await encodeGif(frames, gifPath, 8);
  const stillPath = path.join(OUTPUT_DIR, "feature-add-book.png");
  await sharp(frames[0]).toFile(stillPath);
  manifest.push({
    feature: "add-book",
    route: "/",
    viewport: MOBILE,
    type: "gif",
    src: `/landing/feature-add-book.gif`,
    alt: "Adding a book by typing a few letters of the title",
  });
  manifest.push({
    feature: "add-book-still",
    route: "/",
    viewport: MOBILE,
    type: "image",
    src: `/landing/feature-add-book.png`,
    alt: "Add book dialog",
  });
  console.log("captured add-book animation");
}

async function pruneOrphans(manifest) {
  const expected = new Set(manifest.flatMap((m) => [m.src]));
  const entries = await fs.readdir(OUTPUT_DIR);
  for (const entry of entries) {
    if (entry === "manifest.json") continue;
    if (!expected.has(`/landing/${entry}`)) {
      await fs.unlink(path.join(OUTPUT_DIR, entry));
      console.log(`pruned orphan ${entry}`);
    }
  }
}

async function writeManifest(manifest) {
  const data = {
    generatedAt: new Date().toISOString(),
    assets: manifest,
  };
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(data, null, 2));
}

async function main() {
  assertSafeEnvironment();
  await ensureOutputDir();

  const serverProcess = await startDevServerIfNeeded();
  let fixture;
  try {
    fixture = await seedFixture();
  } catch (error) {
    if (serverProcess) serverProcess.kill("SIGINT");
    throw error;
  }

  const browser = await chromium.launch();
  const manifest = [];
  try {
    const stills = await captureStills(browser, fixture);
    manifest.push(...stills);
    try {
      await captureAnimations(browser, fixture, manifest);
    } catch (error) {
      console.warn(`Skipping animations: ${error.message}`);
    }
  } finally {
    await browser.close();
    if (serverProcess) serverProcess.kill("SIGINT");
  }

  await pruneOrphans(manifest);
  await writeManifest(manifest);
  console.log(`Wrote manifest with ${manifest.length} assets`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
