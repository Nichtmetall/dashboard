import "server-only";

import { GoogleAuthError } from "@/lib/google/client";
import type { WidgetErrorReason } from "@/lib/google/types";

/**
 * Normalise an unknown error thrown while talking to a Google API into a
 * user-friendly message plus a coarse reason code for the UI.
 */
export function mapGoogleError(error: unknown): {
  error: string;
  reason: WidgetErrorReason;
} {
  if (error instanceof GoogleAuthError) {
    return { error: error.message, reason: "unauthenticated" };
  }

  // googleapis throws GaxiosError with a numeric `status` / `code`.
  const status =
    typeof error === "object" && error !== null
      ? ((error as { status?: number; code?: number }).status ??
        (error as { code?: number }).code)
      : undefined;

  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  if (status === 401) {
    return {
      error: "Your Google session expired. Please sign in again.",
      reason: "unauthenticated",
    };
  }

  if (status === 403) {
    // 403 typically means the required scope was not granted or the API is not
    // enabled in the Google Cloud project.
    if (/disabled|not been used|enable/i.test(message)) {
      return {
        error:
          "This Google API is not enabled for the project. Enable it in the Google Cloud Console.",
        reason: "api-disabled",
      };
    }
    return {
      error:
        "Access was denied. The required permission may not have been granted.",
      reason: "missing-scope",
    };
  }

  return { error: message, reason: "unknown" };
}
