import type { SQL } from "drizzle-orm";

import { NotificationType, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

export const getDirectMessageNotificationCondition = (userIds: string[]): SQL | undefined =>
  userIds.length > 0
    ? and(
        eq(usersToRoomsInMessage.notificationType, NotificationType.DirectMessage),
        inArray(usersToRoomsInMessage.userId, userIds),
      )
    : undefined;
