import type { ObservedContract } from "#src/services/durableObject/wakeCheck.test";
import type { MockObjectState } from "@esposter/db-mock";
import type { CallParticipantProfile } from "@esposter/db-schema";

import { CallObject } from "#src/durableObjects/CallObject";
import { createSocket, readFrames } from "#src/services/durableObject/createMockSocket.test";
import { observeWakes, verifyWakes } from "#src/services/durableObject/wakeCheck.test";
import { REALTIMEKIT_API_ORIGIN } from "#src/services/realtimeKit/constants";
import { createMockObjectState } from "@esposter/db-mock";
import {
  CLOUDFLARE_ACCOUNT_ID,
  getSessionSocketTag,
  getUserSocketTag,
  PublishSource,
  SOCKET_IDENTITY_HEADER,
  TOMBSTONE_RETENTION_MS,
} from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";

// A connection as the server holds it: the auth session it joins or knocks under, and the profile the call shows of it
const createConnection = () => ({
  profile: {
    image: "",
    isCameraEnabled: false,
    isHandRaised: false,
    isMuted: false,
    name: "name",
    userId: v7(),
  } satisfies CallParticipantProfile,
  sessionId: v7(),
});

type Connection = ReturnType<typeof createConnection>;

const respondWith = (data: unknown) => Response.json({ data });

const setRejoining = (state: MockObjectState, participantId: string, isRejoining: boolean) => {
  state.database
    .prepare("UPDATE realtimeKitParticipants SET isRejoining = ? WHERE participantId = ?")
    .run(Number(isRejoining), participantId);
};

