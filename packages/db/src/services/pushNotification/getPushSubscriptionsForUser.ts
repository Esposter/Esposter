import type { schema } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { pushSubscriptionsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const getPushSubscriptionsForUser = (db: PostgresJsDatabase<typeof schema>, userId: string) =>
  db
    .select({
      auth: pushSubscriptionsInMessage.auth,
      endpoint: pushSubscriptionsInMessage.endpoint,
      expirationTime: pushSubscriptionsInMessage.expirationTime,
      id: pushSubscriptionsInMessage.id,
      p256dh: pushSubscriptionsInMessage.p256dh,
    })
    .from(pushSubscriptionsInMessage)
    .where(eq(pushSubscriptionsInMessage.userId, userId));
