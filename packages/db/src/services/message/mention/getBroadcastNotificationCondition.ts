import type { SQL } from "drizzle-orm";

import { NotificationType, UserStatus, userStatusesInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { MENTION_EVERYONE_ID, MENTION_HERE_ID } from "@esposter/shared";
import { and, eq, isNull, ne, or } from "drizzle-orm";

const broadcastConditions: Record<string, SQL | undefined> = {
  [MENTION_EVERYONE_ID]: ne(usersToRoomsInMessage.notificationType, NotificationType.Never),
  [MENTION_HERE_ID]: and(
    ne(usersToRoomsInMessage.notificationType, NotificationType.Never),
    or(eq(userStatusesInMessage.status, UserStatus.Online), isNull(userStatusesInMessage.status)),
  ),
};

export const getBroadcastNotificationCondition = (id: string): SQL | undefined => broadcastConditions[id];
