import type { SQL } from "drizzle-orm";

import { inJsonArray } from "#src/services/shared/inJsonArray";
import { NotificationType, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq } from "drizzle-orm";

export const getDirectMessageNotificationCondition = (userIds: string[]): SQL | undefined =>
  userIds.length > 0
    ? and(
        eq(usersToRoomsInMessage.notificationType, NotificationType.DirectMessage),
        inJsonArray(usersToRoomsInMessage.userId, userIds),
      )
    : undefined;
