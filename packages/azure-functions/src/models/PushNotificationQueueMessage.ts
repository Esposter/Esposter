import type { CompositeKey } from "@esposter/db-schema";

export interface PushNotificationQueueMessage extends CompositeKey {
  message: string;
  notificationOptions: {
    icon?: null | string;
    title?: null | string;
  };
}
