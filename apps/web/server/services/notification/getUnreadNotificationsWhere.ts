import type { UserInAuth } from "@esposter/db-schema";

import { notificationsInNotification } from "@esposter/db-schema";
import { and, eq, isNull, sql } from "drizzle-orm";

// The predicate is the partial index's own literal, `isRead = 0`: a bound parameter would not match the index's WHERE,
// And the planner would fall back to the user's whole history. A dismissed row is a tombstone, so it counts for nothing
// And the index's predicate is one conjunct of this one, which the planner still uses
export const getUnreadNotificationsWhere = (userId: UserInAuth["id"]) =>
  and(
    eq(notificationsInNotification.userId, userId),
    sql`${notificationsInNotification.isRead} = 0`,
    isNull(notificationsInNotification.deletedAt),
  );
