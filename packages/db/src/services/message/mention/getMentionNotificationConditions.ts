import type { relations } from "@esposter/db-schema";
import type { ClassifiedMentions } from "@esposter/shared";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { MentionNotificationConditionBuilders } from "@/services/message/mention/MentionNotificationConditionBuilders";

export const getMentionNotificationConditions = (
  db: PostgresJsDatabase<typeof relations>,
  roomId: string,
  { broadcastIds, regularUserIds, roleIds }: ClassifiedMentions,
): Promise<(SQL | undefined)[]> =>
  Promise.all([
    MentionNotificationConditionBuilders.broadcastIds(db, roomId, broadcastIds),
    MentionNotificationConditionBuilders.regularUserIds(db, roomId, regularUserIds),
    MentionNotificationConditionBuilders.roleIds(db, roomId, roleIds),
  ]);
