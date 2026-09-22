"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-full items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            cardSubtitle: { display: "none" },
          },
        }}
      />
    </div>
  );
}
