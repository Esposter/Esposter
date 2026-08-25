import type { AppNotificationAction } from "@/models/notification/AppNotificationAction";
import type { Notification } from "@esposter/db-schema";

// The one shape the bell and the snackbar render, whichever end it came from: a delivered notification the
// Server persisted (so it survives the reload and reaches every device), or feedback about an action taken in
// This tab (a mutation error, a save conflict, an export that finished here), which nothing else can act on and
// Which is therefore never written down.
//
// A persisted row is already this shape — `severity` is taken from the column so the two can never drift.
export interface AppNotification {
  action?: AppNotificationAction;
  body: string;
  createdAt: Date;
  id: string;
  isRead: boolean;
  // The in-app route the row opens; "" for a notification with nowhere to go.
  path: string;
  severity: Notification["severity"];
  title: string;
}
