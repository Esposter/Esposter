import type { Context } from "#server/trpc/context";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { broadcastAdminAction } from "#server/services/message/moderation/broadcastAdminAction";
import { publishTopics } from "#server/services/realtime/publishTopics";
import { executeAutomodAction as baseExecuteAutomodAction } from "@esposter/db";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// The in-process wrapper around the shared automod core: it tells the target's sockets what the action was, and publishes
// The room's topic, since the moderation log the action wrote is read through it. The message write this runs inside is
// Rejected, and a rejected mutation publishes nothing. The Scheduled-delivery function calls the core directly, and so
// Tells no one
export const executeAutomodAction = async (
  db: Context["db"],
  input: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs"> & { roomId: string; userId: string },
): Promise<void> => {
  const executedAutomodAction = await baseExecuteAutomodAction(db, input, console.error);
  if (!executedAutomodAction) return;

  // Best-effort behind the action, which has already landed: a failed publish costs the moderators a refetch
  await getResultAsync(() => publishTopics([getTopic(TopicKind.Room, input.roomId)])).match(noop, (error) => {
    console.error("Failed to publish the room's topic of an automod action:", error);
  });
  await broadcastAdminAction(input.roomId, {
    durationMs: executedAutomodAction.durationMs,
    targetUserId: input.userId,
    type: executedAutomodAction.type,
  });
};
