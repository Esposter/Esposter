import type { MentionConditionBuilder } from "@/models/message/MentionConditionBuilder";
import type { ClassifiedMentions } from "@esposter/shared";
import type { SQL } from "drizzle-orm";

import { getBroadcastMentionConditions } from "@/services/message/mention/getBroadcastMentionConditions";
import { getRoleMemberIds } from "@/services/message/mention/getRoleMemberIds";
// Badge targeting and notification targeting resolve the same three mention kinds and differ only in the
// Condition a resolved set of user ids becomes, so that condition is the factory's one parameter.
export const createMentionConditionBuilders = (
  getUserIdsCondition: (userIds: string[]) => SQL | undefined,
): Record<keyof ClassifiedMentions, MentionConditionBuilder> => ({
  broadcastIds: getBroadcastMentionConditions,
  regularUserIds: (_db, _roomId, ids) => Promise.resolve(getUserIdsCondition(ids)),
  roleIds: async (db, roomId, ids) => {
    if (ids.length === 0) return undefined;
    return getUserIdsCondition(await getRoleMemberIds(db, roomId, ids));
  },
});
