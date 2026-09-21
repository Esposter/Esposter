import type { ClassifiedMentions } from "#src/models/message/ClassifiedMentions";
import type { Database } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getDirectMessageNotificationCondition } from "#src/services/message/mention/getDirectMessageNotificationCondition";
import { getMentionConditions } from "#src/services/message/mention/getMentionConditions";

export const getMentionNotificationConditions = (
  db: Database,
  roomId: string,
  classifiedMentions: ClassifiedMentions,
): Promise<(SQL | undefined)[]> =>
  getMentionConditions(db, roomId, classifiedMentions, getDirectMessageNotificationCondition);
