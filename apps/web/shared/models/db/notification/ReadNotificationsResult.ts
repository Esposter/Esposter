import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { NotificationInNotification } from "@esposter/db-schema";

export interface ReadNotificationsResult {
  paginationData: CursorPaginationData<NotificationInNotification>;
  // Every unread row, not the unread rows this page happens to hold — the badge counts across pages
  unreadCount: number;
}
