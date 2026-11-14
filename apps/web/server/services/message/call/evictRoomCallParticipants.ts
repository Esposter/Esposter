import type { Context } from "#server/trpc/context";

import { leaveCallAsParticipant } from "#server/services/message/call/leaveCallAsParticipant";
import { readRoomCallParticipantMaps } from "#server/services/message/call/readRoomCallParticipantMaps";
import { removeRealtimeKitParticipant } from "#server/services/realtimeKit/removeRealtimeKitParticipant";
import { getResultAsync, noop } from "@esposter/shared";

// Takes a member out of every call in a room on the server's authority rather than their client's: a client that
// Ignored the admin action would otherwise stay connected and publishing. Each connection leaves the way every
// Other departure does, then is dropped at RealtimeKit. The participants are copied out first, because a leave deletes
// From the map being read. Best-effort at RealtimeKit: the leave has already landed, so a failed kick is logged
export const evictRoomCallParticipants = async (db: Context["db"], roomId: string, userId: string) => {
  const roomCallParticipantMaps = await readRoomCallParticipantMaps(db, roomId);
  await Promise.all(
    roomCallParticipantMaps.flatMap(({ callSessionId, meetingId, participantMap }) =>
      [...participantMap]
        .filter(([, participant]) => participant.userId === userId)
        .map(async ([id]) => {
          await leaveCallAsParticipant(db, callSessionId, id, userId);
          await getResultAsync(() => removeRealtimeKitParticipant(meetingId, id)).match(noop, console.error);
        }),
    ),
  );
};
