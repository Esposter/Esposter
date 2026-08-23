import type { EventGridHandler } from "@azure/functions";

import { createEventGridNotificationHandler } from "#src/handlers/createEventGridNotificationHandler";
import { sendThreadReplyNotification } from "#src/services/sendThreadReplyNotification";
import { AzureFunction, threadReplyNotificationEventGridDataSchema } from "@esposter/db-schema";

export const processThreadReplyNotificationHandler: EventGridHandler = createEventGridNotificationHandler(
  AzureFunction.ProcessThreadReplyNotification,
  threadReplyNotificationEventGridDataSchema,
  sendThreadReplyNotification,
  (data) => `Successfully processed thread reply notification for room ${data.message.partitionKey}.`,
);
