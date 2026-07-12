import type { SQL } from "drizzle-orm";

import { getMentionedUserIdCondition } from "@/services/message/mention/getMentionedUserIdCondition";

export const getUserMentionBadgeCondition = (_db: unknown, _roomId: string, ids: string[]): Promise<SQL | undefined> =>
  Promise.resolve(getMentionedUserIdCondition(ids));
