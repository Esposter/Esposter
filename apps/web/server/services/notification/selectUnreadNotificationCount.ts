import type { Context } from "#server/trpc/context";
import type { UserInAuth } from "@esposter/db-schema";

import { getUnreadNotificationsWhere } from "#server/services/notification/getUnreadNotificationsWhere";
import { notificationsInNotification } from "@esposter/db-schema";
import { count } from "drizzle-orm";

// The unread total as a query rather than a count, so a batch can carry it beside the write it settles
export const selectUnreadNotificationCount = (db: Context["db"], userId: UserInAuth["id"]) =>
  db.select({ count: count() }).from(notificationsInNotification).where(getUnreadNotificationsWhere(userId));
