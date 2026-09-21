#!/usr/bin/env node
// Smoke check: every key under landing.features and landing.hero in en.json must
// exist with the same shape in es.json (and vice versa). Run before committing
// i18n changes.

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const en = JSON.parse(fs.readFileSync(path.join(root, "lib/i18n/en.json"), "utf8"));
const es = JSON.parse(fs.readFileSync(path.join(root, "lib/i18n/es.json"), "utf8"));

function leafKeys(obj, prefix = "") {
  const out = [];
  if (!obj || typeof obj !== "object") return out;
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out.push(...leafKeys(value, next));
    } else {
      out.push(next);
    }
  }
  return out;
}

function scopedKeys(obj, scope) {
  const segments = scope.split(".");
  let current = obj;
  for (const segment of segments) {
    if (!current || typeof current !== "object") return [];
    current = current[segment];
  }
  return leafKeys(current, scope);
}

const errors = [];
for (const scope of ["landing.hero", "landing.features", "landing.footer"]) {
  const enKeys = new Set(scopedKeys(en, scope));
  const esKeys = new Set(scopedKeys(es, scope));
  for (const key of enKeys) {
    if (!esKeys.has(key)) errors.push(`missing in es: ${key}`);
  }
  for (const key of esKeys) {
    if (!enKeys.has(key)) errors.push(`missing in en: ${key}`);
  }
}

if (errors.length > 0) {
  console.error("i18n landing parity check failed:");
  for (const message of errors) console.error(`  - ${message}`);
  process.exit(1);
}

console.log("landing.hero + landing.features + landing.footer parity ok");
