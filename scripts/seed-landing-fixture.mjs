#!/usr/bin/env node
// Seed the landing capture fixture by hitting the dev-only /dev/landing-fixture
// route. Run with the dev server up and LANDING_CAPTURE=1 in the environment.

import process from "node:process";

const baseUrl = process.env.LANDING_BASE_URL ?? "http://127.0.0.1:3000";
const url = `${baseUrl.replace(/\/$/, "")}/dev/landing-fixture`;

const response = await fetch(url, {
  headers: {
    accept: "application/json",
  },
});

if (!response.ok) {
  const text = await response.text();
  console.error(`Fixture seed failed (${response.status}): ${text}`);
  process.exit(1);
}

const payload = await response.json();
console.log(JSON.stringify(payload, null, 2));
