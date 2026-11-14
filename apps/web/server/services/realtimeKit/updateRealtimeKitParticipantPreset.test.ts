import type { CallEvents } from "#server/models/message/events/CallEvents";
import type { CallParticipant } from "@esposter/db-schema";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { callEventEmitter } from "#server/services/message/events/callEventEmitter";
import { PublishSource, REALTIMEKIT_PRESET_NAME } from "#server/services/realtimeKit/constants";
import { realtimeKitParticipantMap } from "#server/services/realtimeKit/realtimeKitParticipantMap";
import { updateRealtimeKitParticipantPreset } from "#server/services/realtimeKit/updateRealtimeKitParticipantPreset";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(updateRealtimeKitParticipantPreset, () => {
  const callSessionId = crypto.randomUUID();
  const meetingId = crypto.randomUUID();
  const realtimeKitParticipantId = crypto.randomUUID();
  const newRealtimeKitParticipantId = crypto.randomUUID();
  const otherRealtimeKitParticipantId = crypto.randomUUID();
  const id = crypto.randomUUID();
  const name = "name";
  const newToken = "newToken";
  const otherId = crypto.randomUUID();
  const otherUserId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const participant = createParticipant({ id }, { id: userId, image: null, name });
  const otherParticipant = createParticipant({ id: otherId }, { id: otherUserId, image: null, name });
  const kickPath = `/meetings/${meetingId}/active-session/kick`;
  const addPath = `/meetings/${meetingId}/participants`;
  const createParticipantMap = () =>
    new Map<string, CallParticipant>([
      [id, participant],
      [otherId, otherParticipant],
    ]);
  let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;
  let joinEvents: CallEvents["joinCall"][0][];

  // RealtimeKit's REST boundary: every request is recorded by its method, path and body. A kick is answered with no
  // Data, and an add with the connection it created
  const getRequests = () =>
    fetchMock.mock.calls.map(([input, init]) => ({
      body: init?.body,
      method: init?.method,
      path: String(input).slice(String(input).indexOf("/meetings/")),
    }));

  beforeEach(() => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "accountId");
    vi.stubEnv("REALTIMEKIT_API_TOKEN", "apiToken");
    vi.stubEnv("REALTIMEKIT_APP_ID", "appId");
    fetchMock = vi.fn<typeof fetch>((input, init) => {
      if (init?.method !== "POST") return Promise.resolve(Response.json({ success: true }));
      else if (String(input).endsWith("/active-session/kick")) return Promise.resolve(Response.json({ success: true }));
      return Promise.resolve(Response.json({ data: { id: newRealtimeKitParticipantId, token: newToken } }));
    });
    vi.stubGlobal("fetch", fetchMock);
    joinEvents = [];
    callEventEmitter.on("joinCall", (event) => {
      joinEvents.push(event);
    });
    realtimeKitParticipantMap.set(
      callSessionId,
      new Map([
        [
          id,
          {
            id: realtimeKitParticipantId,
            isRejoining: false,
            publishSources: [PublishSource.Microphone, PublishSource.Screenshare],
          },
        ],
        [
          otherId,
          {
            id: otherRealtimeKitParticipantId,
            isRejoining: false,
            publishSources: [PublishSource.Microphone, PublishSource.Screenshare],
          },
        ],
      ]),
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    callEventEmitter.removeAllListeners("joinCall");
    realtimeKitParticipantMap.clear();
  });

  // A preset change does not take a track already live off the air, so a narrowing kicks the connection and adds it
  // Back under the narrower preset, in that order: a second connection under the same id beside it would be kicked too
  test("a revoke kicks the connection, then adds it back under the narrower preset", async () => {
    expect.hasAssertions();

    await updateRealtimeKitParticipantPreset(
      callSessionId,
      meetingId,
      createParticipantMap(),
      userId,
      [PublishSource.Microphone],
      false,
    );

    expect(getRequests()).toStrictEqual([
      { body: JSON.stringify({ custom_participant_ids: [id] }), method: "POST", path: kickPath },
      {
        body: JSON.stringify({
          custom_participant_id: id,
          name,
          preset_name: REALTIMEKIT_PRESET_NAME.CameraScreenshare,
        }),
        method: "POST",
        path: addPath,
      },
    ]);
  });

  test("hands the new token to the connection's own user, and leaves every other connection as it was", async () => {
    expect.hasAssertions();

    await updateRealtimeKitParticipantPreset(
      callSessionId,
      meetingId,
      createParticipantMap(),
      userId,
      [PublishSource.Microphone],
      false,
    );

    expect(joinEvents).toStrictEqual([
      { authToken: newToken, callSessionId, canPublishMicrophone: false, sessionId: id, type: "rejoin" },
    ]);
    expect(realtimeKitParticipantMap.get(callSessionId)?.get(id)).toStrictEqual({
      id: newRealtimeKitParticipantId,
      isRejoining: false,
      publishSources: [PublishSource.Screenshare],
    });
    expect(getRequests().filter(({ body }) => String(body).includes(otherId))).toStrictEqual([]);
  });

  // The flag is what the webhook reads, so a participant leaving in the window is not taken for this kick
  test("flags the connection as rejoining while the kick is in flight", async () => {
    expect.hasAssertions();

    let isRejoiningDuringKick = false;
    fetchMock.mockImplementationOnce(() => {
      isRejoiningDuringKick = realtimeKitParticipantMap.get(callSessionId)?.get(id)?.isRejoining ?? false;
      return Promise.resolve(Response.json({ success: true }));
    });

    await updateRealtimeKitParticipantPreset(
      callSessionId,
      meetingId,
      createParticipantMap(),
      userId,
      [PublishSource.Microphone],
      false,
    );

    expect(isRejoiningDuringKick).toBe(true);
    expect(realtimeKitParticipantMap.get(callSessionId)?.get(id)?.isRejoining).toBe(false);
  });

  // The kick is the enforcement, so a kick that does not land stops the revoke rather than adding a connection beside
  // The one it was meant to replace
  test("rejects when the kick fails, and adds nothing", async () => {
    expect.hasAssertions();

    fetchMock.mockImplementationOnce(() => Promise.reject(new Error("message")));

    await expect(
      updateRealtimeKitParticipantPreset(
        callSessionId,
        meetingId,
        createParticipantMap(),
        userId,
        [PublishSource.Microphone],
        false,
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: message]`);

    expect(getRequests()).toHaveLength(1);
    expect(joinEvents).toStrictEqual([]);
  });

  // A participant who left while the kick was in flight has no call to rejoin, so nothing is added back under them
  test("does not add back a participant who left during the kick", async () => {
    expect.hasAssertions();

    const participantMap = createParticipantMap();
    fetchMock.mockImplementationOnce(() => {
      participantMap.delete(id);
      return Promise.resolve(Response.json({ success: true }));
    });

    await updateRealtimeKitParticipantPreset(
      callSessionId,
      meetingId,
      participantMap,
      userId,
      [PublishSource.Microphone],
      false,
    );

    expect(getRequests()).toHaveLength(1);
    expect(joinEvents).toStrictEqual([]);
  });

  test("switches the preset in place for a grant, with no kick and no rejoin", async () => {
    expect.hasAssertions();

    realtimeKitParticipantMap
      .get(callSessionId)
      ?.set(id, { id: realtimeKitParticipantId, isRejoining: false, publishSources: [PublishSource.Screenshare] });

    await updateRealtimeKitParticipantPreset(
      callSessionId,
      meetingId,
      createParticipantMap(),
      userId,
      [PublishSource.Microphone],
      true,
    );

    expect(getRequests()).toStrictEqual([
      {
        body: JSON.stringify({ preset_name: REALTIMEKIT_PRESET_NAME.CameraMicrophoneScreenshare }),
        method: "PATCH",
        path: `/meetings/${meetingId}/participants/${realtimeKitParticipantId}`,
      },
    ]);
    expect(joinEvents).toStrictEqual([]);
  });

  // A connection already without the source has nothing to take away, so repeating the revoke does not reconnect it
  test("leaves a connection that already lacks the revoked source alone", async () => {
    expect.hasAssertions();

    realtimeKitParticipantMap
      .get(callSessionId)
      ?.set(id, { id: realtimeKitParticipantId, isRejoining: false, publishSources: [PublishSource.Screenshare] });

    await updateRealtimeKitParticipantPreset(
      callSessionId,
      meetingId,
      createParticipantMap(),
      userId,
      [PublishSource.Microphone],
      false,
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(joinEvents).toStrictEqual([]);
  });

  // Two revokes that each read one set of publishing would each add the connection back under what the other left
  // Out, so they run one after the other and the second adds it back under what both leave
  test("keeps both of two concurrent revokes", async () => {
    expect.hasAssertions();

    const participantMap = createParticipantMap();
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

    expect(getRequests().at(-1)).toStrictEqual({
      body: JSON.stringify({ custom_participant_id: id, name, preset_name: REALTIMEKIT_PRESET_NAME.Camera }),
      method: "POST",
      path: addPath,
    });
    expect(realtimeKitParticipantMap.get(callSessionId)?.get(id)?.publishSources).toStrictEqual([]);
  });
});
