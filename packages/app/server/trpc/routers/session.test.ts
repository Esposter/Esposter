import type { Device } from "#shared/models/auth/Device";
import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { Session } from "better-auth";

import { createCallerFactory } from "@@/server/trpc";
import {
  createMockContext,
  createMockSession,
  getMockRevokeOtherSessions,
  getMockRevokeSession,
  getMockSession,
  replayMockSession,
} from "@@/server/trpc/context.test";
import { sessionRouter } from "@@/server/trpc/routers/session";
import { sessions } from "@esposter/db-schema";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ closeDeviceConnections: vi.fn<(device: Device) => Promise<void>>() }));

// Closing a revoked session's live connections is the one part of a revoke that leaves the auth tables, so it is
// Asserted as the intent it is rather than through a Web PubSub hub
vi.mock(import("@@/server/services/auth/closeDeviceConnections"), () => ({
  closeDeviceConnections: mocks.closeDeviceConnections,
}));

describe("sessionRouter", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["session"]>;
  let currentSession: Session;
  let otherSession: Session;
  let userId: string;
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
  // The agent above as the endpoint hands it out — the raw string is stored, never returned
  const deviceLabel = "Chrome 141 on Windows";

  // The row as better-auth writes it, minus the token the client is never handed
  const insertSession = async (
    session: Session,
    expiresAt = new Date(Date.now() + Temporal.Duration.from({ days: 1 }).total("milliseconds")),
  ) => {
    await mockContext.db.insert(sessions).values({
      expiresAt,
      id: session.id,
      ipAddress: "203.0.113.1",
      token: session.token,
      updatedAt: session.updatedAt,
      userAgent,
      userId: session.userId,
    });
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(sessionRouter)(mockContext);
    ({
      user: { id: userId },
    } = getMockSession());
  });

  beforeEach(async () => {
    // The mock context inserts a session row of its own for the default payload, and this file reads the whole
    // Listing back, so it starts from only the rows it wrote
    await mockContext.db.delete(sessions);
    currentSession = { ...createMockSession(userId), token: "currentToken" };
    otherSession = { ...createMockSession(userId), token: "otherToken" };
    await insertSession(currentSession);
    await insertSession(otherSession);
    // The session the request runs as, queued for the auth middleware's own read
    replayMockSession({ session: currentSession, user: getMockSession().user });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("reads the caller's unexpired sessions, without the stored address", async () => {
    expect.hasAssertions();
    const expiredSession = { ...createMockSession(userId), token: "expiredToken" };
    await insertSession(
      expiredSession,
      new Date(Date.now() - Temporal.Duration.from({ days: 1 }).total("milliseconds")),
    );

    const sessionSummaries = await caller.readSessions();

    // Leak checks ride along on the equality: an `ipAddress` or a raw `userAgent` that got through shows up
    // As an extra key, and an expired session shows up as an extra row
    expect(sessionSummaries).toStrictEqual([
      { deviceLabel, id: currentSession.id, isCurrent: true, updatedAt: currentSession.updatedAt },
      { deviceLabel, id: otherSession.id, isCurrent: false, updatedAt: otherSession.updatedAt },
    ]);
  });

  test("revokes by the token it resolved rather than the id the client named", async () => {
    expect.hasAssertions();

    await caller.deleteSession(otherSession.id);

    expect(getMockRevokeSession()).toHaveBeenCalledExactlyOnceWith({
      body: { token: otherSession.token },
      headers: mockContext.headers,
    });
    expect(mocks.closeDeviceConnections).toHaveBeenCalledExactlyOnceWith({ sessionId: otherSession.id, userId });
  });

  test("rejects a session the account does not hold", async () => {
    expect.hasAssertions();

    // A literal rather than a random session id, so the snapshot below is the same string every run
    await expect(caller.deleteSession("missingSessionId")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Session is not found for id: missingSessionId]`,
    );

    expect(getMockRevokeSession()).not.toHaveBeenCalled();
  });

  test("closes the connections of every session but the current one", async () => {
    expect.hasAssertions();

    await caller.deleteOtherSessions();

    expect(getMockRevokeOtherSessions()).toHaveBeenCalledExactlyOnceWith({ headers: mockContext.headers });
    expect(mocks.closeDeviceConnections).toHaveBeenCalledExactlyOnceWith({ sessionId: otherSession.id, userId });
  });
});
