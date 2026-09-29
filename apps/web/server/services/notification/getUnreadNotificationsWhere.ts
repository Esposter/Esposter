import type { UserInAuth } from "@esposter/db-schema";

import { notificationsInNotification } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

export const getUnreadNotificationsWhere = (userId: UserInAuth["id"]) =>
  and(eq(notificationsInNotification.userId, userId), eq(notificationsInNotification.isRead, false));
