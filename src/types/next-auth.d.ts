import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extend the session user with the database `id` so server components can
   * look up the user's stored Google tokens.
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
