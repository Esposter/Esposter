import type { Context } from "#server/trpc/context";
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callSessionParticipantMap } from "#server/services/message/call/callSessionParticipantMap";

// Every call a room is running — its own and one per thread — with the live participants of each. A moderation
// Action reaches all of them, since the call a member is in may be a thread's rather than the room's own
export const readRoomCallParticipantMaps = async (
  db: Context["db"],
  roomId: string,
): Promise<(readonly [string, Map<string, CallParticipant>])[]> => {
  const callSessions = await db.query.callSessionsInMessage.findMany({
    columns: { id: true },
    where: { roomId: { eq: roomId } },
  });
  return callSessions.flatMap(({ id }) => {
    const participantMap = callSessionParticipantMap.get(id);
    return participantMap ? [[id, participantMap] as const] : [];
  });
};
