import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { TrackSource } from "livekit-server-sdk";

import { JOIN_TRACK_SOURCES } from "@@/server/services/livekit/constants";
import { createLiveKitRoomServiceClient } from "@@/server/services/livekit/createLiveKitRoomServiceClient";
import { getResultAsync, noop } from "@esposter/shared";

// Takes sources away from, or gives them back to, every connection a user holds in a call — at the SFU, since a
// Client that ignored the moderator would otherwise keep publishing. Computed from what each connection may publish
// Now rather than written from a fixed set, so one moderation's grant never undoes another's revoke: a force-muted
// Presenter whose screen share is stopped stays muted. LiveKit reads an empty list as every source, so an empty
// Current list is the join grant. The permission stops only new publications, so a revoke mutes the live tracks too
export const updateLiveKitTrackSources = async (
  callSessionId: string,
  participantMap: Map<string, CallParticipant>,
  targetUserId: string,
  sources: TrackSource[],
  isGranted: boolean,
) => {
  const roomServiceClient = createLiveKitRoomServiceClient();
  if (!roomServiceClient) return;

  await Promise.all(
    Array.from(participantMap, async ([id, { userId }]) => {
      if (userId !== targetUserId) return;
      await getResultAsync(async () => {
        const { permission, tracks } = await roomServiceClient.getParticipant(callSessionId, id);
        const currentSources = permission?.canPublishSources.length ? permission.canPublishSources : JOIN_TRACK_SOURCES;
        const canPublishSources = isGranted
          ? [...new Set([...currentSources, ...sources])]
          : currentSources.filter((source) => !sources.includes(source));
        await roomServiceClient.updateParticipant(callSessionId, id, {
          permission: { canPublish: true, canPublishData: true, canPublishSources, canSubscribe: true },
        });
        if (isGranted) return;
        await Promise.all(
          tracks
            .filter(({ source }) => sources.includes(source))
            .map(({ sid }) => roomServiceClient.mutePublishedTrack(callSessionId, id, sid, true)),
        );
      }).match(noop, console.error);
    }),
  );
};
