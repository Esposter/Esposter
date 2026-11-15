import type { Database } from "@esposter/db-schema";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { useUserObject } from "#server/composables/realtime/useUserObject";
import { writeCallSummary } from "#server/services/message/call/writeCallSummary";
import { getResultAsync, noop } from "@esposter/shared";

// A revoked session keeps no socket open on any object the person reaches: their own, each room they are a member of,
// Each call they made or sit in a room of, and each call without a room they were admitted to. Each object closes the
// Sessions' sockets on its own, and one object's failure costs that object alone, since the session is already revoked
// When this runs
export const closeSessionSockets = async (db: Database, userId: string, sessionIds: string[]): Promise<void> => {
  if (sessionIds.length === 0) return;

  const roomIds = (
    await db.query.usersToRoomsInMessage.findMany({ columns: { roomId: true }, where: { userId: { eq: userId } } })
  ).map(({ roomId }) => roomId);
  const [callSessionRows, joinedCallIds] = await Promise.all([
    db.query.callSessionsInMessage.findMany({
      columns: { id: true },
      where: { OR: [{ userId: { eq: userId } }, { roomId: { in: roomIds } }] },
    }),
    useUserObject(userId).readJoinedCallIds(),
  ]);
  const callSessionIds = [...new Set([...callSessionRows.map(({ id }) => id), ...joinedCallIds])];

  await Promise.all(
    sessionIds.flatMap((sessionId) => [
      getResultAsync(() => useUserObject(userId).closeSession(sessionId)).match(noop, (error) => {
        console.error("Session sockets failed to close on the user object", { error, sessionId, userId });
      }),
      ...roomIds.map((roomId) =>
        getResultAsync(() => useRoomObject(roomId).closeSession(sessionId)).match(noop, (error) => {
          console.error("Session sockets failed to close on a room", { error, roomId, sessionId });
        }),
      ),
      ...callSessionIds.map((id) =>
        getResultAsync(() => useCallObject(id).closeSession(sessionId)).match(
          (leave) => (leave ? writeCallSummary(db, id, leave) : undefined),
          (error) => {
            console.error("Session sockets failed to close on a call", { callSessionId: id, error, sessionId });
          },
        ),
      ),
    ]),
  );
};
