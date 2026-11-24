import type { Database, PageCursor } from "@esposter/db-schema";

import { createPageSort } from "#src/services/pagination/createPageSort";
import { getPageOrderBy } from "#src/services/pagination/getPageOrderBy";
import { getPageWhere } from "#src/services/pagination/getPageWhere";
import { NOTIFICATION_PAGE_SORT, notificationsInNotification } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

// One page of the owner's bell, newest first, with one row past the limit for the caller to read the next cursor from.
// The unread badge is counted apart, since the pages the bell has never read hold unread rows too
export const readNotificationRows = (
  db: Database,
  { cursor, limit, userId }: { cursor: PageCursor; limit: number; userId: string },
) => {
  const boundSort = createPageSort({ id: notificationsInNotification.id }, NOTIFICATION_PAGE_SORT);
  return db
    .select()
    .from(notificationsInNotification)
    .where(and(eq(notificationsInNotification.userId, userId), getPageWhere(boundSort, cursor)))
    .orderBy(...getPageOrderBy(boundSort, cursor))
    .limit(limit + 1);
};
