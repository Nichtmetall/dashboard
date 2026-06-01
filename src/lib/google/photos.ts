import "server-only";

import { getGoogleClient } from "@/lib/google/client";
import { mapGoogleError } from "@/lib/google/errors";
import { GoogleAuthError } from "@/lib/google/client";
import type { PhotoItem, WidgetResult } from "@/lib/google/types";

/**
 * The Google Photos Library API is no longer bundled in the aggregate
 * `googleapis` SDK (Google restricted broad library access in 2025), so we call
 * the REST endpoint directly with the user's OAuth access token. The OAuth2
 * client transparently refreshes the token if it has expired.
 *
 * @see https://developers.google.com/photos/library/reference/rest/v1/mediaItems/list
 */
const MEDIA_ITEMS_ENDPOINT =
  "https://photoslibrary.googleapis.com/v1/mediaItems";

interface RawMediaItem {
  id?: string;
  baseUrl?: string;
  productUrl?: string;
  filename?: string;
  description?: string;
  mimeType?: string;
  mediaMetadata?: { creationTime?: string };
}

/**
 * Fetch a small set of recent photos to render a gallery and a randomised
 * "memory of the day". Only image media items are returned.
 */
export async function getRecentPhotos(
  userId: string,
  limit = 8,
): Promise<WidgetResult<PhotoItem[]>> {
  try {
    const { auth } = await getGoogleClient(userId);
    const { token } = await auth.getAccessToken();
    if (!token) {
      throw new GoogleAuthError("Could not obtain a Google access token.");
    }

    const url = new URL(MEDIA_ITEMS_ENDPOINT);
    url.searchParams.set("pageSize", "50");

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      // Always fetch fresh data for this dynamic widget.
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await safeJson(response);
      const error = new Error(
        body?.error?.message ?? `Photos API returned ${response.status}`,
      ) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    const data = (await response.json()) as { mediaItems?: RawMediaItem[] };

    const items: PhotoItem[] = (data.mediaItems ?? [])
      .filter((item) => item.mimeType?.startsWith("image/"))
      .map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        baseUrl: item.baseUrl ?? "",
        productUrl: item.productUrl ?? null,
        filename: item.filename ?? null,
        description: item.description ?? null,
        creationTime: item.mediaMetadata?.creationTime ?? null,
      }));

    // Shuffle so the "memory of the day" feels fresh on each refresh.
    return { ok: true, data: shuffle(items).slice(0, limit) };
  } catch (error) {
    return { ok: false, ...mapGoogleError(error) };
  }
}

/**
 * Build a sized thumbnail URL from a Google Photos `baseUrl`.
 * @see https://developers.google.com/photos/library/guides/access-media-items#base-urls
 */
export function buildPhotoUrl(
  baseUrl: string,
  { width, height }: { width: number; height: number },
): string {
  if (!baseUrl) return baseUrl;
  return `${baseUrl}=w${width}-h${height}`;
}

async function safeJson(
  response: Response,
): Promise<{ error?: { message?: string } } | null> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
