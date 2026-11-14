import type { Context } from "#server/trpc/context";

import { callSessionParticipantMap } from "#server/services/message/call/callSessionParticipantMap";

// Every call a room is running — its own and one per thread — with the live participants of each and the RealtimeKit
// meeting they are in. A moderation action reaches all of them, since the call a member is in may be a thread's rather
// Than the room's own
export const readRoomCallParticipantMaps = async (db: Context["db"], roomId: string) => {
  const callSessions = await db.query.callSessionsInMessage.findMany({
    columns: { id: true, meetingId: true },
    where: { roomId: { eq: roomId } },
  });
  return callSessions.flatMap(({ id, meetingId }) => {
    const participantMap = callSessionParticipantMap.get(id);
    return participantMap ? [{ callSessionId: id, meetingId, participantMap }] : [];
  });
};
