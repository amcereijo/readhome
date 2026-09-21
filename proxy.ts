import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/invite(.*)",
  "/share(.*)",
  // Clerk Frontend API proxy traffic must never be auth-gated — a 307 here
  // makes ClerkJS wipe otherwise-valid sessions.
  "/__clerk(.*)",
  // Dev-only landing capture fixture. The route itself 404s in production and
  // when LANDING_CAPTURE is unset, so this matcher only widens access in dev.
  "/dev/landing-fixture",
]);

// Capture mode is opt-in and refuses to run in production. When active, every
// non-public route is treated as capturable so Playwright can screenshot
// signed-in screens without a real Clerk session.
const captureModeActive =
  process.env.NODE_ENV !== "production" && process.env.LANDING_CAPTURE === "1";

export default clerkMiddleware(async (auth, req) => {
  if (captureModeActive) return;
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk(.*)",
  ],
};
