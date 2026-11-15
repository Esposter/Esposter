import type { Database } from "@esposter/db-schema";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { useUserObject } from "#server/composables/realtime/useUserObject";
import { writeCallSummary } from "#server/services/message/call/writeCallSummary";
import { callSessionsInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { eq, inArray, or } from "drizzle-orm";

// A revoked session keeps no socket open on any object the person reaches: their own, each room they are a member of,
// Each call they made or sit in a room of, and each call without a room they were admitted to. Each object closes the
// Session's sockets on its own, and one object's failure costs that object alone, since the session is already removed
// When this runs. The call query matches the person's rooms in a subquery rather than binding them as a list, so the
// Query reads the same for one room or for many
export const closeSessionSockets = async (db: Database, userId: string, sessionId: string): Promise<void> => {
  const memberRoomIds = db
    .select({ roomId: usersToRoomsInMessage.roomId })
    .from(usersToRoomsInMessage)
    .where(eq(usersToRoomsInMessage.userId, userId));
  // A failed read of the joined calls costs the calls it names and no other object: the closes below still run, and the
  // Failure is logged
  const [memberRooms, callSessionRows, joinedCallIds] = await Promise.all([
    memberRoomIds,
    db
      .select({ id: callSessionsInMessage.id })
      .from(callSessionsInMessage)
      .where(or(eq(callSessionsInMessage.userId, userId), inArray(callSessionsInMessage.roomId, memberRoomIds))),
    getResultAsync(() => useUserObject(userId).readJoinedCallIds()).match(
      (ids) => ids,
      (error) => {
        console.error("Joined calls failed to read for a revoked session", { error, sessionId, userId });
        return [];
      },
    ),
  ]);
  const roomIds = memberRooms.map(({ roomId }) => roomId);
  const callSessionIds = [...new Set([...callSessionRows.map(({ id }) => id), ...joinedCallIds])];

  await Promise.all([
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
  ]);
};
