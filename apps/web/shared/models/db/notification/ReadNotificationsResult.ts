import type { NotificationInNotification, Page } from "@esposter/db-schema";

// A page of notifications, with the total of those unread
export interface ReadNotificationsResult extends Page<NotificationInNotification> {
  unreadCount?: number;
}
