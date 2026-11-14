import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { PublishSource, REALTIMEKIT_PRESET_NAME } from "#server/services/realtimeKit/constants";
import { realtimeKitParticipantMap } from "#server/services/realtimeKit/realtimeKitParticipantMap";
import { updateRealtimeKitParticipantPreset } from "#server/services/realtimeKit/updateRealtimeKitParticipantPreset";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { requestRealtimeKitMock } = vi.hoisted(() => ({ requestRealtimeKitMock: vi.fn() }));

vi.mock(import("#server/services/realtimeKit/requestRealtimeKit"), () => ({
  requestRealtimeKit: requestRealtimeKitMock,
}));

describe(updateRealtimeKitParticipantPreset, () => {
  const callSessionId = crypto.randomUUID();
  const meetingId = crypto.randomUUID();
  const realtimeKitParticipantId = crypto.randomUUID();
  const id = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const participantMap = new Map([[id, { id, userId } as CallParticipant]]);

  beforeEach(() => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "accountId");
    vi.stubEnv("REALTIMEKIT_API_TOKEN", "apiToken");
    vi.stubEnv("REALTIMEKIT_APP_ID", "appId");
    realtimeKitParticipantMap.set(
      callSessionId,
      new Map([
        [id, { id: realtimeKitParticipantId, publishSources: [PublishSource.Microphone, PublishSource.Screenshare] }],
      ]),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    requestRealtimeKitMock.mockReset();
    realtimeKitParticipantMap.clear();
  });

  // A preset is written whole, so two moderations reading one set of publishing would each restore what the other took
  test("keeps both of two concurrent revokes", async () => {
    expect.hasAssertions();

    requestRealtimeKitMock.mockImplementation(() => Promise.resolve(undefined));
    await Promise.all([
      updateRealtimeKitParticipantPreset(
        callSessionId,
        meetingId,
        participantMap,
        userId,
        [PublishSource.Microphone],
        false,
      ),
      updateRealtimeKitParticipantPreset(
        callSessionId,
        meetingId,
        participantMap,
        userId,
        [PublishSource.Screenshare],
        false,
      ),
    ]);

    expect(requestRealtimeKitMock).toHaveBeenCalledTimes(2);
    expect(requestRealtimeKitMock).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        body: { preset_name: REALTIMEKIT_PRESET_NAME.Camera },
        path: `/meetings/${meetingId}/participants/${realtimeKitParticipantId}`,
      }),
    );
  });

  // Nothing else holds the enforcement, so the moderation action must not report one that never landed
  test("rejects when RealtimeKit fails", async () => {
    expect.hasAssertions();

    const message = "message";
    requestRealtimeKitMock.mockRejectedValue(new Error(message));

    await expect(
      updateRealtimeKitParticipantPreset(
        callSessionId,
        meetingId,
        participantMap,
        userId,
        [PublishSource.Microphone],
        false,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: message]`);
  });
});
