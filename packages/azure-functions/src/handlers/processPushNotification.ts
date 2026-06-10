import type { EventGridHandler } from "@azure/functions";
import type { PushNotificationEventGridData } from "@esposter/db-schema";

import { sendPushNotification } from "@/services/sendPushNotification";
import { AzureFunction } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

export const processPushNotification: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ProcessPushNotification} processed message: `, event.data);
  const data = event.data as unknown as PushNotificationEventGridData;
  return getResultAsync(() => sendPushNotification(context, data)).match(
    () => {
      context.log(`Successfully processed push notifications for room ${data.message.partitionKey}.`);
    },
    (error) => {
      context.error(`Failed to process push notifications for room ${data.message.partitionKey}: `, error);
      throw error;
    },
  );
};
