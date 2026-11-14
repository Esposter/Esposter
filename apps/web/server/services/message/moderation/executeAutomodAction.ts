import type { Context } from "#server/trpc/context";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { moderationEventEmitter } from "#server/services/message/events/moderationEventEmitter";
import { executeAutomodAction as baseExecuteAutomodAction } from "@esposter/db";

// The in-process wrapper around the shared automod core: it fans the executed action out to the moderation
// Subscriptions, which only exist in the app process — the scheduled-delivery function calls the core directly.
export const executeAutomodAction = async (
  db: Context["db"],
  input: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs"> & { roomId: string; userId: string },
): Promise<void> => {
  const executedAutomodAction = await baseExecuteAutomodAction(db, input, console.error);
  if (!executedAutomodAction) return;

  moderationEventEmitter.emit("adminAction", {
    durationMs: executedAutomodAction.durationMs,
    roomId: input.roomId,
    targetUserId: input.userId,
    type: executedAutomodAction.type,
  });
};
