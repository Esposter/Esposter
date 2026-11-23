import type { Context } from "#server/trpc/context";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { writeCallSummary } from "#server/services/message/call/writeCallSummary";
import { readRoomCallSessionIds } from "#server/services/message/moderation/readRoomCallSessionIds";

// Takes a member out of every call in a room on the server's authority rather than their client's: a client that
// Ignored The admin action would otherwise stay connected and publishing. Each call's object drops the member's
// Connections, and The departure that ends a call writes its summary, the way every other departure does
export const evictRoomCallParticipants = async (db: Context["db"], roomId: string, userId: string) => {
  const callSessionIds = await readRoomCallSessionIds(db, roomId);
  await Promise.all(
    callSessionIds.map(async (callSessionId) => {
      const leaves = await useCallObject(callSessionId).evictUser({ callSessionId, userId });
      await Promise.all(leaves.map((leave) => writeCallSummary(db, callSessionId, leave)));
    }),
  );
};
