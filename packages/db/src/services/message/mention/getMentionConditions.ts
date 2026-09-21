import type { ClassifiedMentions } from "#src/models/message/ClassifiedMentions";
import type { Database } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getBroadcastNotificationCondition } from "#src/services/message/mention/getBroadcastNotificationCondition";
import { getRoleMemberIds } from "#src/services/message/mention/getRoleMemberIds";
import { or } from "drizzle-orm";

// Badge targeting and notification targeting resolve the same three mention kinds and differ only in the
// Condition a resolved set of user ids becomes, so that condition is the one parameter. `or` drops the ids
// That name no broadcast and collapses an empty list to undefined itself, which is the same answer the other
// Two give for nothing to match
export const getMentionConditions = async (
  db: Database,
  roomId: string,
  { broadcastIds, regularUserIds, roleIds }: ClassifiedMentions,
  getUserIdsCondition: (userIds: string[]) => SQL | undefined,
): Promise<(SQL | undefined)[]> => [
  or(...broadcastIds.map((id) => getBroadcastNotificationCondition(id))),
  getUserIdsCondition(regularUserIds),
  roleIds.length === 0 ? undefined : getUserIdsCondition(await getRoleMemberIds(db, roomId, roleIds)),
];
