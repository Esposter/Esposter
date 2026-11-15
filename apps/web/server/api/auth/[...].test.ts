import type { MockDatabase } from "@esposter/db-mock";
import type { RequestEvent } from "nuxt/server";

import authRoute from "#server/api/auth/[...]";
import { auth } from "#server/auth";
import { callObjectCalls } from "#server/composables/realtime/useCallObject.test";
import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { createCallSessionId } from "#server/services/message/call/createCallSessionId";
import { TEST_ORIGIN } from "#shared/services/pageBuilder/constants.test";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, sessionsInAuth, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { makeSignature } from "better-auth/crypto";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

// The real better-auth instance, so a sign-out runs through the app's own configuration rather than a double
vi.mock(import("#server/auth"), (importOriginal) => importOriginal());

// The session cookie better-auth reads: the token, signed with the instance's secret, under the name it sets
const createSessionCookie = async (token: string) => {
  const { authCookies, secret } = await auth.$context;
  const signature = await makeSignature(token, secret);
  return `${authCookies.sessionToken.name}=${encodeURIComponent(`${token}.${signature}`)}`;
};

const createEvent = (method: string, path: string, cookie: string) => {
  const url = `${TEST_ORIGIN}${path}`;
  return {
    req: new Request(url, { headers: { cookie, Origin: TEST_ORIGIN }, method }),
    res: { headers: new Headers() },
    url: new URL(url),
  } as unknown as RequestEvent;
};

describe("api/auth/[...]", () => {
  const userId = v7();
  const sessionId = v7();
  const token = v7();
  let mockDatabase: MockDatabase;

  const insertUser = async (id: string) => {
    const createdAt = new Date(0);
    await mockDatabase.db
      .insert(usersInAuth)
      .values({ biography: "", createdAt, email: v7(), emailVerified: true, id, name: "name", updatedAt: createdAt });
  };

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  beforeEach(async () => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
    await insertUser(userId);
    await mockDatabase.db
      .insert(sessionsInAuth)
      .values({
        expiresAt: new Date(Temporal.Duration.from({ days: 1 }).total("milliseconds")),
        id: sessionId,
        ipAddress: "",
        token,
        userAgent: "",
        userId,
      });
  });

  afterEach(async () => {
    vi.useRealTimers();
    userObjectCalls.length = 0;
    callObjectCalls.length = 0;
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  // A sign-out removes the session's row, and the removal closes the socket that session holds on the person's object
  test("signing out closes the session's sockets on the person's object", async () => {
    expect.hasAssertions();

    const response = await authRoute(createEvent("POST", "/api/auth/sign-out", await createSessionCookie(token)));

    expect(response.status).toBe(200);
    expect(userObjectCalls).toStrictEqual([
      { args: [], method: "readJoinedCallIds", userId },
      { args: [sessionId], method: "closeSession", userId },
    ]);
    await expect(mockDatabase.db.$count(sessionsInAuth)).resolves.toBe(0);
  });

  // A call started by someone else still reaches the person through the rooms they belong to, and a room they do not
  // Belong to is left alone
  test("signing out closes the session's sockets on the calls in the person's rooms, and no other", async () => {
    expect.hasAssertions();

    const hostId = v7();
    await insertUser(hostId);
    const memberRoom = takeOne(
      await mockDatabase.db.insert(roomsInMessage).values({ name: "member", userId: hostId }).returning(),
    );
    const otherRoom = takeOne(
      await mockDatabase.db.insert(roomsInMessage).values({ name: "other", userId: hostId }).returning(),
    );
    await mockDatabase.db.insert(usersToRoomsInMessage).values({ roomId: memberRoom.id, userId });
    const memberCallSessionId = await createCallSessionId(mockDatabase.db, memberRoom.id, hostId);
    await createCallSessionId(mockDatabase.db, otherRoom.id, hostId);

    await authRoute(createEvent("POST", "/api/auth/sign-out", await createSessionCookie(token)));

    expect(callObjectCalls.map(({ callSessionId, method }) => ({ callSessionId, method }))).toStrictEqual([
      { callSessionId: memberCallSessionId, method: "closeSession" },
    ]);
  });

  // Better-auth removes an expired row when a read presents its cookie, and that removal closes the session's sockets. A
  // Socket that stays open with no read after its expiry is not closed by this path
  test("reading an expired session removes its row and closes its sockets on the person's object", async () => {
    expect.hasAssertions();

    vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(0).add({ hours: 48 }));

    const response = await authRoute(createEvent("GET", "/api/auth/get-session", await createSessionCookie(token)));

    await expect(response.json()).resolves.toBeNull();
    expect(userObjectCalls).toStrictEqual([
      { args: [], method: "readJoinedCallIds", userId },
      { args: [sessionId], method: "closeSession", userId },
    ]);
    await expect(mockDatabase.db.$count(sessionsInAuth)).resolves.toBe(0);
  });
});
