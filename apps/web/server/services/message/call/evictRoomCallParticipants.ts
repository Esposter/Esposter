import type { Context } from "#server/trpc/context";

import { removeLiveKitParticipant } from "#server/services/livekit/removeLiveKitParticipant";
import { leaveCallAsParticipant } from "#server/services/message/call/leaveCallAsParticipant";
import { readRoomCallParticipantMaps } from "#server/services/message/call/readRoomCallParticipantMaps";

// Takes a member out of every call in a room on the server's authority rather than their client's: a client that
// Ignored the admin action would otherwise stay connected and publishing. Each connection leaves the way every
// Other departure does, then is dropped at the SFU. The participants are copied out first, because a leave deletes
// From the map being read
export const evictRoomCallParticipants = async (db: Context["db"], roomId: string, userId: string) => {
  const roomCallParticipantMaps = await readRoomCallParticipantMaps(db, roomId);
  await Promise.all(
    roomCallParticipantMaps.flatMap(([callSessionId, participantMap]) =>
      [...participantMap]
        .filter(([, participant]) => participant.userId === userId)
        .map(async ([id]) => {
          await leaveCallAsParticipant(db, callSessionId, id, userId);
          await removeLiveKitParticipant(callSessionId, id);
        }),
    ),
  );
};
