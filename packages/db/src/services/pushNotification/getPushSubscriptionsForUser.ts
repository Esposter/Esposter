import type { schema } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { pushSubscriptions } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const getPushSubscriptionsForUser = (db: PostgresJsDatabase<typeof schema>, userId: string) =>
  db
    .select({
      auth: pushSubscriptions.auth,
      endpoint: pushSubscriptions.endpoint,
      expirationTime: pushSubscriptions.expirationTime,
      id: pushSubscriptions.id,
      p256dh: pushSubscriptions.p256dh,
    })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId));
