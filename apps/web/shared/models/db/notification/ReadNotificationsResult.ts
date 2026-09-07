import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { Notification } from "@esposter/db-schema";

export interface ReadNotificationsResult {
  paginationData: CursorPaginationData<Notification>;
  // Every unread row, not the unread rows this page happens to hold — the badge counts across pages
  unreadCount: number;
}
