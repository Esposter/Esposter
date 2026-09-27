import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { RoomServiceClient } from "livekit-server-sdk";

import { SCREEN_SHARE_TRACK_SOURCES } from "@@/server/services/livekit/constants";
import { updateLiveKitTrackSources } from "@@/server/services/livekit/updateLiveKitTrackSources";
import { ParticipantPermission, TrackSource } from "livekit-server-sdk";
import { describe, expect, test, vi } from "vitest";

const { roomServiceClientMock } = vi.hoisted(() => ({
  roomServiceClientMock: {} as { current: Partial<RoomServiceClient> },
}));

vi.mock(import("@@/server/services/livekit/createLiveKitRoomServiceClient"), () => ({
  createLiveKitRoomServiceClient: () => roomServiceClientMock.current as RoomServiceClient,
}));

describe(updateLiveKitTrackSources, () => {
  const callSessionId = crypto.randomUUID();
  const id = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const participantMap = new Map([[id, { id, userId } as CallParticipant]]);

  // LiveKit replaces the whole permission, so two moderations reading one list would each restore what the other took
  test("keeps both of two concurrent revokes", async () => {
    expect.hasAssertions();

    let publishSources: TrackSource[] = [];
    roomServiceClientMock.current = {
      getParticipant: () => Promise.resolve({ permission: { canPublishSources: publishSources }, tracks: [] } as never),
      updateParticipant: async (_room, _identity, options) => {
        await Promise.resolve();
        publishSources = (options as { permission: { canPublishSources: TrackSource[] } }).permission.canPublishSources;
        return {} as never;
      },
    };
    await Promise.all([
      updateLiveKitTrackSources(callSessionId, participantMap, userId, [TrackSource.MICROPHONE], false),
      updateLiveKitTrackSources(callSessionId, participantMap, userId, SCREEN_SHARE_TRACK_SOURCES, false),
    ]);

    expect(publishSources).toStrictEqual([TrackSource.CAMERA]);
  });

  // A default permission message would write back no subscribe and no publish
  test("starts from the join grant when LiveKit reports no permission", async () => {
    expect.hasAssertions();

    let permission: Partial<ParticipantPermission> | undefined;
    roomServiceClientMock.current = {
      getParticipant: () => Promise.resolve({ tracks: [] } as never),
      updateParticipant: (_room, _identity, options) => {
        permission = (options as { permission: Partial<ParticipantPermission> }).permission;
        return Promise.resolve({} as never);
      },
    };
    await updateLiveKitTrackSources(callSessionId, participantMap, userId, SCREEN_SHARE_TRACK_SOURCES, false);

    expect(permission).toStrictEqual(
      new ParticipantPermission({
        canPublish: true,
        canPublishData: true,
        canPublishSources: [TrackSource.MICROPHONE, TrackSource.CAMERA],
        canSubscribe: true,
      }),
    );
  });

  // Nothing else holds the enforcement, so the moderation action must not report one that never landed
  test("rejects when LiveKit fails", async () => {
    expect.hasAssertions();

    const message = "message";
    roomServiceClientMock.current = { getParticipant: () => Promise.reject(new Error(message)) };

    await expect(
      updateLiveKitTrackSources(callSessionId, participantMap, userId, [TrackSource.MICROPHONE], false),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: message]`);
  });
});
