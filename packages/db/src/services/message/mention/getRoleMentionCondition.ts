import type { relations } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getDirectMessageNotificationCondition } from "@/services/message/mention/getDirectMessageNotificationCondition";
import { getRoleMemberIds } from "@/services/message/mention/getRoleMemberIds";

export const getRoleMentionCondition = async (
  db: PostgresJsDatabase<typeof relations>,
  roomId: string,
  ids: string[],
): Promise<SQL | undefined> => {
  if (ids.length === 0) return undefined;
  const memberIds = await getRoleMemberIds(db, roomId, ids);
  return getDirectMessageNotificationCondition(memberIds);
};
