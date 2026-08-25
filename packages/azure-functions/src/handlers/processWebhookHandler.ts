import type { EventGridHandler } from "@azure/functions";

import { webhookEventGridDataSchema } from "#src/models/WebhookEventGridData";
import { createAndBroadcastMessage } from "#src/services/createAndBroadcastMessage";
import { eventGridPublisherClient } from "#src/services/eventGridPublisherClient";
import { getWebhookCreateMessageInput } from "#src/services/getWebhookCreateMessageInput";
import { logAndRethrow } from "#src/services/logAndRethrow";
import { AppNotificationType, AzureFunction, publishNotification } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const processWebhookHandler: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ProcessWebhook} processed message: `, event.data);
  return getResultAsync(async () => {
    const { payload, webhook } = webhookEventGridDataSchema.parse(event.data);
    const webhookCreateMessageInput = getWebhookCreateMessageInput(payload, webhook);
    const newMessage = await createAndBroadcastMessage(context, webhookCreateMessageInput);
    // Best-effort like the broadcast: the message is persisted, so a publish failure must not
    // Replay the event and duplicate the message.
    await getResultAsync(() =>
      publishNotification(eventGridPublisherClient, {
        appUserId: newMessage.appUser.id,
        message: {
          message: newMessage.message,
          partitionKey: newMessage.partitionKey,
          rowKey: newMessage.rowKey,
          userId: newMessage.userId,
        },
        type: AppNotificationType.Message,
      }),
    ).match(
      () => {
        context.log(
          `Published ${AppNotificationType.Message} notification for message id: ${JSON.stringify({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey })}`,
        );
      },
      (error) => {
        context.error(`Failed to publish ${AppNotificationType.Message} notification: `, error);
      },
    );
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessWebhook));
};
