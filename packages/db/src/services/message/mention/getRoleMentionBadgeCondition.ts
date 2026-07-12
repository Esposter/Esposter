import type { relations } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getMentionedUserIdCondition } from "@/services/message/mention/getMentionedUserIdCondition";
import { getRoleMemberIds } from "@/services/message/mention/getRoleMemberIds";

export const getRoleMentionBadgeCondition = async (
  db: PostgresJsDatabase<typeof relations>,
  roomId: string,
  ids: string[],
): Promise<SQL | undefined> => {
  if (ids.length === 0) return undefined;
  const memberIds = await getRoleMemberIds(db, roomId, ids);
  return getMentionedUserIdCondition(memberIds);
};