describe(CallObject, () => {
  const callSessionId = v7();
  const credentials = { apiToken: v7(), appId: v7() };
  const meetingId = v7();
  const environment = { CORE: {} } as unknown as Cloudflare.Env;

  const createCallObject = (state: MockObjectState) =>
    observeWakes(new CallObject(state.ctx as unknown as DurableObjectState, environment));

  // The meeting the call's first join would make, seeded so the join reads it rather than creating one
  const seedMeeting = (state: MockObjectState) => {
    state.database.prepare("INSERT INTO callState (meetingId) VALUES (?)").run(meetingId);
  };

  // RealtimeKit answers an added participant with a token, and every other call with no data
  const stubRealtimeKit = () => {
    vi.stubEnv("REALTIMEKIT_API_TOKEN", credentials.apiToken);
    vi.stubEnv("REALTIMEKIT_APP_ID", credentials.appId);
    const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>((input) =>
      Promise.resolve(
        respondWith(input.endsWith("/participants") ? { id: "rtk-participant", token: "rtk-token" } : null),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  const joinConnection = (callObject: ObservedContract<CallObject>, connection: Connection) =>
    callObject.joinCall({
      callSessionId,
      isAdmissionRequired: false,
      participant: connection.profile,
      sessionId: connection.sessionId,
    });

  beforeEach(() => {
    // RealtimeKit is off unless a test stubs it on, whatever the shell running the suite exports
    vi.stubEnv("REALTIMEKIT_API_TOKEN", undefined);
    vi.stubEnv("REALTIMEKIT_APP_ID", undefined);
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    verifyWakes();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  test("a join tells the other sockets of the call, not the joiner's own session", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const joiner = createConnection();
    const bystander = createConnection();
    const joinerSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(joinerSocket, [
      getUserSocketTag(joiner.profile.userId),
      getSessionSocketTag(joiner.sessionId),
    ]);
    state.ctx.acceptWebSocket(bystanderSocket, [
      getUserSocketTag(bystander.profile.userId),
      getSessionSocketTag(bystander.sessionId),
    ]);

    const join = await joinConnection(callObject, joiner);
    assert.exists(join);

    expect(joinerSocket.send).not.toHaveBeenCalled();
    expect(readFrames(bystanderSocket)).toStrictEqual([
      {
        data: {
          callSessionId,
          participant: {
            ...joiner.profile,
            deletedAt: null,
            id: join.participantId,
            isCameraEnabled: false,
            version: 0,
          },
          type: "join",
        },
        type: "joinCall",
      },
    ]);
  });

  test("no member's view of the call names a participant's auth session", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const joiner = createConnection();
    const bystander = createConnection();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(bystanderSocket, [
      getUserSocketTag(bystander.profile.userId),
      getSessionSocketTag(bystander.sessionId),
    ]);

    await joinConnection(callObject, joiner);

    const memberViews = JSON.stringify([
      readFrames(bystanderSocket),
      [...(await callObject.readParticipantMap()).values()],
    ]);
    expect(memberViews).not.toContain(joiner.sessionId);
  });

  test("a connection's RealtimeKit custom id is its participant id, never its auth session", async () => {
    expect.hasAssertions();

    const fetchMock = stubRealtimeKit();
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    seedMeeting(state);
    const joiner = createConnection();

    const join = await joinConnection(callObject, joiner);
    const [, init] = fetchMock.mock.calls[0] ?? [];

    assert.exists(join);
    expect(JSON.stringify(init?.body)).toContain(join.participantId);
    expect(JSON.stringify(init?.body)).not.toContain(joiner.sessionId);
  });

  // Two joins by one session that overlap on RealtimeKit's answers both read the session before either records it, so
  // Each Would mint its own participant id and the second record would clash with the first on the session. The session
  // Has One participant, so both joins name it and neither fails
  test("two overlapping joins by one session name it one participant", async () => {
    expect.hasAssertions();

    stubRealtimeKit();
    let releaseAdds!: () => void;
    const addsReleased = new Promise<void>((resolve) => {
      releaseAdds = resolve;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string) => {
        await addsReleased;
        return respondWith(input.endsWith("/participants") ? { id: "rtk-participant", token: "rtk-token" } : null);
      }),
    );
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    seedMeeting(state);
    const joiner = createConnection();

    const firstJoin = joinConnection(callObject, joiner);
    const secondJoin = joinConnection(callObject, joiner);
    // Both joins are under way, each holding its RealtimeKit add, before either is released to record its participant
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
    releaseAdds();
    const [first, second] = await Promise.all([firstJoin, secondJoin]);

    assert.exists(first);
    assert.exists(second);
    expect(second.participantId).toBe(first.participantId);
    expect([...(await callObject.readParticipantMap()).keys()]).toStrictEqual([first.participantId]);
  });

  test("a leave tells the others and closes the leaver's sockets, and the last one reports the length", async () => {
    expect.hasAssertions();

    const callDuration = Temporal.Duration.from({ minutes: 1, seconds: 30 });
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const leaver = createConnection();
    const remainer = createConnection();
    const leaverJoin = await joinConnection(callObject, leaver);
    const remainerJoin = await joinConnection(callObject, remainer);
    assert.exists(leaverJoin);
    assert.exists(remainerJoin);
    const leaverSocket = createSocket();
    const remainerSocket = createSocket();
    state.ctx.acceptWebSocket(leaverSocket, [
      getUserSocketTag(leaver.profile.userId),
      getSessionSocketTag(leaver.sessionId),
    ]);
    state.ctx.acceptWebSocket(remainerSocket, [
      getUserSocketTag(remainer.profile.userId),
      getSessionSocketTag(remainer.sessionId),
    ]);

    const leave = await callObject.leaveCall({ callSessionId, sessionId: leaver.sessionId });

    expect(leave).toStrictEqual({
      callDurationSeconds: null,
      participant: { ...leaver.profile, deletedAt: new Date(0), id: leaverJoin.participantId, version: 1 },
      sessionId: leaver.sessionId,
      userId: leaver.profile.userId,
    });
    expect(readFrames(remainerSocket)).toStrictEqual([
      {
        data: {
          callSessionId,
          participant: { ...leaver.profile, deletedAt: new Date(0), id: leaverJoin.participantId, version: 1 },
        },
        type: "leaveCall",
      },
    ]);
    expect(leaverSocket.send).not.toHaveBeenCalled();
    expect(leaverSocket.close).toHaveBeenCalledExactlyOnceWith(1000, "Left the call");

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add(callDuration));
    const lastLeave = await callObject.leaveCall({ callSessionId, sessionId: remainer.sessionId });
    const repeatedLeave = await callObject.leaveCall({ callSessionId, sessionId: remainer.sessionId });

    expect(lastLeave).toStrictEqual({
      callDurationSeconds: callDuration.total("seconds"),
      participant: {
        ...remainer.profile,
        deletedAt: new Date(callDuration.total("milliseconds")),
        id: remainerJoin.participantId,
        version: 1,
      },
      sessionId: remainer.sessionId,
      userId: remainer.profile.userId,
    });
    expect(repeatedLeave).toBeNull();
  });

  // A leave keeps the participant's row as a tombstone at a higher version, so a read that answered before the leave
  // Cannot bring the participant back over it
  test("a leave keeps the participant as a tombstone at a higher version, so an older read cannot bring it back", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const leaver = createConnection();
    const join = await joinConnection(callObject, leaver);
    assert.exists(join);

    await callObject.leaveCall({ callSessionId, sessionId: leaver.sessionId });

    await expect(callObject.readParticipantMap()).resolves.toStrictEqual(
      new Map([
        [join.participantId, { ...leaver.profile, deletedAt: new Date(0), id: join.participantId, version: 1 }],
      ]),
    );
  });

  // A connection that joins again is named afresh, and its session's row is revived above the tombstone it leaves
  test("a rejoin after a leave is named afresh and revives the session's row at a higher version", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const connection = createConnection();
    const firstJoin = await joinConnection(callObject, connection);
    assert.exists(firstJoin);
    await callObject.leaveCall({ callSessionId, sessionId: connection.sessionId });
    const secondJoin = await joinConnection(callObject, connection);
    assert.exists(secondJoin);

    expect(secondJoin.participantId).not.toBe(firstJoin.participantId);
    await expect(callObject.readParticipantMap()).resolves.toStrictEqual(
      new Map([
        [
          secondJoin.participantId,
          { ...connection.profile, deletedAt: null, id: secondJoin.participantId, version: 2 },
        ],
      ]),
    );
  });

  // A flag change answers with the row it wrote, at the version the database left it, and carries that row to the
  // Others
  test("a flag change answers with its row at the version it left, and carries that row to the others", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const member = createConnection();
    const bystander = createConnection();
    const join = await joinConnection(callObject, member);
    await joinConnection(callObject, bystander);
    assert.exists(join);
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(bystanderSocket, [
      getUserSocketTag(bystander.profile.userId),
      getSessionSocketTag(bystander.sessionId),
    ]);

    const row = await callObject.setMuted({ callSessionId, isMuted: true, sessionId: member.sessionId });

    expect(row).toStrictEqual({
      ...member.profile,
      deletedAt: null,
      id: join.participantId,
      isMuted: true,
      version: 1,
    });
    expect(readFrames(bystanderSocket)).toStrictEqual([
      { data: { callSessionId, participant: structuredClone(row) }, type: "muteChanged" },
    ]);
  });

  // A tombstone is purged by the call's next write once its retention has passed, so the object keeps no leaver forever
  test("a tombstone past its retention is purged by the call's next write", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const leaver = createConnection();
    const join = await joinConnection(callObject, leaver);
    assert.exists(join);
    await callObject.leaveCall({ callSessionId, sessionId: leaver.sessionId });

    expect([...(await callObject.readParticipantMap()).keys()]).toStrictEqual([join.participantId]);

    vi.setSystemTime(
      Temporal.Instant.fromEpochMilliseconds(0).add(
        Temporal.Duration.from({ milliseconds: TOMBSTONE_RETENTION_MS + 1 }),
      ),
    );
    await joinConnection(callObject, createConnection());

    expect([...(await callObject.readParticipantMap()).keys()]).not.toContain(join.participantId);
  });

  test("closing a session closes its sockets and leaves the call as a leave does, kicking its media at RealtimeKit", async () => {
    expect.hasAssertions();

    const fetchMock = stubRealtimeKit();
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    seedMeeting(state);
    const revoked = createConnection();
    const remainer = createConnection();
    const revokedJoin = await joinConnection(callObject, revoked);
    await joinConnection(callObject, remainer);
    assert.exists(revokedJoin);
    const revokedSocket = createSocket();
    const remainerSocket = createSocket();
    state.ctx.acceptWebSocket(revokedSocket, [
      getUserSocketTag(revoked.profile.userId),
      getSessionSocketTag(revoked.sessionId),
    ]);
    state.ctx.acceptWebSocket(remainerSocket, [
      getUserSocketTag(remainer.profile.userId),
      getSessionSocketTag(remainer.sessionId),
    ]);
    fetchMock.mockClear();

    const leave = await callObject.closeSession(revoked.sessionId);

    const appUrl = `${REALTIMEKIT_API_ORIGIN}/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${credentials.appId}`;
    expect(revokedSocket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session revoked");
    expect(readFrames(remainerSocket)).toStrictEqual([
      {
        data: {
          callSessionId,
          participant: { ...revoked.profile, deletedAt: new Date(0), id: revokedJoin.participantId, version: 1 },
        },
        type: "leaveCall",
      },
    ]);
    expect((await callObject.readAccess({ sessionId: revoked.sessionId })).isJoined).toBe(false);
    expect(leave).toStrictEqual({
      callDurationSeconds: null,
      participant: { ...revoked.profile, deletedAt: new Date(0), id: revokedJoin.participantId, version: 1 },
      sessionId: revoked.sessionId,
      userId: revoked.profile.userId,
    });
    expect(fetchMock.mock.calls.map(([input]) => input)).toStrictEqual([
      `${appUrl}/meetings/${meetingId}/active-session/kick`,
    ]);
  });

  test("a knock reaches only the doorkeeper, and the admission only the knocker", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const doorkeeper = createConnection();
    const knocker = createConnection();
    const bystander = createConnection();
    const doorkeeperSocket = createSocket();
    const knockerSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(doorkeeperSocket, [
      getUserSocketTag(doorkeeper.profile.userId),
      getSessionSocketTag(doorkeeper.sessionId),
    ]);
    state.ctx.acceptWebSocket(knockerSocket, [
      getUserSocketTag(knocker.profile.userId),
      getSessionSocketTag(knocker.sessionId),
    ]);
    state.ctx.acceptWebSocket(bystanderSocket, [
      getUserSocketTag(bystander.profile.userId),
      getSessionSocketTag(bystander.sessionId),
    ]);

    await callObject.knockCall({
      callSessionId,
      doorkeeperUserId: doorkeeper.profile.userId,
      knocker: knocker.profile,
      sessionId: knocker.sessionId,
    });
    const knockerId: string = readFrames(doorkeeperSocket)[0].data.knocker.id;
    const knockingAccess = await callObject.readAccess({ sessionId: knocker.sessionId });
    await callObject.admitKnocker({ callSessionId, knockerId });
    const admittedAccess = await callObject.readAccess({ sessionId: knocker.sessionId });

    expect(knockingAccess).toStrictEqual({ isAdmitted: false, isJoined: false, isKnocking: true, participantId: "" });
    expect(admittedAccess).toStrictEqual({ isAdmitted: true, isJoined: false, isKnocking: false, participantId: "" });
    expect(readFrames(doorkeeperSocket)).toStrictEqual([
      {
        data: { callSessionId, knocker: { ...knocker.profile, deletedAt: null, id: knockerId, version: 0 } },
        type: "knockCall",
      },
    ]);
    expect(readFrames(knockerSocket)).toStrictEqual([{ data: { callSessionId }, type: "knockerAdmitted" }]);
    expect(bystanderSocket.send).not.toHaveBeenCalled();
  });

  test("a session knocking again keeps the one lobby entry it holds", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const doorkeeper = createConnection();
    const knocker = createConnection();
    const doorkeeperSocket = createSocket();
    state.ctx.acceptWebSocket(doorkeeperSocket, [
      getUserSocketTag(doorkeeper.profile.userId),
      getSessionSocketTag(doorkeeper.sessionId),
    ]);

    const knock = { callSessionId, doorkeeperUserId: doorkeeper.profile.userId, knocker: knocker.profile };
    await callObject.knockCall({ ...knock, sessionId: knocker.sessionId });
    await callObject.knockCall({ ...knock, sessionId: knocker.sessionId });
    const [firstKnock, secondKnock] = readFrames(doorkeeperSocket);

    expect(secondKnock.data.knocker.id).toBe(firstKnock.data.knocker.id);
  });

  test("a dismissed knock tells only the knocker's own session", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const doorkeeper = createConnection();
    const knocker = createConnection();
    const doorkeeperSocket = createSocket();
    const knockerSocket = createSocket();
    state.ctx.acceptWebSocket(doorkeeperSocket, [
      getUserSocketTag(doorkeeper.profile.userId),
      getSessionSocketTag(doorkeeper.sessionId),
    ]);
    state.ctx.acceptWebSocket(knockerSocket, [
      getUserSocketTag(knocker.profile.userId),
      getSessionSocketTag(knocker.sessionId),
    ]);

    await callObject.knockCall({
      callSessionId,
      doorkeeperUserId: doorkeeper.profile.userId,
      knocker: knocker.profile,
      sessionId: knocker.sessionId,
    });
    const knockerId: string = readFrames(doorkeeperSocket)[0].data.knocker.id;
    await callObject.dismissKnocker({ callSessionId, knockerId });

    expect((await callObject.readAccess({ sessionId: knocker.sessionId })).isKnocking).toBe(false);
    expect(readFrames(knockerSocket)).toStrictEqual([{ data: { callSessionId }, type: "knockerDismissed" }]);
    expect(readFrames(doorkeeperSocket)).toStrictEqual([
      {
        data: { callSessionId, knocker: { ...knocker.profile, deletedAt: null, id: knockerId, version: 0 } },
        type: "knockCall",
      },
    ]);
  });

  // The admission answers the knocker's row as a tombstone at the version its removal raised it to, so a lobby applies
  // The Removal by version. A second admission of the same knocker answers the same tombstone and admits nothing more
  test("an admission answers the knocker's tombstone, and a second admission answers it without admitting again", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const doorkeeper = createConnection();
    const knocker = createConnection();
    const doorkeeperSocket = createSocket();
    state.ctx.acceptWebSocket(doorkeeperSocket, [
      getUserSocketTag(doorkeeper.profile.userId),
      getSessionSocketTag(doorkeeper.sessionId),
    ]);
    await callObject.knockCall({
      callSessionId,
      doorkeeperUserId: doorkeeper.profile.userId,
      knocker: knocker.profile,
      sessionId: knocker.sessionId,
    });
    const knockerId: string = readFrames(doorkeeperSocket)[0].data.knocker.id;
    const admitted = await callObject.admitKnocker({ callSessionId, knockerId });
    const admittedAgain = await callObject.admitKnocker({ callSessionId, knockerId });

    expect(admitted).toStrictEqual({ ...knocker.profile, deletedAt: new Date(0), id: knockerId, version: 1 });
    expect(admittedAgain).toStrictEqual(admitted);
    expect(readFrames(doorkeeperSocket).map(({ type }) => type)).toStrictEqual(["knockCall"]);
  });

  // A dismissal answers the same tombstone a let-in does, so the doorkeeper's lobby removes the knock by its version
  test("a dismissal answers the knocker's tombstone", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const doorkeeper = createConnection();
    const knocker = createConnection();
    const doorkeeperSocket = createSocket();
    state.ctx.acceptWebSocket(doorkeeperSocket, [
      getUserSocketTag(doorkeeper.profile.userId),
      getSessionSocketTag(doorkeeper.sessionId),
    ]);
    await callObject.knockCall({
      callSessionId,
      doorkeeperUserId: doorkeeper.profile.userId,
      knocker: knocker.profile,
      sessionId: knocker.sessionId,
    });
    const knockerId: string = readFrames(doorkeeperSocket)[0].data.knocker.id;
    const dismissed = await callObject.dismissKnocker({ callSessionId, knockerId });

    expect(dismissed).toStrictEqual({ ...knocker.profile, deletedAt: new Date(0), id: knockerId, version: 1 });
  });

  // The knock frame carries the row the lobby holds, so a knock that comes after a dismissal is a live row above the
  // Dismissal's tombstone, and an older frame for the same knocker cannot bring it back
  test("a knock after a dismissal is a live row above the dismissal's tombstone", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const doorkeeper = createConnection();
    const knocker = createConnection();
    const doorkeeperSocket = createSocket();
    state.ctx.acceptWebSocket(doorkeeperSocket, [
      getUserSocketTag(doorkeeper.profile.userId),
      getSessionSocketTag(doorkeeper.sessionId),
    ]);
    const knock = { callSessionId, doorkeeperUserId: doorkeeper.profile.userId, knocker: knocker.profile };
    await callObject.knockCall({ ...knock, sessionId: knocker.sessionId });
    const [{ data: first }] = readFrames(doorkeeperSocket);
    await callObject.dismissKnocker({ callSessionId, knockerId: first.knocker.id });
    await callObject.knockCall({ ...knock, sessionId: knocker.sessionId });
    const [, { data: second }] = readFrames(doorkeeperSocket);

    expect(second.knocker).toStrictEqual({ ...knocker.profile, deletedAt: null, id: second.knocker.id, version: 2 });
    expect(second.knocker.id).not.toBe(first.knocker.id);
  });

  test("the call ending dismisses each knock on its own session", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const member = createConnection();
    const knocker = createConnection();
    const knockerSocket = createSocket();
    const memberJoin = await joinConnection(callObject, member);
    state.ctx.acceptWebSocket(knockerSocket, [
      getUserSocketTag(knocker.profile.userId),
      getSessionSocketTag(knocker.sessionId),
    ]);
    await callObject.knockCall({
      callSessionId,
      doorkeeperUserId: member.profile.userId,
      knocker: knocker.profile,
      sessionId: knocker.sessionId,
    });
    await callObject.leaveCall({ callSessionId, sessionId: member.sessionId });

    assert.exists(memberJoin);
    expect((await callObject.readAccess({ sessionId: knocker.sessionId })).isKnocking).toBe(false);
    expect(readFrames(knockerSocket)).toStrictEqual([
      {
        data: {
          callSessionId,
          participant: { ...member.profile, deletedAt: new Date(0), id: memberJoin.participantId, version: 1 },
        },
        type: "leaveCall",
      },
      { data: { callSessionId }, type: "knockerDismissed" },
    ]);
  });

  test("refuses the socket of a session neither in the call nor knocking on it", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const response = await callObject.fetch(
      new Request("http://localhost", {
        headers: {
          [SOCKET_IDENTITY_HEADER.deviceId]: v7(),
          [SOCKET_IDENTITY_HEADER.sessionExpiresAt]: String(Number.MAX_SAFE_INTEGER),
          [SOCKET_IDENTITY_HEADER.sessionId]: v7(),
          [SOCKET_IDENTITY_HEADER.userId]: v7(),
          Upgrade: "websocket",
        },
      }),
    );

    expect(response.status).toBe(403);
  });

  test("a revoke that narrows a user's publishing rejoins each of their connections with the new token", async () => {
    expect.hasAssertions();

    const fetchMock = stubRealtimeKit();
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    seedMeeting(state);
    const participant = createConnection();
    const bystander = createConnection();
    await joinConnection(callObject, participant);
    const userSocket = createSocket();
    const bystanderSocket = createSocket();
    state.ctx.acceptWebSocket(userSocket, [
      getUserSocketTag(participant.profile.userId),
      getSessionSocketTag(participant.sessionId),
    ]);
    state.ctx.acceptWebSocket(bystanderSocket, [
      getUserSocketTag(bystander.profile.userId),
      getSessionSocketTag(bystander.sessionId),
    ]);
    // The kick answers with no data, and the participant added back answers with the token it rejoins with
    fetchMock
      .mockResolvedValueOnce(respondWith(null))
      .mockResolvedValueOnce(respondWith({ id: "rtk-rejoined-participant", token: "rtk-rejoined-token" }));

    await callObject.updatePresets({
      callSessionId,
      isGranted: false,
      sources: [PublishSource.Screenshare],
      userId: participant.profile.userId,
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
        data: { authToken: "rtk-rejoined-token", callSessionId, canPublishMicrophone: true, type: "rejoin" },
        type: "joinCall",
      },
    ]);
    expect(bystanderSocket.send).not.toHaveBeenCalled();
  });

  test("a new instance over the same storage reads back the participants the last one wrote", async () => {
    expect.hasAssertions();

    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    const first = createConnection();
    const second = createConnection();
    const firstJoin = await joinConnection(callObject, first);
    const secondJoin = await joinConnection(callObject, second);
    assert.exists(firstJoin);
    assert.exists(secondJoin);

    const reloadedCallObject = createCallObject(state);

    await expect(reloadedCallObject.readParticipantMap()).resolves.toStrictEqual(
      new Map([
        [firstJoin.participantId, { ...first.profile, deletedAt: null, id: firstJoin.participantId, version: 0 }],
        [secondJoin.participantId, { ...second.profile, deletedAt: null, id: secondJoin.participantId, version: 0 }],
      ]),
    );
  });

  test("a leave for a connection a revoke is replacing is ignored and its participant stays", async () => {
    expect.hasAssertions();

    stubRealtimeKit();
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    seedMeeting(state);
    const participant = createConnection();
    const join = await joinConnection(callObject, participant);
    assert.exists(join);
    setRejoining(state, join.participantId, true);

    const replacedLeave = await callObject.participantLeft({
      callSessionId,
      leftAt: new Date(),
      participantId: join.participantId,
    });
    const participantMap = await callObject.readParticipantMap();
    setRejoining(state, join.participantId, false);
    const leave = await callObject.participantLeft({
      callSessionId,
      leftAt: new Date(),
      participantId: join.participantId,
    });

    expect(replacedLeave).toBeNull();
    expect(participantMap).toStrictEqual(
      new Map([[join.participantId, { ...participant.profile, deletedAt: null, id: join.participantId, version: 0 }]]),
    );
    expect(leave).toStrictEqual({
      callDurationSeconds: 0,
      participant: { ...participant.profile, deletedAt: new Date(0), id: join.participantId, version: 1 },
      sessionId: participant.sessionId,
      userId: participant.profile.userId,
    });
  });

  test("a leave from before the current connection was added is ignored and its participant stays", async () => {
    expect.hasAssertions();

    stubRealtimeKit();
    const state = createMockObjectState(callSessionId);
    const callObject = createCallObject(state);
    seedMeeting(state);
    const participant = createConnection();
    const kickedAt = new Date();
    const join = await joinConnection(callObject, participant);
    assert.exists(join);
    state.database
      .prepare("UPDATE realtimeKitParticipants SET connectedAt = ? WHERE participantId = ?")
      .run(kickedAt.getTime() + 1, join.participantId);

    const leave = await callObject.participantLeft({
      callSessionId,
      leftAt: kickedAt,
      participantId: join.participantId,
    });

    expect(leave).toBeNull();
    await expect(callObject.readParticipantMap()).resolves.toStrictEqual(
      new Map([[join.participantId, { ...participant.profile, deletedAt: null, id: join.participantId, version: 0 }]]),
    );
  });
});
