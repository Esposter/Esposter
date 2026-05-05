import type { PushNotificationEventGridData } from "@esposter/db-schema";

import { pushNotification } from "@/services/pushNotification";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";
import { toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

app.eventGrid(AzureFunction.ProcessPushNotification, {
  handler: (event, context) => {
    context.log(`${AzureFunction.ProcessPushNotification} processed message: `, event.data);
    const data = event.data as unknown as PushNotificationEventGridData;
    return ResultAsync.fromPromise(pushNotification(context, data), toAppError).match(
      () => {
        context.log(`Successfully processed push notifications for room ${data.message.partitionKey}.`);
      },
      (error) => {
        context.error(`Failed to process push notifications for room ${data.message.partitionKey}: `, error);
        throw error;
      },
    );
  },
});

export default {};
