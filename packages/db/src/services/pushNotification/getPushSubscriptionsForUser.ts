import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { PUSH_SUBSCRIPTION_COLUMNS } from "@/services/pushNotification/constants";
import { pushSubscriptionsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const getPushSubscriptionsForUser = (db: PostgresJsDatabase<typeof relations>, userId: string) =>
  db
    .select({ ...PUSH_SUBSCRIPTION_COLUMNS })
    .from(pushSubscriptionsInMessage)
    .where(eq(pushSubscriptionsInMessage.userId, userId));
