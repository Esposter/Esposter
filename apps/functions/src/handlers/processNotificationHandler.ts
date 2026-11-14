import { sendNotification } from "#src/services/notification/sendNotification";
import { notificationQueueMessageSchema } from "@esposter/db-schema";

// Delivers one notification. The send is the one step that may fail the delivery, so a throw is the queue's retry request
export const processNotificationHandler = async (body: unknown): Promise<void> => {
  const data = notificationQueueMessageSchema.parse(body);
  await sendNotification(data);
  console.log(`Successfully processed ${data.type} notification.`);
};
