"use client";

import { useEffect } from "react";

// Registers /sw.js so mobile browsers recognize the app as installable.
// Skipped outside production (dev/HMR must not fight a service worker) and
// wherever the Service Worker API is missing; failures only hit the console.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  }, []);

  return null;
}
