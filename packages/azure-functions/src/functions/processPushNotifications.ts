import type { PushNotificationQueueMessage } from "@/models/PushNotificationQueueMessage";

import { PUSH_NOTIFICATION_STORAGE_QUEUE_OUTPUT } from "@/services/constants";
import { pushNotification } from "@/services/pushNotification";
import { app } from "@azure/functions";

const name = "processPushNotifications";

app.storageQueue(name, {
  connection: "AzureWebJobsStorage",
  handler: async (queueEntry, context) => {
    context.log(`${name} processed message: `, queueEntry);
    const pushNotificationQueueMessage = queueEntry as PushNotificationQueueMessage;

    try {
      await pushNotification(context, pushNotificationQueueMessage);
      context.log(`Successfully processed push notifications for room ${pushNotificationQueueMessage.partitionKey}.`);
    } catch (error) {
      context.error(
        `Failed to process push notifications for room ${pushNotificationQueueMessage.partitionKey}: `,
        error,
      );
      throw error;
    }
  },
  queueName: PUSH_NOTIFICATION_STORAGE_QUEUE_OUTPUT.queueName,
});
