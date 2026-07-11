import type { MentionConditionBuilder } from "@/models/message/MentionConditionBuilder";
import type { relations } from "@esposter/db-schema";
import type { ClassifiedMentions } from "@esposter/shared";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Shared core for resolving classified mentions into SQL conditions — the notification and badge
// Variants differ only in the builders they plug in.
export const getMentionConditions = (
  db: PostgresJsDatabase<typeof relations>,
  roomId: string,
  { broadcastIds, regularUserIds, roleIds }: ClassifiedMentions,
  builders: Record<keyof ClassifiedMentions, MentionConditionBuilder>,
): Promise<(SQL | undefined)[]> =>
  Promise.all([
    builders.broadcastIds(db, roomId, broadcastIds),
    builders.regularUserIds(db, roomId, regularUserIds),
    builders.roleIds(db, roomId, roleIds),
  ]);
