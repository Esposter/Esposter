import type { User } from "@esposter/db-schema";

import { notifications } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

export const getUnreadNotificationsWhere = (userId: User["id"]) =>
  and(eq(notifications.userId, userId), eq(notifications.isRead, false));
