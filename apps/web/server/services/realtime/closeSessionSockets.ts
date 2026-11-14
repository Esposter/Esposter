import type { Database } from "@esposter/db-schema";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { useUserObject } from "#server/composables/realtime/useUserObject";
import { getResultAsync, noop } from "@esposter/shared";

// A revoked session keeps no socket open on any object the person reaches: their own, each room they are a member of
// And each call they made or sit in a room of. Each object closes the sessions' sockets on its own, and one object's
// Failure costs that object alone, since the session is already revoked when this runs
export const closeSessionSockets = async (db: Database, userId: string, sessionIds: string[]): Promise<void> => {
  if (sessionIds.length === 0) return;

  const roomIds = (
    await db.query.usersToRoomsInMessage.findMany({ columns: { roomId: true }, where: { userId: { eq: userId } } })
  ).map(({ roomId }) => roomId);
  const callSessions = await db.query.callSessionsInMessage.findMany({
    columns: { id: true },
    where: { OR: [{ userId: { eq: userId } }, { roomId: { in: roomIds } }] },
  });

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
      ...callSessions.map(({ id }) =>
        getResultAsync(() => useCallObject(id).closeSession(sessionId)).match(noop, (error) => {
          console.error("Session sockets failed to close on a call", { callSessionId: id, error, sessionId });
        }),
      ),
    ]),
  );
};
