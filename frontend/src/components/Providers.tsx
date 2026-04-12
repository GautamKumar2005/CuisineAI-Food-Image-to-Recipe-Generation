"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Re-check session every 30 seconds so it stays fresh on HF proxy
      refetchInterval={30}
      // Re-fetch when tab regains focus (catches the post-login case)
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
}
