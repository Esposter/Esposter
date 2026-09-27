import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { TrackSource } from "livekit-server-sdk";

import { JOIN_TRACK_SOURCES } from "@@/server/services/livekit/constants";
import { createLiveKitRoomServiceClient } from "@@/server/services/livekit/createLiveKitRoomServiceClient";
import { getResultAsync, noop } from "@esposter/shared";
import { ParticipantPermission } from "livekit-server-sdk";

// The update in flight for each connection, keyed by call and connection, so the next one starts from what it wrote
const connectionUpdateMap = new Map<string, Promise<void>>();
// Takes sources away from, or gives them back to, every connection a user holds in a call — at the SFU, since a
// Client that ignored the moderator would otherwise keep publishing. Computed from what each connection may publish
// Now rather than written from a fixed set, so one moderation's grant never undoes another's revoke: a force-muted
// Presenter whose screen share is stopped stays muted. LiveKit replaces the whole permission, so every other field
// Read is written back as it was, and that read and the write after it run one at a time per connection, since two
// Moderations reading one list would each restore what the other took. LiveKit reads an empty list as every source,
// So an empty current list is the join grant, and an absent permission is the whole join grant rather than the
// Message's defaults, which would take subscribing and publishing away with it. The permission stops only new
// Publications, so a revoke mutes the live tracks too. A failure fails the action, since nothing else holds the enforcement
export const updateLiveKitTrackSources = async (
  callSessionId: string,
  participantMap: Map<string, CallParticipant>,
  targetUserId: string,
  sources: TrackSource[],
  isGranted: boolean,
) => {
  const roomServiceClient = createLiveKitRoomServiceClient();
  if (!roomServiceClient) return;

  const updateConnection = async (id: string) => {
    const {
      permission = new ParticipantPermission({ canPublish: true, canPublishData: true, canSubscribe: true }),
      tracks,
    } = await roomServiceClient.getParticipant(callSessionId, id);
    const currentSources = permission.canPublishSources.length > 0 ? permission.canPublishSources : JOIN_TRACK_SOURCES;
    const publishSources = isGranted
      ? [...new Set([...currentSources, ...sources])]
      : currentSources.filter((source) => !sources.includes(source));
    permission.canPublishSources = publishSources;
    await roomServiceClient.updateParticipant(callSessionId, id, { permission });
    if (isGranted) return;
    await Promise.all(
      tracks
        .filter(({ source }) => sources.includes(source))
        .map(({ sid }) => roomServiceClient.mutePublishedTrack(callSessionId, id, sid, true)),
    );
  };

  await Promise.all(
    Array.from(participantMap, async ([id, { userId }]) => {
      if (userId !== targetUserId) return;
      const key = `${callSessionId}/${id}`;
      const previousUpdate = connectionUpdateMap.get(key);
      const currentUpdate = (async () => {
        await Promise.allSettled([previousUpdate]);
        await updateConnection(id);
      })();
      connectionUpdateMap.set(key, currentUpdate);
      const result = await getResultAsync(() => currentUpdate);
      if (connectionUpdateMap.get(key) === currentUpdate) connectionUpdateMap.delete(key);
      result.match(noop, (error) => {
        throw error;
      });
    }),
  );
};
