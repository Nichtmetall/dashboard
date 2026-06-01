import "server-only";

import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

import { prisma } from "@/lib/prisma";

export class GoogleAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GoogleAuthError";
  }
}

interface GoogleClientContext {
  /** Authenticated OAuth2 client ready to be passed to googleapis services. */
  auth: OAuth2Client;
  /** Space-separated list of scopes granted to this account. */
  grantedScopes: string;
}

/**
 * Build an authenticated Google OAuth2 client for a given user.
 *
 * Reads the user's stored (and transparently decrypted) Google tokens, sets
 * them on an OAuth2 client and registers a listener that persists any
 * automatically refreshed tokens back to the database (re-encrypted on write).
 */
export async function getGoogleClient(
  userId: string,
): Promise<GoogleClientContext> {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;

  if (!clientId || !clientSecret) {
    throw new GoogleAuthError(
      "Missing AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET environment variables.",
    );
  }

  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account || !account.access_token) {
    throw new GoogleAuthError(
      "No connected Google account found. Please sign in again.",
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
    scope: account.scope ?? undefined,
    token_type: account.token_type ?? undefined,
  });

  // Persist refreshed tokens (googleapis refreshes lazily on demand).
  oauth2Client.on("tokens", (tokens) => {
    void persistRefreshedTokens(account.id, tokens);
  });

  return {
    auth: oauth2Client,
    grantedScopes: account.scope ?? "",
  };
}

async function persistRefreshedTokens(
  accountId: string,
  tokens: {
    access_token?: string | null;
    refresh_token?: string | null;
    expiry_date?: number | null;
    scope?: string | null;
    token_type?: string | null;
  },
): Promise<void> {
  try {
    await prisma.account.update({
      where: { id: accountId },
      data: {
        ...(tokens.access_token
          ? { access_token: tokens.access_token }
          : {}),
        // Google only returns a refresh token on first consent; keep the
        // existing one otherwise.
        ...(tokens.refresh_token
          ? { refresh_token: tokens.refresh_token }
          : {}),
        ...(tokens.expiry_date
          ? { expires_at: Math.floor(tokens.expiry_date / 1000) }
          : {}),
        ...(tokens.scope ? { scope: tokens.scope } : {}),
        ...(tokens.token_type ? { token_type: tokens.token_type } : {}),
      },
    });
  } catch (error) {
    console.error("Failed to persist refreshed Google tokens", error);
  }
}

/** Check whether a given scope was granted to the connected account. */
export function hasScope(grantedScopes: string, scope: string): boolean {
  return grantedScopes.split(" ").includes(scope);
}
