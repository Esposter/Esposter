import type { EventGridHandler } from "@azure/functions";
import type { PushNotificationEventGridData } from "@esposter/db-schema";

import { webhookEventGridDataSchema } from "@/models/WebhookEventGridData";
import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { getTableClient } from "@/services/getTableClient";
import { getWebhookCreateMessageInput } from "@/services/getWebhookCreateMessageInput";
import { getWebPubSubServiceClient } from "@/services/getWebPubSubServiceClient";
import { createMessage } from "@esposter/db";
import { AzureFunction, AzureTable, AzureWebPubSubHub } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const processWebhookHandler: EventGridHandler = (event, context) => {
  context.log(`${AzureFunction.ProcessWebhook} processed message: `, event.data);
  return getResultAsync(async () => {
    const { payload, webhook } = webhookEventGridDataSchema.parse(event.data);
    const messageClient = await getTableClient(AzureTable.Messages);
    const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
    const webhookCreateMessageInput = getWebhookCreateMessageInput(payload, webhook);
    const newMessage = await createMessage(messageClient, messageAscendingClient, webhookCreateMessageInput);
    const webPubSubServiceClient = getWebPubSubServiceClient(AzureWebPubSubHub.Messages);
    await webPubSubServiceClient.group(newMessage.partitionKey).sendToAll(newMessage);

    const data: PushNotificationEventGridData = {
      message: {
        message: newMessage.message,
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
        userId: newMessage.userId,
      },
      notificationOptions: { icon: newMessage.appUser.image, title: newMessage.appUser.name },
    };
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
  }).match(noop, (error) => {
    context.error(`${AzureFunction.ProcessWebhook} failed: `, error);
    throw error;
  });
};
