import type { relations } from "@esposter/db-schema";
import type { ClassifiedMentions } from "@esposter/shared";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getMentionConditions } from "@/services/message/mention/getMentionConditions";
import { MentionBadgeConditionBuilders } from "@/services/message/mention/MentionBadgeConditionBuilders";

export const getMentionBadgeConditions = (
  db: PostgresJsDatabase<typeof relations>,
  roomId: string,
  classifiedMentions: ClassifiedMentions,
): Promise<(SQL | undefined)[]> => getMentionConditions(db, roomId, classifiedMentions, MentionBadgeConditionBuilders);
