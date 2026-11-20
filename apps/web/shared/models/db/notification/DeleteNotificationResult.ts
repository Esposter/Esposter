import type { NotificationInNotification } from "@esposter/db-schema";

// A dismissed notification as the tombstone its dismissal left, with the unread total the dismissal leaves
export interface DeleteNotificationResult {
  notification: NotificationInNotification;
  unreadCount: number;
}
