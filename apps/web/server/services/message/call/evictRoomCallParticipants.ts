import type { Context } from "#server/trpc/context";

import { getCallObject } from "#server/services/message/call/getCallObject";
import { readRoomCallSessionIds } from "#server/services/message/call/readRoomCallSessionIds";
import { writeCallSummary } from "#server/services/message/call/writeCallSummary";

// Takes a member out of every call in a room on the server's authority rather than their client's: a client that ignored
// the admin action would otherwise stay connected and publishing. Each call's object drops the member's connections, and
// the departure that ends a call writes its summary, the way every other departure does
export const evictRoomCallParticipants = async (db: Context["db"], roomId: string, userId: string) => {
  const callSessionIds = await readRoomCallSessionIds(db, roomId);
  await Promise.all(
    callSessionIds.map(async (callSessionId) => {
      const leaves = await getCallObject(callSessionId).evictUser({ callSessionId, userId });
      await Promise.all(leaves.map((leave) => writeCallSummary(db, callSessionId, leave)));
    }),
  );
};
