import type { Context } from "#server/trpc/context";

// Every call a room is running, its own and one per thread, since a moderation action reaches all of them: the call a
// member is in may be a thread's rather than the room's own
export const readRoomCallSessionIds = async (db: Context["db"], roomId: string): Promise<string[]> => {
  const callSessions = await db.query.callSessionsInMessage.findMany({
    columns: { id: true },
    where: { roomId: { eq: roomId } },
  });
  return callSessions.map(({ id }) => id);
};
