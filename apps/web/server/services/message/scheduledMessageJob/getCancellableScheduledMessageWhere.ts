import { ownedBy } from "@@/server/services/db/ownedBy";
import { activeScheduledMessageJobWhere } from "@@/server/services/message/scheduledMessageJob/activeScheduledMessageJobWhere";
import { scheduledMessageJobsInMessage, ScheduledMessageJobType } from "@esposter/db-schema";
import { and, sql } from "drizzle-orm";
// An active scheduled-message job owned by the user — the precondition for cancelling/rescheduling/sending it.
export const getCancellableScheduledMessageWhere = (id: string, userId: string) =>
  and(
    ownedBy(scheduledMessageJobsInMessage, id, userId),
    activeScheduledMessageJobWhere,
    sql`${scheduledMessageJobsInMessage.payload}->>'type' = ${ScheduledMessageJobType.ScheduledMessage}`,
  );
