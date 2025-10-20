import type { MessageEntity } from "@/models/message/MessageEntity";

export interface PushNotificationQueueMessage {
  message: Pick<MessageEntity, "message" | "partitionKey" | "rowKey" | "userId">;
  notificationOptions: {
    icon?: null | string;
    title?: null | string;
  };
}
