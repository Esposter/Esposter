import type { SQL } from "drizzle-orm";

import { NotificationType, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

export const getUserMentionCondition = (_db: unknown, _roomId: string, ids: string[]): Promise<SQL | undefined> =>
  Promise.resolve(
    ids.length > 0
      ? and(
          eq(usersToRoomsInMessage.notificationType, NotificationType.DirectMessage),
          inArray(usersToRoomsInMessage.userId, ids),
        )
      : undefined,
  );
