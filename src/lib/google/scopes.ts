/**
 * Google OAuth scopes requested at login.
 *
 * Note on Google Photos: the legacy broad `photoslibrary.readonly` scope has
 * been progressively restricted by Google in favour of the Picker API and the
 * narrower app-created-data scopes. `readonly` still works for apps that have
 * completed the required verification; otherwise the Photos widget will surface
 * a permission error gracefully. Adjust as needed for your Google Cloud
 * project's verification status.
 */
export const GOOGLE_SCOPES = [
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  // Google Calendar – read & write
  "https://www.googleapis.com/auth/calendar",
  // Google Tasks – read & write
  "https://www.googleapis.com/auth/tasks",
  // Google Drive – read only
  "https://www.googleapis.com/auth/drive.readonly",
  // Google Photos – read only
  "https://www.googleapis.com/auth/photoslibrary.readonly",
] as const;

export const GOOGLE_SCOPE_STRING = GOOGLE_SCOPES.join(" ");
