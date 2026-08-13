import type { EventGridHandler } from "@azure/functions";

import { createEventGridNotificationHandler } from "@/handlers/createEventGridNotificationHandler";
import { sendThreadReplyNotification } from "@/services/sendThreadReplyNotification";
import { AzureFunction, threadReplyNotificationEventGridDataSchema } from "@esposter/db-schema";

export const processThreadReplyNotificationHandler: EventGridHandler = createEventGridNotificationHandler(
  AzureFunction.ProcessThreadReplyNotification,
  threadReplyNotificationEventGridDataSchema,
  sendThreadReplyNotification,
  (data) => `Successfully processed thread reply notification for room ${data.message.partitionKey}.`,
);
