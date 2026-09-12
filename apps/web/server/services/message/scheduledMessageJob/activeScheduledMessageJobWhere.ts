import { scheduledMessageJobsInMessage } from "@esposter/db-schema";
import { and, isNull } from "drizzle-orm";
// Not yet cancelled, completed, or claimed by the delivery handler. `processingStartedAt` is what makes the claim
// Single-shot: once ProcessScheduledMessageJob has stamped it the job is being delivered, so the owner can no
// Longer cancel, reschedule or send it — every one of those would race a message that is already on its way out
export const activeScheduledMessageJobWhere = and(
  isNull(scheduledMessageJobsInMessage.cancelledAt),
  isNull(scheduledMessageJobsInMessage.completedAt),
  isNull(scheduledMessageJobsInMessage.processingStartedAt),
);
