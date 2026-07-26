import type { ExecutedAutomodAction } from "@/models/message/moderation/ExecutedAutomodAction";
import type { CustomTableClient, ModerationLogEntity, relations, RoomFilterInMessage } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { writeModerationLogEntry } from "@/services/message/moderation/writeModerationLogEntry";
import { AdminActionType, AUTOMOD_USER_ID, usersToRoomsInMessage, WordFilterAction } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { and, eq, sql } from "drizzle-orm";
// Runs the automatic moderation action configured on a word filter when a non-privileged message matches.
// The message itself is always rejected by the caller — this only records/executes the follow-up action, so
// Every path that blocks a message (live send, forward, scheduled delivery) applies the same consequence.
// Returns what it did so an in-process caller can fan the action out to its subscriptions.
export const executeAutomodAction = async (
  db: PostgresJsDatabase<typeof relations>,
  // Resolved lazily so a Reject filter — the common case, which has no follow-up action — never builds a client
  getModerationLogClient: () => Promise<CustomTableClient<ModerationLogEntity>>,
  {
    action,
    roomId,
    timeoutDurationMs,
    userId,
  }: Pick<RoomFilterInMessage, "action" | "timeoutDurationMs"> & {
    roomId: string;
    userId: string;
  },
): Promise<ExecutedAutomodAction | undefined> => {
  if (action === WordFilterAction.Reject) return undefined;

  const durationMs = action === WordFilterAction.Timeout && timeoutDurationMs ? timeoutDurationMs : undefined;
  if (durationMs) {
    const timeoutUntil = new Date(Date.now() + durationMs);
    // Extend-only: GREATEST never shortens a longer moderator-applied timeout with a shorter automod one.
    // Postgres GREATEST ignores NULL, so a null/expired existing timeout becomes the new date.
    await db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: sql`GREATEST(${usersToRoomsInMessage.timeoutUntil}, ${timeoutUntil})` })
      .where(and(eq(usersToRoomsInMessage.userId, userId), eq(usersToRoomsInMessage.roomId, roomId)));
  }

  const type = action === WordFilterAction.Timeout ? AdminActionType.TimeoutUser : AdminActionType.Warn;
  // The audit-log write is best-effort — a logging failure must never turn the block into a 500.
  await getResultAsync(async () =>
    writeModerationLogEntry(await getModerationLogClient(), {
      actorUserId: AUTOMOD_USER_ID,
      durationMs,
      roomId,
      targetUserId: userId,
      type,
    }),
  ).match(noop, console.error);
  return { durationMs, type };
};
