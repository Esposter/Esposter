import type { SQL } from "drizzle-orm";

import { getBroadcastNotificationCondition } from "#src/services/message/mention/getBroadcastNotificationCondition";
import { or } from "drizzle-orm";

// `or` drops the ids that name no broadcast and collapses an empty list to undefined itself, which is the
// Same answer every other condition builder here gives for nothing to match
export const getBroadcastMentionConditions = (_db: unknown, _roomId: string, ids: string[]): Promise<SQL | undefined> =>
  Promise.resolve(or(...ids.map((id) => getBroadcastNotificationCondition(id))));
