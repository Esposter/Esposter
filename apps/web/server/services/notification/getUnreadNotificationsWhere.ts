import type { UserInAuth } from "@esposter/db-schema";

import { notificationsInNotification } from "@esposter/db-schema";
import { and, eq, sql } from "drizzle-orm";

// The predicate is the partial index's own literal, `isRead = 0`: a bound parameter would not match the index's WHERE,
// And the planner would fall back to the user's whole history
export const getUnreadNotificationsWhere = (userId: UserInAuth["id"]) =>
  and(eq(notificationsInNotification.userId, userId), sql`${notificationsInNotification.isRead} = 0`);
