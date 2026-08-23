import type { MentionConditionBuilder } from "#src/models/message/MentionConditionBuilder";
import type { Database } from "@esposter/db-schema";
import type { ClassifiedMentions } from "@esposter/shared";
import type { SQL } from "drizzle-orm";

// Shared core for resolving classified mentions into SQL conditions — the notification and badge
// Variants differ only in the builders they plug in.
export const getMentionConditions = (
  db: Database,
  roomId: string,
  { broadcastIds, regularUserIds, roleIds }: ClassifiedMentions,
  builders: Record<keyof ClassifiedMentions, MentionConditionBuilder>,
): Promise<(SQL | undefined)[]> =>
  Promise.all([
    builders.broadcastIds(db, roomId, broadcastIds),
    builders.regularUserIds(db, roomId, regularUserIds),
    builders.roleIds(db, roomId, roleIds),
  ]);
