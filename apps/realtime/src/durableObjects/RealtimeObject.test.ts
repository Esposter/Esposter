import { RealtimeObject } from "#src/durableObjects/RealtimeObject";
import { createMockObjectState, createSocket } from "#src/services/durableObject/createMockObjectState.test";
import { SOCKET_IDENTITY_HEADER } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

// An object that revokes a session the way each object's `closeSession` does, so a test drives the revoke the object runs
class SessionObject extends RealtimeObject {
  announce() {
    this.broadcast({ type: "announce" });
  }

  revoke(sessionId: string) {
    this.closeRevokedSession(sessionId);
  }
}

// Node's Response refuses the 101 an upgrade is answered with, so the stub keeps only the status the object reads
const ResponseStub = function (_body: unknown, init: { status: number }) {
  return { status: init.status };
};
// The runtime's socket pair, whose server end the object accepts
const WebSocketPairStub = function () {
  return [createSocket(), createSocket()];
};

const createObject = () => {
  const state = createMockObjectState(v7());
  return { object: new SessionObject(state.ctx as unknown as DurableObjectState, {} as Cloudflare.Env), state };
};

describe(RealtimeObject, () => {
  const userId = v7();
  const deviceId = v7();

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // An upgrade for a session, carrying the identity the web Worker forwards
  const upgrade = async (object: SessionObject, sessionId: string, sessionExpiresAt = Number.MAX_SAFE_INTEGER) => {
    vi.stubGlobal("Response", ResponseStub);
    vi.stubGlobal("WebSocketPair", WebSocketPairStub);
    return object.fetch(
      new Request("http://localhost/ws/user", {
        headers: {
          [SOCKET_IDENTITY_HEADER.deviceId]: deviceId,
          [SOCKET_IDENTITY_HEADER.sessionExpiresAt]: String(sessionExpiresAt),
          [SOCKET_IDENTITY_HEADER.sessionId]: sessionId,
          [SOCKET_IDENTITY_HEADER.userId]: userId,
          Upgrade: "websocket",
        },
      }),
    );
  };

  // The upgrade read its session before the revoke, and reaches the object after the revoke's close has run
  test("refuses an upgrade whose session was revoked before the upgrade reached the object", async () => {
    expect.hasAssertions();

    const sessionId = v7();
    const { object, state } = createObject();
    object.revoke(sessionId);
    await state.settleWaitUntil();

    const response = await upgrade(object, sessionId);

    expect(response.status).toBe(401);
    expect(state.ctx.getWebSockets()).toStrictEqual([]);
  });

  test("accepts an upgrade for a session that was not revoked", async () => {
    expect.hasAssertions();

    const { object, state } = createObject();
    object.revoke(v7());
    await state.settleWaitUntil();

    const response = await upgrade(object, v7());

    expect(response.status).toBe(101);
    expect(state.ctx.getWebSockets()).toHaveLength(1);
  });

  // A revoke's record is kept for an hour, so an object that outlives many revokes holds only the recent ones
  test("drops a revoke record older than an hour when the next revoke is recorded", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const { object, state } = createObject();
    object.revoke(v7());
    await state.settleWaitUntil();
    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1, milliseconds: 1 }));
    object.revoke(v7());
    await state.settleWaitUntil();

    await expect(state.ctx.storage.list({ prefix: "" })).resolves.toHaveProperty("size", 1);
  });

  // A socket left idle past its session's expiry has no read to delete the row and close it, so the next write does
  test("closes a socket whose session expired instead of writing to it", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    const sessionExpiresAt = Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 1 }).epochMilliseconds;
    const { object, state } = createObject();
    await upgrade(object, v7(), sessionExpiresAt);
    const [socket] = state.ctx.getWebSockets();
    assert.exists(socket);
    vi.setSystemTime(sessionExpiresAt);
    object.announce();

    expect(socket.send).not.toHaveBeenCalled();
    expect(socket.close).toHaveBeenCalledExactlyOnceWith(1008, "Session expired");
  });
});
