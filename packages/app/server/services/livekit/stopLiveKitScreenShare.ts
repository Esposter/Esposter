import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { createLiveKitRoomServiceClient } from "@@/server/services/livekit/createLiveKitRoomServiceClient";
import { getResultAsync, noop } from "@esposter/shared";
import { TrackSource } from "livekit-server-sdk";

export const stopLiveKitScreenShare = async (callSessionId: string, participants: CallParticipant[]) => {
  const roomServiceClient = createLiveKitRoomServiceClient();
  if (!roomServiceClient) return;

  await Promise.all(
    participants.map(async ({ id }) => {
      await getResultAsync(async () => {
        await roomServiceClient.updateParticipant(callSessionId, id, {
          permission: {
            canPublish: true,
            canPublishData: true,
            canPublishSources: [TrackSource.MICROPHONE, TrackSource.CAMERA],
            canSubscribe: true,
          },
        });
        const participant = await roomServiceClient.getParticipant(callSessionId, id);
        const screenShareTracks = participant.tracks.filter(({ source }) =>
          [TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO].includes(source),
        );
        await Promise.all(
          screenShareTracks.map(({ sid }) => roomServiceClient.mutePublishedTrack(callSessionId, id, sid, true)),
        );
      }).match(noop, console.error);
    }),
  );
};
