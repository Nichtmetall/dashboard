import "server-only";

import { google } from "googleapis";

import { getGoogleClient } from "@/lib/google/client";
import { mapGoogleError } from "@/lib/google/errors";
import type { CalendarEvent, WidgetResult } from "@/lib/google/types";

/**
 * Fetch the user's events for today and tomorrow from the primary calendar.
 */
export async function getUpcomingEvents(
  userId: string,
): Promise<WidgetResult<CalendarEvent[]>> {
  try {
    const { auth } = await getGoogleClient(userId);
    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(startOfToday);
    endOfTomorrow.setDate(endOfTomorrow.getDate() + 2);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    const { data } = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfToday.toISOString(),
      timeMax: endOfTomorrow.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 25,
    });

    const events: CalendarEvent[] = (data.items ?? []).map((event) => {
      const start = event.start?.dateTime ?? event.start?.date ?? null;
      const end = event.end?.dateTime ?? event.end?.date ?? null;
      const allDay = Boolean(event.start?.date && !event.start?.dateTime);

      const startDate = start ? new Date(start) : null;
      const day: CalendarEvent["day"] =
        startDate && startDate >= startOfTomorrow ? "tomorrow" : "today";

      return {
        id: event.id ?? crypto.randomUUID(),
        title: event.summary ?? "(No title)",
        start,
        end,
        allDay,
        location: event.location ?? null,
        htmlLink: event.htmlLink ?? null,
        day,
      };
    });

    return { ok: true, data: events };
  } catch (error) {
    return { ok: false, ...mapGoogleError(error) };
  }
}
