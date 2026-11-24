import type { PageSort } from "#src/models/pagination/PageSort";

import { SortOrder } from "#src/models/pagination/SortOrder";

// How long a delivered notification stays readable. Bounded on purpose: a row is written per recipient and
// Nothing else ever deletes it, so an unbounded bell is a table that only grows. The trim rides the write path,
// Where the recipients are already known and the delete is one indexed statement.
export const NOTIFICATION_RETENTION_MS = Temporal.Duration.from({ days: 30 }).total("milliseconds");

// Newest first on the id, which is creation order, so a page is a range scan of the user's own notifications
export const NOTIFICATION_PAGE_SORT = { keys: ["id"], order: SortOrder.Desc } as const satisfies PageSort<"id">;

// The hosts a browser's push endpoint may be on, one entry per browser's push service. The server stores an endpoint
// And the jobs worker POSTs to it, so an endpoint on any other host would have the worker send a request to that host.
// An entry with a leading dot admits every host under that name; any other entry admits only itself
export const PUSH_SERVICE_HOSTS: readonly string[] = [
  // Chrome, Edge (Chromium), Opera and Brave
  "fcm.googleapis.com",
  // Firefox: updates.push.services.mozilla.com and every other host under push.services.mozilla.com
  ".push.services.mozilla.com",
  // Safari
  "web.push.apple.com",
  // Legacy Edge: every host under notify.windows.com
  ".notify.windows.com",
];
