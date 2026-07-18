import type { Context } from "@@/server/trpc/context";
import type { RoomFilterInMessage } from "@esposter/db-schema";

import { AUTOMOD_USER_ID } from "#shared/services/message/moderation/AUTOMOD_USER_ID";
import { moderationEventEmitter } from "@@/server/services/message/events/moderationEventEmitter";
import { writeModerationLogEntry } from "@@/server/services/message/moderation/writeModerationLogEntry";
import { AdminActionType, usersToRoomsInMessage, WordFilterAction } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

// Runs the automatic moderation action configured on a word filter when a non-privileged message matches.
// The message itself is always rejected by the caller — this only records/executes the follow-up action.
export const executeAutomodAction = async (
  db: Context["db"],
  {
    action,
    roomId,
    timeoutDurationMs,
    userId,
  }: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs"> & {
    roomId: string;
    userId: string;
  },
): Promise<void> => {
  if (action === WordFilterAction.Reject) return;

  const durationMs = action === WordFilterAction.Timeout && timeoutDurationMs ? timeoutDurationMs : undefined;
  if (durationMs)
    await db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: new Date(Date.now() + durationMs) })
      .where(and(eq(usersToRoomsInMessage.userId, userId), eq(usersToRoomsInMessage.roomId, roomId)));

  const type = action === WordFilterAction.Timeout ? AdminActionType.TimeoutUser : AdminActionType.Warn;
  // The audit-log write is best-effort — a logging failure must never turn the block into a 500.
  await getResultAsync(() =>
    writeModerationLogEntry({ actorUserId: AUTOMOD_USER_ID, durationMs, roomId, targetUserId: userId, type }),
  ).match(noop, console.error);
  moderationEventEmitter.emit("adminAction", { durationMs, roomId, targetUserId: userId, type });
};
