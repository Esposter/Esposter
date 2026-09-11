import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";
import type { Operation } from "@esposter/shared";

import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { DatabaseEntityType } from "@esposter/db-schema";
// Every write against a job either lands a row or must fail — the row is what the delivery handler reads
export const requireScheduledMessageJob = (
  scheduledMessageJob: ScheduledMessageJobInMessage | undefined,
  operation: Operation,
  context: string,
  code?: "BAD_REQUEST" | "NOT_FOUND",
) => requireMutation(scheduledMessageJob, operation, DatabaseEntityType.ScheduledMessageJob, context, code);
