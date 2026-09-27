import type { Context } from "@@/server/trpc/context";

// Whether a connection LiveKit reports may stay in its call. A token outlives the membership it was minted for, and
// LiveKit lets a removed participant rejoin on it, so a room call asks the room's door again on every connection.
// A standalone call has no room and was admitted when its token was minted; a session with no row is a call that
// No longer exists
export const checkIsCallConnectionAdmitted = async (
  db: Context["db"],
  callSessionId: string,
  userId: string,
): Promise<boolean> => {
  const callSession = await db.query.callSessionsInMessage.findFirst({
    columns: { roomId: true },
    where: { id: { eq: callSessionId } },
  });
  if (!callSession) return false;
  else if (!callSession.roomId) return true;

  const userToRoom = await db.query.usersToRoomsInMessage.findFirst({
    columns: { userId: true },
    where: { roomId: { eq: callSession.roomId }, userId: { eq: userId } },
  });
  return Boolean(userToRoom);
};
