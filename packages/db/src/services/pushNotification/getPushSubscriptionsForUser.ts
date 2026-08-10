import type { Database } from "@esposter/db-schema";

import { PUSH_SUBSCRIPTION_COLUMNS } from "@/services/pushNotification/constants";
import { pushSubscriptionsInMessage } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const getPushSubscriptionsForUser = (db: Database, userId: string) =>
  db
    .select({ ...PUSH_SUBSCRIPTION_COLUMNS })
    .from(pushSubscriptionsInMessage)
    .where(eq(pushSubscriptionsInMessage.userId, userId));
