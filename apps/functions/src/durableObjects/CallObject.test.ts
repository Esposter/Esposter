import type { CallParticipant } from "@esposter/db-schema";

import { CLOUDFLARE_ACCOUNT_ID, PublishSource, SOCKET_IDENTITY_HEADER } from "@esposter/db-schema";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { CallObject } from "#src/durableObjects/CallObject";
import {
  createMockObjectState,
  createSocket,
  readFrames,
  type MockObjectState,
} from "#src/services/durableObject/createMockObjectState.test";
import { REALTIMEKIT_API_ORIGIN } from "#src/services/realtimeKit/constants";

const createParticipant = (): CallParticipant => ({
  id: crypto.randomUUID(),
  image: null,
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name: "name",
  userId: crypto.randomUUID(),
});

const respondWith = (data: unknown) => new Response(JSON.stringify({ data }));

describe(CallObject, () => {
  const callSessionId = crypto.randomUUID();
  const credentials = { apiToken: crypto.randomUUID(), appId: crypto.randomUUID() };
  const meetingId = crypto.randomUUID();
  const environment = { CORE: {} } as unknown as Cloudflare.Env;

  const createCallObject = (state: MockObjectState) =>
    new CallObject(state.ctx as unknown as DurableObjectState, environment);

  // The meeting the call's first join would make, seeded so the join reads it rather than creating one
  const seedMeeting = (state: MockObjectState) => {
    state.database.prepare("INSERT INTO callState (meetingId) VALUES (?)").run(meetingId);
  };

  const setRejoining = (state: MockObjectState, sessionId: string, isRejoining: boolean) => {
    state.database
      .prepare("UPDATE realtimeKitParticipants SET isRejoining = ? WHERE sessionId = ?")
      .run(Number(isRejoining), sessionId);
  };

  // RealtimeKit answers an added participant with a token, and every other call with no data
  const stubRealtimeKit = () => {
    vi.stubEnv("REALTIMEKIT_API_TOKEN", credentials.apiToken);
    vi.stubEnv("REALTIMEKIT_APP_ID", credentials.appId);
    const fetchMock = vi.fn<(input: string) => Promise<Response>>((input) =>
      Promise.resolve(
        respondWith(input.endsWith("/participants") ? { id: "rtk-participant", token: "rtk-token" } : null),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  beforeEach(() => {
    // RealtimeKit is off unless a test stubs it on, whatever the shell running the suite exports
    vi.stubEnv("REALTIMEKIT_API_TOKEN", undefined);
    vi.stubEnv("REALTIMEKIT_APP_ID", undefined);
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  test("a join tells the other sockets of the call, not the joiner's own session", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const joiner = createParticipant();
    const bystander = createParticipant();
    const joinerSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(joinerSocket, [`user:${joiner.userId}`, `session:${joiner.id}`]);
    state.ctx.acceptWebSocket(bystanderSocket, [`user:${bystander.userId}`, `session:${bystander.id}`]);

    await callObject.joinCall({ callSessionId, isAdmissionRequired: false, participant: joiner });

    expect(joinerSocket.send).not.toHaveBeenCalled();
    expect(readFrames(bystanderSocket)).toStrictEqual([
      {
        data: { callSessionId, participant: { ...joiner, isCameraEnabled: false }, sessionId: joiner.id, type: "join" },
        type: "joinCall",
      },
    ]);
  });

  test("a leave tells the others and closes the leaver's sockets, and the last one reports the length", async () => {
    expect.hasAssertions();

    const callDuration = Temporal.Duration.from({ minutes: 1, seconds: 30 });
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const leaver = createParticipant();
    const remainer = createParticipant();
    await callObject.joinCall({ callSessionId, isAdmissionRequired: false, participant: leaver });
    await callObject.joinCall({ callSessionId, isAdmissionRequired: false, participant: remainer });
    const leaverSocket = createSocket();
    const remainerSocket = createSocket();
    state.ctx.acceptWebSocket(leaverSocket, [`user:${leaver.userId}`, `session:${leaver.id}`]);
    state.ctx.acceptWebSocket(remainerSocket, [`user:${remainer.userId}`, `session:${remainer.id}`]);

    const leave = callObject.leaveCall({ callSessionId, sessionId: leaver.id });

    expect(leave).toStrictEqual({ callDurationSeconds: null, sessionId: leaver.id, userId: leaver.userId });
    expect(readFrames(remainerSocket)).toStrictEqual([{ data: { callSessionId, id: leaver.id }, type: "leaveCall" }]);
    expect(leaverSocket.send).not.toHaveBeenCalled();
    expect(leaverSocket.close).toHaveBeenCalledExactlyOnceWith(1000, "Left the call");

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add(callDuration));
    const lastLeave = callObject.leaveCall({ callSessionId, sessionId: remainer.id });
    const repeatedLeave = callObject.leaveCall({ callSessionId, sessionId: remainer.id });

    expect(lastLeave).toStrictEqual({
      callDurationSeconds: callDuration.total("seconds"),
      sessionId: remainer.id,
      userId: remainer.userId,
    });
    expect(repeatedLeave).toStrictEqual(null);
  });

  test("a knock reaches only the doorkeeper, and the admission only the knocker", () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const doorkeeper = createParticipant();
    const knocker = createParticipant();
    const bystander = createParticipant();
    const doorkeeperSocket = createSocket();
    const knockerSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(doorkeeperSocket, [`user:${doorkeeper.userId}`, `session:${doorkeeper.id}`]);
    state.ctx.acceptWebSocket(knockerSocket, [`user:${knocker.userId}`, `session:${knocker.id}`]);
    state.ctx.acceptWebSocket(bystanderSocket, [`user:${bystander.userId}`, `session:${bystander.id}`]);

    callObject.knockCall({ callSessionId, doorkeeperUserId: doorkeeper.userId, knocker });
    const knockingAccess = callObject.readAccess({ sessionId: knocker.id });
    callObject.admitKnocker({ callSessionId, knockerSessionId: knocker.id });
    const admittedAccess = callObject.readAccess({ sessionId: knocker.id });

    expect(knockingAccess).toStrictEqual({ isAdmitted: false, isJoined: false, isKnocking: true });
    expect(admittedAccess).toStrictEqual({ isAdmitted: true, isJoined: false, isKnocking: false });
    expect(readFrames(doorkeeperSocket)).toStrictEqual([{ data: { callSessionId, knocker }, type: "knockCall" }]);
    expect(readFrames(knockerSocket)).toStrictEqual([
      { data: { callSessionId, knockerSessionId: knocker.id }, type: "knockerAdmitted" },
    ]);
    expect(bystanderSocket.send).not.toHaveBeenCalled();
  });

  test("refuses the socket of a session neither in the call nor knocking on it", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const response = await callObject.fetch(
      new Request("http://localhost", {
        headers: {
          [SOCKET_IDENTITY_HEADER.deviceId]: crypto.randomUUID(),
          [SOCKET_IDENTITY_HEADER.sessionId]: crypto.randomUUID(),
          [SOCKET_IDENTITY_HEADER.userId]: crypto.randomUUID(),
          Upgrade: "websocket",
        },
      }),
    );

    expect(response.status).toStrictEqual(403);
  });

  test("a revoke that narrows a user's publishing rejoins each of their connections with the new token", async () => {
    expect.hasAssertions();

    const fetchMock = stubRealtimeKit();
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    seedMeeting(state);
    const participant = createParticipant();
    const bystander = createParticipant();
    await callObject.joinCall({ callSessionId, isAdmissionRequired: false, participant });
    const userSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(userSocket, [`user:${participant.userId}`, `session:${participant.id}`]);
    state.ctx.acceptWebSocket(bystanderSocket, [`user:${bystander.userId}`, `session:${bystander.id}`]);
    // The kick answers with no data, and the participant added back answers with the token it rejoins with
    fetchMock
      .mockResolvedValueOnce(respondWith(null))
      .mockResolvedValueOnce(respondWith({ id: "rtk-rejoined-participant", token: "rtk-rejoined-token" }));

    await callObject.updatePresets({
      callSessionId,
      isGranted: false,
      sources: [PublishSource.Screenshare],
      userId: participant.userId,
    });

    const appUrl = `${REALTIMEKIT_API_ORIGIN}/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${credentials.appId}`;
    const meetingUrl = `${appUrl}/meetings/${meetingId}`;
    expect(fetchMock.mock.calls.map(([input]) => input)).toStrictEqual([
      `${meetingUrl}/participants`,
      `${meetingUrl}/active-session/kick`,
      `${meetingUrl}/participants`,
    ]);
    expect(readFrames(userSocket)).toStrictEqual([
      {
        data: {
          authToken: "rtk-rejoined-token",
          callSessionId,
          canPublishMicrophone: true,
          sessionId: participant.id,
          type: "rejoin",
        },
        type: "joinCall",
      },
    ]);
    expect(bystanderSocket.send).not.toHaveBeenCalled();
  });

  test("a new instance over the same storage reads back the participants the last one wrote", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const first = createParticipant();
    const second = createParticipant();
    await callObject.joinCall({ callSessionId, isAdmissionRequired: false, participant: first });
    await callObject.joinCall({ callSessionId, isAdmissionRequired: false, participant: second });

    const reloadedCallObject = createCallObject(state);

    expect(reloadedCallObject.readParticipantMap()).toStrictEqual(
      new Map([
        [first.id, { ...first, isCameraEnabled: false }],
        [second.id, { ...second, isCameraEnabled: false }],
      ]),
    );
  });

  test("a leave for a connection a revoke is replacing is ignored and its participant stays", async () => {
    expect.hasAssertions();

    stubRealtimeKit();
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    seedMeeting(state);
    const participant = createParticipant();
    await callObject.joinCall({ callSessionId, isAdmissionRequired: false, participant });
    setRejoining(state, participant.id, true);

    const replacedLeave = callObject.participantLeft({ callSessionId, sessionId: participant.id });
    const participantMap = callObject.readParticipantMap();
    setRejoining(state, participant.id, false);
    const leave = callObject.participantLeft({ callSessionId, sessionId: participant.id });

    expect(replacedLeave).toStrictEqual(null);
    expect(participantMap).toStrictEqual(new Map([[participant.id, { ...participant, isCameraEnabled: false }]]));
    expect(leave).toStrictEqual({ callDurationSeconds: 0, sessionId: participant.id, userId: participant.userId });
  });
});
