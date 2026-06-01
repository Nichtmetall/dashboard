import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { GOOGLE_SCOPE_STRING } from "@/lib/google/scopes";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * - Uses the Prisma adapter with a **database** session strategy so we can keep
 *   long-lived OAuth tokens server-side for background Google API calls.
 * - Requests offline access + consent prompt so Google returns a refresh token.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  // The extended Prisma client is structurally compatible with the adapter.
  adapter: PrismaAdapter(prisma as unknown as PrismaClient),
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      authorization: {
        params: {
          scope: GOOGLE_SCOPE_STRING,
          // Required for Google to return a refresh token.
          access_type: "offline",
          // Force the consent screen so a refresh token is always issued, even
          // on re-authentication.
          prompt: "consent",
          include_granted_scopes: "true",
        },
      },
      // Allow linking the Google account even if the email already exists.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      // Surface the user id on the session for server-side data fetching.
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
