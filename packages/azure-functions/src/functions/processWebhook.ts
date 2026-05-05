import type { WebhookEventGridData } from "@/models/WebhookEventGridData";
import type { PushNotificationEventGridData } from "@esposter/db-schema";

import { eventGridPublisherClient } from "@/services/eventGridPublisherClient";
import { getTableClient } from "@/services/getTableClient";
import { getWebhookCreateMessageInput } from "@/services/getWebhookCreateMessageInput";
import { getWebPubSubServiceClient } from "@/services/getWebPubSubServiceClient";
import { app } from "@azure/functions";
import { createMessage } from "@esposter/db";
import { AzureFunction, AzureTable, AzureWebPubSubHub } from "@esposter/db-schema";
import { toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

app.eventGrid(AzureFunction.ProcessWebhook, {
  handler: (event, context) => {
    context.log(`${AzureFunction.ProcessWebhook} processed message: `, event.data);
    const { payload, webhook } = event.data as unknown as WebhookEventGridData;
    return ResultAsync.fromPromise(
      (async () => {
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
      })(),
      toAppError,
    ).match(
      () => undefined,
      (error) => {
        context.error(`${AzureFunction.ProcessWebhook} failed: `, error);
        throw error;
      },
    );
  },
});

export default {};
