import type { PublishSource } from "#server/services/realtimeKit/constants";
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { getRealtimeKitCredentials } from "#server/services/realtimeKit/getRealtimeKitCredentials";
import { getRealtimeKitPresetName } from "#server/services/realtimeKit/getRealtimeKitPresetName";
import { realtimeKitParticipantMap } from "#server/services/realtimeKit/realtimeKitParticipantMap";
import { requestRealtimeKit } from "#server/services/realtimeKit/requestRealtimeKit";
import { getResultAsync, ID_SEPARATOR, noop } from "@esposter/shared";
import { z } from "zod";

// The update in flight for each connection, keyed by call and connection, so the next one starts from what it wrote
const connectionUpdateMap = new Map<string, Promise<void>>();
// Takes publishing away from, or gives it back to, every connection a user holds in a call — at RealtimeKit, since a
// Client that ignored the moderator would otherwise keep publishing. Computed from what each connection may publish now
// Rather than written from a fixed set, so one moderation's grant never undoes another's revoke: a force-muted presenter
// Whose screen share is stopped stays muted. A connection's publishing is its preset, which is written whole, so the
// Read and the write after it run one at a time per connection, since two moderations reading one set would each restore
// What the other took. A preset governs what a connection may publish next, so a revoke stops new publication; the tracks
// It already publishes are the client's to stop. A failure fails the action, since nothing else holds the enforcement
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

  const updateConnection = async (id: string) => {
    const realtimeKitParticipant = realtimeKitParticipantMap.get(callSessionId)?.get(id);
    if (!realtimeKitParticipant) return;
    const publishSources = isGranted
      ? [...new Set([...realtimeKitParticipant.publishSources, ...sources])]
      : realtimeKitParticipant.publishSources.filter((source) => !sources.includes(source));
    await requestRealtimeKit(credentials, {
      body: { preset_name: getRealtimeKitPresetName(publishSources) },
      method: "PATCH",
      path: `/meetings/${meetingId}/participants/${realtimeKitParticipant.id}`,
      schema: z.unknown().optional(),
    });
    realtimeKitParticipant.publishSources = publishSources;
  };

  await Promise.all(
    Array.from(participantMap, async ([id, { userId }]) => {
      if (userId !== targetUserId) return;
      const key = `${callSessionId}${ID_SEPARATOR}${id}`;
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
