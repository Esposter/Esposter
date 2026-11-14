import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callEventEmitter } from "#server/services/message/events/callEventEmitter";
import { addRealtimeKitParticipant } from "#server/services/realtimeKit/addRealtimeKitParticipant";
import { PublishSource } from "#server/services/realtimeKit/constants";
import { getRealtimeKitCredentials } from "#server/services/realtimeKit/getRealtimeKitCredentials";
import { getRealtimeKitPresetName } from "#server/services/realtimeKit/getRealtimeKitPresetName";
import { realtimeKitParticipantMap } from "#server/services/realtimeKit/realtimeKitParticipantMap";
import { removeRealtimeKitParticipant } from "#server/services/realtimeKit/removeRealtimeKitParticipant";
import { requestRealtimeKit } from "#server/services/realtimeKit/requestRealtimeKit";
import { getResultAsync, ID_SEPARATOR, noop, withFinalizerAsync } from "@esposter/shared";
import { z } from "zod";

// The update in flight for each connection, keyed by call and connection, so the next one starts from what it wrote
const connectionUpdateMap = new Map<string, Promise<void>>();
// Takes publishing away from, or gives it back to, every connection a user holds in a call — at RealtimeKit, since a
// Client that ignored the moderator would otherwise keep publishing. Computed from what each connection may publish now
// Rather than written from a fixed set, so one moderation's grant never undoes another's revoke: a force-muted presenter
// Whose screen share is stopped stays muted. A connection's publishing is its preset, which is written whole, so the
// Read and the write after it run one at a time per connection, since two moderations reading one set would each restore
// What the other took. A grant switches the preset in place. A revoke that narrows it replaces the connection instead:
// A preset change does not take a track already live off the air, so the connection is kicked and added back under the
// Narrower preset, and its user is handed the new token on their call subscription to rejoin with. A failure fails the
// Action, since nothing else holds the enforcement
export const updateRealtimeKitParticipantPreset = async (
  callSessionId: string,
  meetingId: string | null,
  participantMap: Map<string, CallParticipant>,
  targetUserId: string,
  sources: PublishSource[],
  isGranted: boolean,
) => {
  const credentials = getRealtimeKitCredentials();
  if (!credentials || !meetingId) return;

  const updateConnection = async (id: string, participant: CallParticipant) => {
    const realtimeKitParticipant = realtimeKitParticipantMap.get(callSessionId)?.get(id);
    if (!realtimeKitParticipant) return;
    const publishSources = isGranted
      ? [...new Set([...realtimeKitParticipant.publishSources, ...sources])]
      : realtimeKitParticipant.publishSources.filter((source) => !sources.includes(source));
    if (isGranted) {
      await requestRealtimeKit(credentials, {
        body: { preset_name: getRealtimeKitPresetName(publishSources) },
        method: "PATCH",
        path: `/meetings/${meetingId}/participants/${realtimeKitParticipant.id}`,
        schema: z.unknown().optional(),
      });
      realtimeKitParticipant.publishSources = publishSources;
    } else if (publishSources.length < realtimeKitParticipant.publishSources.length) {
      // Flagged while the kick is in flight, so the webhook reads that kick as this connection being replaced rather
      // Than its participant leaving the call
      realtimeKitParticipant.isRejoining = true;
      await withFinalizerAsync(
        async () => {
          await removeRealtimeKitParticipant(meetingId, id);
          // A participant who left while the kick was in flight has no call left to rejoin
          if (!participantMap.has(id)) return;
          const addedParticipant = await addRealtimeKitParticipant(
            credentials,
            meetingId,
            participant,
            getRealtimeKitPresetName(publishSources),
          );
          realtimeKitParticipantMap
            .get(callSessionId)
            ?.set(id, { id: addedParticipant.id, isRejoining: false, publishSources });
          callEventEmitter.emit("joinCall", {
            authToken: addedParticipant.token,
            callSessionId,
            canPublishMicrophone: publishSources.includes(PublishSource.Microphone),
            sessionId: id,
            type: "rejoin",
          });
        },
        () => {
          realtimeKitParticipant.isRejoining = false;
        },
      );
    }
  };

  await Promise.all(
    Array.from(participantMap, async ([id, participant]) => {
      if (participant.userId !== targetUserId) return;
      const key = `${callSessionId}${ID_SEPARATOR}${id}`;
      const previousUpdate = connectionUpdateMap.get(key);
      const currentUpdate = (async () => {
        await Promise.allSettled([previousUpdate]);
        await updateConnection(id, participant);
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
