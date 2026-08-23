import type { EventGridHandler } from "@azure/functions";

import { webhookEventGridDataSchema } from "#src/models/WebhookEventGridData";
import { createAndBroadcastMessage } from "#src/services/createAndBroadcastMessage";
import { eventGridPublisherClient } from "#src/services/eventGridPublisherClient";
import { getPushNotificationData } from "#src/services/getPushNotificationData";
import { getWebhookCreateMessageInput } from "#src/services/getWebhookCreateMessageInput";
import { logAndRethrow } from "#src/services/logAndRethrow";
import { AzureFunction, createEventGridEvent } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const processWebhookHandler: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ProcessWebhook} processed message: `, event.data);
  return getResultAsync(async () => {
    const { payload, webhook } = webhookEventGridDataSchema.parse(event.data);
    const webhookCreateMessageInput = getWebhookCreateMessageInput(payload, webhook);
    const newMessage = await createAndBroadcastMessage(context, webhookCreateMessageInput);
    const data = getPushNotificationData(newMessage, {
      icon: newMessage.appUser.image,
      title: newMessage.appUser.name,
    });
    // Best-effort like the broadcast: the message is persisted, so a push-dispatch failure must not
    // Replay the event and duplicate the message.
    await getResultAsync(() =>
      eventGridPublisherClient.send([
        createEventGridEvent(
          AzureFunction.ProcessPushNotification,
          `${newMessage.partitionKey}/${newMessage.rowKey}`,
          data,
        ),
      ]),
    ).match(
      () => {
        context.log(
          `Pushed to ${AzureFunction.ProcessPushNotification} for message id: ${JSON.stringify({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey })}`,
        );
      },
      (error) => {
        context.error(`Failed to push to ${AzureFunction.ProcessPushNotification}: `, error);
      },
    );
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessWebhook));
};
