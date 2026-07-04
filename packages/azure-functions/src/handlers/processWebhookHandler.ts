import type { EventGridHandler } from "@azure/functions";

import { webhookEventGridDataSchema } from "@/models/WebhookEventGridData";
import { createAndBroadcastMessage } from "@/services/createAndBroadcastMessage";
import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { getPushNotificationData } from "@/services/getPushNotificationData";
import { getWebhookCreateMessageInput } from "@/services/getWebhookCreateMessageInput";
import { logAndRethrow } from "@/services/logAndRethrow";
import { AzureFunction } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const processWebhookHandler: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ProcessWebhook} processed message: `, event.data);
  return getResultAsync(async () => {
    const { payload, webhook } = webhookEventGridDataSchema.parse(event.data);
    const webhookCreateMessageInput = getWebhookCreateMessageInput(payload, webhook);
    const newMessage = await createAndBroadcastMessage(webhookCreateMessageInput);
    const data = getPushNotificationData(newMessage, {
      icon: newMessage.appUser.image,
      title: newMessage.appUser.name,
    });
    await eventGridPublisherClient.send([
      {
        data,
        dataVersion: "1.0",
        eventType: AzureFunction.ProcessPushNotification,
        subject: `${newMessage.partitionKey}/${newMessage.rowKey}`,
      },
    ]);
    context.log(
      `Pushed to ${AzureFunction.ProcessPushNotification} for message id: ${JSON.stringify({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey })}`,
    );
  }).match(noop, logAndRethrow(context, AzureFunction.ProcessWebhook));
};
