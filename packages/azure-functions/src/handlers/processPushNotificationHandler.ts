import type { EventGridHandler } from "@azure/functions";

import { createEventGridNotificationHandler } from "#src/handlers/createEventGridNotificationHandler";
import { sendPushNotification } from "#src/services/sendPushNotification";
import { AzureFunction, pushNotificationEventGridDataSchema } from "@esposter/db-schema";

export const processPushNotificationHandler: EventGridHandler = createEventGridNotificationHandler(
  AzureFunction.ProcessPushNotification,
  pushNotificationEventGridDataSchema,
  sendPushNotification,
  (data) => `Successfully processed push notifications for room ${data.message.partitionKey}.`,
);
