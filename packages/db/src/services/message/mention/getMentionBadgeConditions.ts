import type { ClassifiedMentions } from "#src/models/message/ClassifiedMentions";
import type { Database } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getMentionConditions } from "#src/services/message/mention/getMentionConditions";
import { MentionBadgeConditionBuilderMap } from "#src/services/message/mention/MentionBadgeConditionBuilderMap";

export const getMentionBadgeConditions = (
  db: Database,
  roomId: string,
  classifiedMentions: ClassifiedMentions,
): Promise<(SQL | undefined)[]> =>
  getMentionConditions(db, roomId, classifiedMentions, MentionBadgeConditionBuilderMap);
