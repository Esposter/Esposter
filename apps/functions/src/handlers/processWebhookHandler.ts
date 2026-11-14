import { createAndBroadcastMessage } from "#src/services/message/createAndBroadcastMessage";
import { getWebhookCreateMessageInput } from "#src/services/message/getWebhookCreateMessageInput";
import { getJobQueue } from "#src/services/queue/getJobQueue";
import { AppNotificationType, publishNotification, QueueJob, webhookQueueMessageSchema } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// Not idempotent, so the queue does not redeliver it: a retry would write the message a second time
export const processWebhookHandler = async (body: unknown): Promise<void> => {
  const { payload, webhook } = webhookQueueMessageSchema.parse(body);
  const webhookCreateMessageInput = getWebhookCreateMessageInput(payload, webhook);
  const newMessage = await createAndBroadcastMessage(webhookCreateMessageInput);
  // Best-effort like the broadcast: the message is persisted, so a failed notification must not fail the delivery
  await getResultAsync(() =>
    publishNotification(getJobQueue(QueueJob.ProcessNotification), {
      appUserId: newMessage.appUser.id,
      message: {
        message: newMessage.message,
        partitionKey: newMessage.partitionKey,
        rowKey: newMessage.rowKey,
        userId: newMessage.userId,
      },
      threadRootRowKey: "",
      type: AppNotificationType.Message,
    }),
  ).match(
    () => {
      console.log(
        `Published ${AppNotificationType.Message} notification for message id: ${JSON.stringify({ partitionKey: newMessage.partitionKey, rowKey: newMessage.rowKey })}`,
      );
    },
    (error) => {
      console.error(`Failed to publish ${AppNotificationType.Message} notification: `, error);
    },
  );
};
