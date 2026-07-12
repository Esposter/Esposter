import type { SQL } from "drizzle-orm";

import { usersToRoomsInMessage } from "@esposter/db-schema";
import { inArray } from "drizzle-orm";

// Badge counterpart of getDirectMessageNotificationCondition — a direct mention always badges the
// Member regardless of their notification preference (Discord behaviour).
export const getMentionedUserIdCondition = (userIds: string[]): SQL | undefined =>
  userIds.length > 0 ? inArray(usersToRoomsInMessage.userId, userIds) : undefined;
