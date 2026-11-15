import type { Context } from "#server/trpc/context";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { createMockAuthSession, createMockCaller, createMockContext } from "#server/trpc/context.test";
import { callRouter } from "#server/trpc/routers/call/index";
import { callSessionsInMessage } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The call object answers for the call's state, so the router's guards are tested against what it reports
vi.mock(import("#server/composables/realtime/useCallObject"), () => ({ useCallObject: vi.fn<typeof useCallObject>() }));

describe("knockerRouter", () => {
  let mockContext: Context;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  afterEach(async () => {
    await mockContext.db.delete(callSessionsInMessage);
    vi.restoreAllMocks();
  });

  test("knockCall hands the knocker and the doorkeeper's user id to the call object", async () => {
    expect.hasAssertions();

    const doorkeeperAuthSession = await createMockAuthSession(mockContext.db);
    const creatorCaller = await createMockCaller(callRouter, doorkeeperAuthSession);
    const { callSessionId } = await creatorCaller.createCall();
    const knockerAuthSession = await createMockAuthSession(mockContext.db);
    const knockerCaller = await createMockCaller(callRouter, knockerAuthSession);
    const knockCall = vi.fn<(input: unknown) => Promise<void>>(() => Promise.resolve());
    vi.mocked(useCallObject).mockReturnValueOnce({ knockCall } as unknown as ReturnType<typeof useCallObject>);

    await knockerCaller.knocker.knockCall({ id: callSessionId });

    expect(knockCall).toHaveBeenCalledExactlyOnceWith({
      callSessionId,
      doorkeeperUserId: doorkeeperAuthSession.user.id,
      knocker: createParticipant(knockerAuthSession.session, knockerAuthSession.user),
    });
  });

  test("admitKnocker refuses a caller who is not in the call", async () => {
    expect.hasAssertions();

    const creatorCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const { callSessionId } = await creatorCaller.createCall();
    const outsiderCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const readAccess = vi.fn<(input: unknown) => unknown>(() => ({
      isAdmitted: false,
      isJoined: false,
      isKnocking: false,
    }));
    vi.mocked(useCallObject).mockReturnValueOnce({ readAccess } as unknown as ReturnType<typeof useCallObject>);

    await expect(
      outsiderCaller.knocker.admitKnocker({ callSessionId, sessionId: "knocker-session" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Must be in call to admit knockers]`);
  });

  test("admitKnocker lets the creator in the call admit a knocker through the call object", async () => {
    expect.hasAssertions();

    const creatorCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const { callSessionId } = await creatorCaller.createCall();
    const readAccess = vi.fn<(input: unknown) => unknown>(() => ({
      isAdmitted: false,
      isJoined: true,
      isKnocking: false,
    }));
    const admitKnocker = vi.fn<(input: unknown) => Promise<boolean>>(() => Promise.resolve(true));
    vi.mocked(useCallObject).mockReturnValue({ admitKnocker, readAccess } as unknown as ReturnType<
      typeof useCallObject
    >);

    await creatorCaller.knocker.admitKnocker({ callSessionId, sessionId: "knocker-session" });

    expect(admitKnocker).toHaveBeenCalledExactlyOnceWith({ callSessionId, knockerSessionId: "knocker-session" });
  });

  test("dismissKnocker refuses a joined participant who did not create the call", async () => {
    expect.hasAssertions();

    const creatorCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const { callSessionId } = await creatorCaller.createCall();
    const participantCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const readAccess = vi.fn<(input: unknown) => unknown>(() => ({
      isAdmitted: false,
      isJoined: true,
      isKnocking: false,
    }));
    vi.mocked(useCallObject).mockReturnValueOnce({ readAccess } as unknown as ReturnType<typeof useCallObject>);

    await expect(
      participantCaller.knocker.dismissKnocker({ callSessionId, sessionId: "knocker-session" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Must be call creator to dismiss knockers]`);
  });
});
