import type { Context } from "#server/trpc/context";

import { rejectMessageCreation } from "#server/services/message/moderation/rejectMessageCreation";
import { getMessageCreationRejection } from "@esposter/db";

// The tRPC face of the shared message-creation rules — the decision itself lives in `@esposter/db` so the
// Function worker's delivery path cannot drift from what the composer enforces.
export const assertCanCreateMessage = async (
  db: Context["db"],
  userId: string,
  roomId: string,
  message?: string,
): Promise<void> =>
  rejectMessageCreation(db, userId, roomId, await getMessageCreationRejection(db, userId, roomId, message));
