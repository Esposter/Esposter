import type { PageSort } from "#src/models/pagination/PageSort";

import { SortOrder } from "#src/models/pagination/SortOrder";

// How long a delivered notification stays readable. Bounded on purpose: a row is written per recipient and
// Nothing else ever deletes it, so an unbounded bell is a table that only grows. The trim rides the write path,
// Where the recipients are already known and the delete is one indexed statement.
export const NOTIFICATION_RETENTION_MS = Temporal.Duration.from({ days: 30 }).total("milliseconds");

// Newest first on the id, which is creation order, so a page is a range scan of the user's own notifications
export const NOTIFICATION_PAGE_SORT = { keys: ["id"], order: SortOrder.Desc } as const satisfies PageSort<"id">;
