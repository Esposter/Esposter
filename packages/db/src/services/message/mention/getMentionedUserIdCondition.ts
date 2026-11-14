import type { SQL } from "drizzle-orm";

import { inJsonArray } from "#src/services/shared/inJsonArray";
import { usersToRoomsInMessage } from "@esposter/db-schema";

// Badge counterpart of getDirectMessageNotificationCondition — a direct mention always badges the
// Member regardless of their notification preference (Discord behaviour).
export const getMentionedUserIdCondition = (userIds: string[]): SQL | undefined =>
  userIds.length > 0 ? inJsonArray(usersToRoomsInMessage.userId, userIds) : undefined;
