import type { ClassifiedMentions } from "#src/models/message/ClassifiedMentions";
import type { Database } from "@esposter/db-schema";
import type { SQL } from "drizzle-orm";

import { getMentionConditions } from "#src/services/message/mention/getMentionConditions";
import { getMentionedUserIdCondition } from "#src/services/message/mention/getMentionedUserIdCondition";

// Direct and role mentions badge unconditionally; @everyone/@here follow the members' notification rules
// (Never opts out, @here requires online), same as push targeting
export const getMentionBadgeConditions = (
  db: Database,
  roomId: string,
  classifiedMentions: ClassifiedMentions,
): Promise<(SQL | undefined)[]> => getMentionConditions(db, roomId, classifiedMentions, getMentionedUserIdCondition);
