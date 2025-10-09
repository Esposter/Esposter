import type { WebhookQueueMessage } from "@/models/WebhookQueueMessage";

import { WEBHOOK_STORAGE_QUEUE_OUTPUT } from "@/services/constants";
import { app } from "@azure/functions";

app.storageQueue("processWebhook", {
  connection: "AzureWebJobsStorage",
  handler: (queueEntry, context) => {
    context.log("Queue trigger function processed message: ", queueEntry);
    const { id: __, payload: _ } = queueEntry as WebhookQueueMessage;
    // @TODO: Add your logic here to send the message to Discord, Teams, etc.
    // using the id to look up the specific URL and the payload for the content.
  },
  queueName: WEBHOOK_STORAGE_QUEUE_OUTPUT.queueName,
});

export default {};
