import type { ExecutedAutomodAction } from "#src/models/message/moderation/ExecutedAutomodAction";
import type { Database, RoomFilterInMessage } from "@esposter/db-schema";

import { writeModerationLogEntry } from "#src/services/message/moderation/writeModerationLogEntry";
import { AdminActionType, AUTOMOD_USER_ID, usersToRoomsInMessage, WordFilterAction } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq, sql } from "drizzle-orm";

// Runs the automatic moderation action configured on a word filter when a non-privileged message matches.
// The message itself is always rejected by the caller — this only records/executes the follow-up action, so
// Every path that blocks a message (live send, forward, scheduled delivery) applies the same consequence.
// Returns what it did so an in-process caller can fan the action out to its subscriptions.
export const executeAutomodAction = async (
  db: Database,
  {
    action,
    roomId,
    timeoutDurationMs,
    userId,
  }: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs"> & { roomId: string; userId: string },
  // The host's own sink, because this core runs in two of them: a swallowed failure written to bare `console`
  // From the Function host is attributable to no invocation, so the moderator sees a member timed out with
  // Nothing in the audit log and nothing anywhere saying why
  onError: (error: unknown) => void,
): Promise<ExecutedAutomodAction | undefined> => {
  if (action === WordFilterAction.Reject) return undefined;

  const durationMs = action === WordFilterAction.Timeout && timeoutDurationMs ? timeoutDurationMs : undefined;
  if (durationMs) {
    const timeoutUntil = new Date(Date.now() + durationMs);
    // Extend-only: MAX never shortens a longer moderator-applied timeout with a shorter automod one. SQLite's MAX of
    // several values is NULL if any is NULL, so a null existing timeout is read as the epoch and the new date wins
    await db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: sql`MAX(COALESCE(${usersToRoomsInMessage.timeoutUntil}, 0), ${timeoutUntil.getTime()})` })
      .where(and(eq(usersToRoomsInMessage.userId, userId), eq(usersToRoomsInMessage.roomId, roomId)));
  }

  const type = action === WordFilterAction.Timeout ? AdminActionType.TimeoutUser : AdminActionType.Warn;
  // The audit-log write is best-effort — a logging failure must never turn the block into a 500.
  await getResultAsync(async () =>
    writeModerationLogEntry(db, {
      actorUserId: AUTOMOD_USER_ID,
      durationMs: durationMs ?? null,
      roomId,
      targetUserId: userId,
      type,
    }),
  ).match(noop, onError);
  return { durationMs, type };
};
