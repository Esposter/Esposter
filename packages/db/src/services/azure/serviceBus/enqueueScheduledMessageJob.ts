import type { ServiceBusSender } from "@azure/service-bus";

import { scheduledMessageJobQueueMessageSchema } from "@esposter/db-schema";
// Service Bus delivers messages scheduled in the past immediately, so runAt needs no clamping.
export const enqueueScheduledMessageJob = async (serviceBusSender: ServiceBusSender, id: string, runAt: Date) => {
  await serviceBusSender.scheduleMessages({ body: scheduledMessageJobQueueMessageSchema.parse({ id }) }, runAt);
};
