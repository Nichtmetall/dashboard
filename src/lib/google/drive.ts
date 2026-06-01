import "server-only";

import { google } from "googleapis";

import { getGoogleClient } from "@/lib/google/client";
import { mapGoogleError } from "@/lib/google/errors";
import type { DriveFile, WidgetResult } from "@/lib/google/types";

/**
 * Fetch the most recently modified / viewed files from the user's Drive.
 */
export async function getRecentDriveFiles(
  userId: string,
): Promise<WidgetResult<DriveFile[]>> {
  try {
    const { auth } = await getGoogleClient(userId);
    const drive = google.drive({ version: "v3", auth });

    const { data } = await drive.files.list({
      pageSize: 10,
      orderBy: "modifiedTime desc",
      q: "trashed = false",
      fields:
        "files(id, name, mimeType, iconLink, webViewLink, modifiedTime, viewedByMeTime)",
    });

    const files: DriveFile[] = (data.files ?? []).map((file) => ({
      id: file.id ?? crypto.randomUUID(),
      name: file.name ?? "(Unnamed)",
      mimeType: file.mimeType ?? "application/octet-stream",
      iconLink: file.iconLink ?? null,
      webViewLink: file.webViewLink ?? null,
      modifiedTime: file.modifiedTime ?? null,
      viewedByMeTime: file.viewedByMeTime ?? null,
    }));

    return { ok: true, data: files };
  } catch (error) {
    return { ok: false, ...mapGoogleError(error) };
  }
}
