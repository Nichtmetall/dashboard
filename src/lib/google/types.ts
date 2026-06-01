/**
 * Discriminated result type used by all widget data fetchers so the UI can
 * render error states without throwing.
 */
export type WidgetResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; reason?: WidgetErrorReason };

export type WidgetErrorReason =
  | "unauthenticated"
  | "missing-scope"
  | "api-disabled"
  | "unknown";

export interface CalendarEvent {
  id: string;
  title: string;
  start: string | null;
  end: string | null;
  allDay: boolean;
  location: string | null;
  htmlLink: string | null;
  day: "today" | "tomorrow";
}

export interface TaskItem {
  id: string;
  title: string;
  notes: string | null;
  due: string | null;
  completed: boolean;
  listId: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconLink: string | null;
  webViewLink: string | null;
  modifiedTime: string | null;
  viewedByMeTime: string | null;
}

export interface PhotoItem {
  id: string;
  baseUrl: string;
  productUrl: string | null;
  filename: string | null;
  description: string | null;
  creationTime: string | null;
}
