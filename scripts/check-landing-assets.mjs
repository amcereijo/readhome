#!/usr/bin/env node
// Sanity check: every asset referenced by manifest.json must exist on disk and
// there must be no orphan files in public/landing/ outside the manifest.

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const dir = path.join(root, "public", "landing");
const manifestPath = path.join(dir, "manifest.json");

try {
  const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  const errors = [];
  for (const asset of manifest.assets ?? []) {
    const rel = asset.src?.replace(/^\//, "");
    if (!rel) {
      errors.push(`asset missing src: ${JSON.stringify(asset)}`);
      continue;
    }
    const full = path.join(root, "public", rel);
    try {
      await fs.access(full);
    } catch {
      errors.push(`manifest references missing file: ${rel}`);
    }
  }
  const expected = new Set((manifest.assets ?? []).map((a) => a.src?.replace(/^\//, "")).filter(Boolean));
  const entries = await fs.readdir(dir);
  for (const entry of entries) {
    if (entry === "manifest.json") continue;
    if (!expected.has(`landing/${entry}`)) {
      errors.push(`orphan file: landing/${entry}`);
    }
  }
  if (errors.length > 0) {
    console.error("landing asset check failed:");
    for (const err of errors) console.error(`  - ${err}`);
    process.exit(1);
  }
  console.log(`landing assets ok (${(manifest.assets ?? []).length} assets)`);
} catch (error) {
  if (error.code === "ENOENT") {
    console.error("manifest.json missing — run `npm run landing.capture` first");
    process.exit(1);
  }
  throw error;
}
