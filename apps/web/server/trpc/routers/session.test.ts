import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers/index";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { Session } from "better-auth";

import { createMockSession } from "#server/auth.test";
import {
  createMockContext,
  getMockRevokeOtherSessions,
  getMockRevokeSession,
  getMockSession,
} from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { sessionRouter } from "#server/trpc/routers/session";
import { sessionsInAuth } from "@esposter/db-schema";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

describe("sessionRouter", () => {
  let mockContext: Context;
  let requestContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["session"]>;
  let currentSession: Session;
  let otherSession: Session;
  let userId: string;
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
  // The agent above as the endpoint hands it out — the raw string is stored, never returned
  const deviceLabel = "Chrome 141 on Windows";

  // The row as better-auth writes it, minus the token the client is never handed
  const insertSession = async (session: Session) => {
    await mockContext.db
      .insert(sessionsInAuth)
      .values({
        expiresAt: session.expiresAt,
        id: session.id,
        ipAddress: "",
        token: session.token,
        updatedAt: session.updatedAt,
        userAgent,
        userId: session.userId,
      });
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    ({
      user: { id: userId },
    } = getMockSession());
  });

  beforeEach(async () => {
    // Pinned so every session's stamps read off the epoch, and an expired one is the epoch itself
    vi.useFakeTimers({ now: 0 });
    // The mock context inserts a session row of its own for the default payload, and this file reads the whole
    // Listing back, so it starts from only the rows it wrote
    await mockContext.db.delete(sessionsInAuth);
    currentSession = createMockSession(userId);
    otherSession = createMockSession(userId);
    await insertSession(currentSession);
    await insertSession(otherSession);
    // The request runs as the current session, so its context names that session and the user it belongs to
    requestContext = await createMockContext({ session: currentSession, user: getMockSession().user });
    caller = createCallerFactory(sessionRouter)(requestContext);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("reads the caller's unexpired sessions, without the stored address", async () => {
    expect.hasAssertions();

    await insertSession({ ...createMockSession(userId), expiresAt: new Date(0) });

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
      headers: requestContext.headers,
    });
  });

  test("rejects a session the account does not hold", async () => {
    expect.hasAssertions();

    await expect(caller.deleteSession("-1")).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Session is not found for id: -1]`,
    );

    expect(getMockRevokeSession()).not.toHaveBeenCalled();
  });

  test("revokes every session but the current one", async () => {
    expect.hasAssertions();

    await caller.deleteOtherSessions();

    expect(getMockRevokeOtherSessions()).toHaveBeenCalledExactlyOnceWith({ headers: requestContext.headers });
  });
});
