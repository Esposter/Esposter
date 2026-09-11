import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";
import type { SQL } from "drizzle-orm";

import { requireScheduledMessageJob } from "@@/server/services/message/scheduledMessageJob/requireScheduledMessageJob";
import { scheduledMessageJobsInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
// Cancelling is the claim every owner-side write makes: the active row flips, or the caller is told NOT_FOUND
// Because nothing matched `where` — already cancelled, delivered, or claimed by the delivery handler
export const cancelScheduledMessageJob = async (db: Context["db"] | Transaction, where: SQL | undefined, id: string) =>
  requireScheduledMessageJob(
    (await db.update(scheduledMessageJobsInMessage).set({ cancelledAt: new Date() }).where(where).returning())[0],
    Operation.Update,
    id,
    "NOT_FOUND",
  );
