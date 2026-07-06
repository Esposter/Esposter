import type { SQL } from "drizzle-orm";

import { getDirectMessageNotificationCondition } from "@/services/message/mention/getDirectMessageNotificationCondition";

export const getUserMentionCondition = (_db: unknown, _roomId: string, ids: string[]): Promise<SQL | undefined> =>
  Promise.resolve(getDirectMessageNotificationCondition(ids));
