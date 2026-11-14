import type { Database } from "@esposter/db-schema";

import { MAX_USER_IDS_PER_STATEMENT, PUSH_SUBSCRIPTION_COLUMNS } from "#src/services/notification/constants";
import { inJsonArray } from "#src/services/shared/inJsonArray";
import { pushSubscriptionsInNotification } from "@esposter/db-schema";
import { chunk, settleAll } from "@esposter/shared";
import { and, ne } from "drizzle-orm";

// The one device lookup. Recipient resolution answers *who* in user ids, and this answers *where* — so a new
// Notification type never grows a device query of its own, and the join it would have written wrong (a user with
// No subscription silently dropping out of the bell too) cannot happen.
//
// `excludedSessionId` is the session that caused the notification. A subscription is per-session, so excluding it
// Is what lets the acting tab keep its own synchronous toast while every other device of the same user is pushed.
// A room is read in waves of MAX_USER_IDS_PER_STATEMENT users, one wave after another, so a large room holds one
// connection rather than one per wave. Each wave binds its user ids as one JSON array, so the wave is bounded by its size
// rather than by the statement parameter cap
export const getPushSubscriptionsForUsers = async (db: Database, userIds: string[], excludedSessionId?: string) =>
  (
    await settleAll(
      chunk(userIds, MAX_USER_IDS_PER_STATEMENT).map((userIdsChunk) => () => {
        const wheres = [inJsonArray(pushSubscriptionsInNotification.userId, userIdsChunk)];
        if (excludedSessionId) wheres.push(ne(pushSubscriptionsInNotification.sessionId, excludedSessionId));
        return db
          .select({ ...PUSH_SUBSCRIPTION_COLUMNS })
          .from(pushSubscriptionsInNotification)
          .where(and(...wheres));
      }),
      1,
    )
  ).flat();
