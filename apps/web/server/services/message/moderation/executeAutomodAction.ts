import type { Context } from "#server/trpc/context";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { broadcastAdminAction } from "#server/services/message/moderation/broadcastAdminAction";
import { publishTopicsBestEffort } from "#server/services/realtime/publishTopicsBestEffort";
import { executeAutomodAction as baseExecuteAutomodAction } from "@esposter/db";
import { getTopic, TopicKind } from "@esposter/db-schema";

// The in-process wrapper around the shared automod core: it tells the target's sockets what the action was, and publishes
// The room's topic, since the moderation log the action wrote is read through it. The message write this runs inside is
// Rejected, and a procedure that declares its topics by hand is not recorded, so no inferred publish names the log for it:
// Its declared topics name only what it declares. The Scheduled-delivery function calls the core directly, and so tells no one
export const executeAutomodAction = async (
  db: Context["db"],
  input: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs"> & { roomId: string; userId: string },
): Promise<void> => {
  const executedAutomodAction = await baseExecuteAutomodAction(db, input, console.error);
  if (!executedAutomodAction) return;

  // Best-effort behind the action, which has already landed: a failed publish costs the moderators a refetch
  await publishTopicsBestEffort(
    () => [{ topic: getTopic(TopicKind.Room, input.roomId) }],
    "Failed to publish the room's topic of an automod action:",
  );
  await broadcastAdminAction(input.roomId, {
    durationMs: executedAutomodAction.durationMs,
    targetUserId: input.userId,
    type: executedAutomodAction.type,
  });
};
