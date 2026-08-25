import type { Database } from "@esposter/db-schema";

import { PUSH_SUBSCRIPTION_COLUMNS } from "#src/services/notification/constants";
import { pushSubscriptions } from "@esposter/db-schema";
import { and, inArray, ne } from "drizzle-orm";

// The one device lookup. Recipient resolution answers *who* in user ids, and this answers *where* — so a new
// Notification type never grows a device query of its own, and the join it would have written wrong (a user with
// No subscription silently dropping out of the bell too) cannot happen.
//
// `excludedSessionId` is the session that caused the notification. A subscription is per-session, so excluding it
// Is what lets the acting tab keep its own synchronous toast while every other device of the same user is pushed.
export const getPushSubscriptionsForUsers = (db: Database, userIds: string[], excludedSessionId?: string) => {
  const wheres = [inArray(pushSubscriptions.userId, userIds)];
  if (excludedSessionId) wheres.push(ne(pushSubscriptions.sessionId, excludedSessionId));
  return db
    .select({ ...PUSH_SUBSCRIPTION_COLUMNS })
    .from(pushSubscriptions)
    .where(and(...wheres));
};
