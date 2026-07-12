import type { relations } from "@esposter/db-schema";
import type { ClassifiedMentions } from "@esposter/shared";
import type { SQL } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { getMentionConditions } from "@/services/message/mention/getMentionConditions";
import { MentionNotificationConditionBuilders } from "@/services/message/mention/MentionNotificationConditionBuilders";

export const getMentionNotificationConditions = (
  db: PostgresJsDatabase<typeof relations>,
  roomId: string,
  classifiedMentions: ClassifiedMentions,
): Promise<(SQL | undefined)[]> =>
  getMentionConditions(db, roomId, classifiedMentions, MentionNotificationConditionBuilders);
