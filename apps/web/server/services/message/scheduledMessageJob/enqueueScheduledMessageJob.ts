import type { ScheduledMessageJobInMessage } from "@esposter/db-schema";

import { useServiceBusSender } from "@@/server/composables/azure/serviceBus/useServiceBusSender";
import { enqueueScheduledMessageJob as baseEnqueueScheduledMessageJob } from "@esposter/db";
import { AzureQueue } from "@esposter/db-schema";
// A persisted job is only delivered once its queue message exists, so the queue binding lives in one place
export const enqueueScheduledMessageJob = ({ id, runAt }: ScheduledMessageJobInMessage) =>
  baseEnqueueScheduledMessageJob(useServiceBusSender(AzureQueue.ScheduledMessageJobs), id, runAt);
