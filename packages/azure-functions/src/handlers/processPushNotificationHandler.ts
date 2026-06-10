import type { EventGridHandler } from "@azure/functions";

import { sendPushNotification } from "@/services/sendPushNotification";
import { AzureFunction, pushNotificationEventGridDataSchema } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const processPushNotificationHandler: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ProcessPushNotification} processed message: `, event.data);
  return getResultAsync(async () => {
    const data = pushNotificationEventGridDataSchema.parse(event.data);
    await sendPushNotification(context, data);
    context.log(`Successfully processed push notifications for room ${data.message.partitionKey}.`);
  }).match(noop, (error) => {
    context.error(`${AzureFunction.ProcessPushNotification} failed: `, error);
    throw error;
  });
};
