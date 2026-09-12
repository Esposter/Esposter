import type { Transaction } from "@@/server/models/db/Transaction";
import type { Context } from "@@/server/trpc/context";

import { requireScheduledMessageJob } from "@@/server/services/message/scheduledMessageJob/requireScheduledMessageJob";
import { scheduledMessageJobsInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
// Every job lands through this one insert, inside or outside a transaction — the row is what the delivery
// Handler reads, so it lands or the write fails
export const insertScheduledMessageJob = async (
  db: Context["db"] | Transaction,
  values: typeof scheduledMessageJobsInMessage.$inferInsert,
  context: string,
) =>
  requireScheduledMessageJob(
    (await db.insert(scheduledMessageJobsInMessage).values(values).returning())[0],
    Operation.Create,
    context,
  );
