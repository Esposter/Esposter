import type { UserInAuth } from "@esposter/db-schema";

import { activeScheduledMessageJobWhere } from "#server/services/message/scheduledMessageJob/activeScheduledMessageJobWhere";
import { scheduledMessageJobsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

export const getActiveScheduledMessageJobsWhere = (userId: UserInAuth["id"]) =>
  and(eq(scheduledMessageJobsInMessage.userId, userId), activeScheduledMessageJobWhere);
