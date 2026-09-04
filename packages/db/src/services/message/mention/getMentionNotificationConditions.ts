import type { Database } from "@esposter/db-schema";
import type { ClassifiedMentions } from "@esposter/shared";
import type { SQL } from "drizzle-orm";

import { getMentionConditions } from "#src/services/message/mention/getMentionConditions";
import { MentionNotificationConditionBuilderMap } from "#src/services/message/mention/MentionNotificationConditionBuilderMap";

export const getMentionNotificationConditions = (
  db: Database,
  roomId: string,
  classifiedMentions: ClassifiedMentions,
): Promise<(SQL | undefined)[]> =>
  getMentionConditions(db, roomId, classifiedMentions, MentionNotificationConditionBuilderMap);
