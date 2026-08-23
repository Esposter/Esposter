import type { SQL } from "drizzle-orm";

import { getBroadcastNotificationCondition } from "#src/services/message/mention/getBroadcastNotificationCondition";
import { or } from "drizzle-orm";

export const getBroadcastMentionConditions = (
  _db: unknown,
  _roomId: string,
  ids: string[],
): Promise<SQL | undefined> => {
  const conditions = ids
    .map((id) => getBroadcastNotificationCondition(id))
    .filter((condition) => condition !== undefined);
  return Promise.resolve(conditions.length > 0 ? or(...conditions) : undefined);
};
