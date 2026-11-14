import type { Context } from "#server/trpc/context";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { broadcastAdminAction } from "#server/services/message/moderation/broadcastAdminAction";
import { executeAutomodAction as baseExecuteAutomodAction } from "@esposter/db";

// The in-process wrapper around the shared automod core: it tells the target's sockets what the action was. The
// scheduled-delivery function calls the core directly, and so tells no one
export const executeAutomodAction = async (
  db: Context["db"],
  input: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs"> & { roomId: string; userId: string },
): Promise<void> => {
  const executedAutomodAction = await baseExecuteAutomodAction(db, input, console.error);
  if (!executedAutomodAction) return;

  await broadcastAdminAction(input.roomId, {
    durationMs: executedAutomodAction.durationMs,
    targetUserId: input.userId,
    type: executedAutomodAction.type,
  });
};
