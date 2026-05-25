import type { relations } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getRoleMemberIds } from "@/services/message/mention/getRoleMemberIds";
import { NotificationType, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, inArray } from "drizzle-orm";

export const getRoleMentionCondition = async (
  db: PostgresJsDatabase<typeof relations>,
  roomId: string,
  ids: string[],
): Promise<SQL | undefined> => {
  if (ids.length === 0) return undefined;
  const memberIds = await getRoleMemberIds(db, roomId, ids);
  return memberIds.length > 0
    ? and(
        eq(usersToRoomsInMessage.notificationType, NotificationType.DirectMessage),
        inArray(usersToRoomsInMessage.userId, memberIds),
      )
    : undefined;
};
