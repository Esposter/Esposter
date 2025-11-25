import type { PushNotificationEventGridData } from "@esposter/db-schema";

import { pushNotification } from "@/services/pushNotification";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessPushNotification, {
  handler: async (event, context) => {
    context.log(`${AzureFunction.ProcessPushNotification} processed message: `, event.data);
    const data = event.data as unknown as PushNotificationEventGridData;

    try {
      await pushNotification(context, data);
      context.log(`Successfully processed push notifications for room ${data.message.partitionKey}.`);
    } catch (error) {
      context.error(`Failed to process push notifications for room ${data.message.partitionKey}: `, error);
      throw error;
    }
  },
});

export default {};
