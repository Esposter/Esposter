import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { CALL_TRACK_SOURCES, SCREEN_SHARE_TRACK_SOURCES } from "@@/server/services/livekit/constants";
import { createLiveKitRoomServiceClient } from "@@/server/services/livekit/createLiveKitRoomServiceClient";
import { getResultAsync, noop } from "@esposter/shared";

export const stopLiveKitScreenShare = async (
  callSessionId: string,
  participantMap: Map<string, CallParticipant>,
  targetUserId: string,
) => {
  const roomServiceClient = createLiveKitRoomServiceClient();
  if (!roomServiceClient) return;

  await Promise.all(
    Array.from(participantMap, async ([id, { userId }]) => {
      if (userId !== targetUserId) return;
      await getResultAsync(async () => {
        await roomServiceClient.updateParticipant(callSessionId, id, {
          permission: {
            canPublish: true,
            canPublishData: true,
            canPublishSources: [...CALL_TRACK_SOURCES],
            canSubscribe: true,
          },
        });
        const participant = await roomServiceClient.getParticipant(callSessionId, id);
        const screenShareTracks = participant.tracks.filter(({ source }) =>
          SCREEN_SHARE_TRACK_SOURCES.includes(source),
        );
        await Promise.all(
          screenShareTracks.map(({ sid }) => roomServiceClient.mutePublishedTrack(callSessionId, id, sid, true)),
        );
      }).match(noop, console.error);
    }),
  );
};
