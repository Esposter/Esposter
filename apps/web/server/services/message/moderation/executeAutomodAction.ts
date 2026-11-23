import type { Context } from "#server/trpc/context";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { broadcastAdminAction } from "#server/services/message/moderation/broadcastAdminAction";
import { executeAutomodAction as baseExecuteAutomodAction } from "@esposter/db";

// The in-process wrapper around the shared automod core: it tells the target's sockets what the action was. The moderation
// Log the core writes goes through the handle the caller passed, which records it, so the log's readers are woken by that
// Write like any other's, and no topic is published here by hand
export const executeAutomodAction = async (
  db: Context["db"],
  input: { roomId: string; userId: string } & Pick<RoomFilterInMessage, "action" | "timeoutDurationMs">,
): Promise<void> => {
  const executedAutomodAction = await baseExecuteAutomodAction(db, input, console.error);
  if (!executedAutomodAction) return;

  await broadcastAdminAction(input.roomId, {
    durationMs: executedAutomodAction.durationMs,
    targetUserId: input.userId,
    type: executedAutomodAction.type,
  });
};
