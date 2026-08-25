import type { EventGridHandler } from "@azure/functions";

import { createEventGridNotificationHandler } from "#src/handlers/createEventGridNotificationHandler";
import { sendNotification } from "#src/services/notification/sendNotification";
import { AzureFunction, notificationEventGridDataSchema } from "@esposter/db-schema";

export const processNotificationHandler: EventGridHandler = createEventGridNotificationHandler(
  AzureFunction.ProcessNotification,
  notificationEventGridDataSchema,
  sendNotification,
  (data) => `Successfully processed ${data.type} notification.`,
);
