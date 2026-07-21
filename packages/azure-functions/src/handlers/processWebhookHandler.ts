import type { EventGridHandler } from "@azure/functions";

import { webhookEventGridDataSchema } from "@/models/WebhookEventGridData";
import { createAndBroadcastMessage } from "@/services/createAndBroadcastMessage";
import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { getPushNotificationData } from "@/services/getPushNotificationData";
import { getWebhookCreateMessageInput } from "@/services/getWebhookCreateMessageInput";
import { logAndRethrow } from "@/services/logAndRethrow";
import { AzureFunction, EVENT_GRID_DATA_VERSION } from "@esposter/db-schema";
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
        {
          data,
          dataVersion: EVENT_GRID_DATA_VERSION,
          eventType: AzureFunction.ProcessPushNotification,
          subject: `${newMessage.partitionKey}/${newMessage.rowKey}`,
        },
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
