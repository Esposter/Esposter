import type { WebhookQueueMessage } from "@/functions/webhook";

import { webhookQueueName } from "@/functions/webhook";
import { app } from "@azure/functions";

app.storageQueue("processWebhook", {
  connection: "AzureWebJobsStorage",
  handler: (queueItem, context) => {
    context.log("Queue trigger function processed message: ", queueItem);
    const { payload: _, webhookId: __ } = queueItem as WebhookQueueMessage;
    // @TODO: Add your logic here to send the message to Discord, Teams, etc.
    // using the webhookId to look up the specific URL and the payload for the content.
  },
  queueName: webhookQueueName,
});
