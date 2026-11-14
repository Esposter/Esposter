import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createParticipant } from "#server/services/message/call/createParticipant";
import { getCallObject } from "#server/services/message/call/getCallObject";
import { createCallerFactory } from "#server/trpc";
import { createMockContext, mockSessionOnce, replayMockSession } from "#server/trpc/context.test";
import { callRouter } from "#server/trpc/routers/call";
import { callSessionsInMessage } from "@esposter/db-schema";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The call object answers for the call's state, so the router's guards are tested against what it reports
vi.mock("#server/services/message/call/getCallObject", () => ({
  getCallObject: vi.fn<(callSessionId: string) => unknown>(),
}));

describe("knockerRouter", () => {
  let mockContext: Context;
  let callCaller: DecorateRouterRecord<TRPCRouter["callSession"]>;

  beforeAll(async () => {
    mockContext = await createMockContext();
    callCaller = createCallerFactory(callRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(callSessionsInMessage);
    vi.restoreAllMocks();
  });

  test("knockCall hands the knocker and the doorkeeper's user id to the call object", async () => {
    expect.hasAssertions();

    const doorkeeperPayload = await mockSessionOnce(mockContext.db);
    const { callSessionId } = await callCaller.createCall();
    const knockerPayload = await mockSessionOnce(mockContext.db);
    const knockCall = vi.fn<(input: unknown) => Promise<void>>(() => Promise.resolve());
    vi.mocked(getCallObject).mockReturnValueOnce({ knockCall } as unknown as ReturnType<typeof getCallObject>);

    await callCaller.knocker.knockCall({ id: callSessionId });

    expect(knockCall).toHaveBeenCalledExactlyOnceWith({
      callSessionId,
      doorkeeperUserId: doorkeeperPayload.user.id,
      knocker: createParticipant(knockerPayload.session, knockerPayload.user),
    });
  });

  test("admitKnocker refuses a caller who is not in the call", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const { callSessionId } = await callCaller.createCall();
    await mockSessionOnce(mockContext.db);
    const readAccess = vi.fn<(input: unknown) => unknown>(() => ({
      isAdmitted: false,
      isJoined: false,
      isKnocking: false,
    }));
    vi.mocked(getCallObject).mockReturnValueOnce({ readAccess } as unknown as ReturnType<typeof getCallObject>);

    await expect(
      callCaller.knocker.admitKnocker({ callSessionId, sessionId: "knocker-session" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Must be in call to admit knockers]`);
  });

  test("admitKnocker lets the creator in the call admit a knocker through the call object", async () => {
    expect.hasAssertions();

    const creatorPayload = await mockSessionOnce(mockContext.db);
    const { callSessionId } = await callCaller.createCall();
    replayMockSession(creatorPayload);
    const readAccess = vi.fn<(input: unknown) => unknown>(() => ({
      isAdmitted: false,
      isJoined: true,
      isKnocking: false,
    }));
    const admitKnocker = vi.fn<(input: unknown) => Promise<boolean>>(() => Promise.resolve(true));
    vi.mocked(getCallObject).mockReturnValueOnce({ admitKnocker, readAccess } as unknown as ReturnType<
      typeof getCallObject
    >);

    await callCaller.knocker.admitKnocker({ callSessionId, sessionId: "knocker-session" });

    expect(admitKnocker).toHaveBeenCalledExactlyOnceWith({ callSessionId, knockerSessionId: "knocker-session" });
  });

  test("dismissKnocker refuses a joined participant who did not create the call", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const { callSessionId } = await callCaller.createCall();
    await mockSessionOnce(mockContext.db);
    const readAccess = vi.fn<(input: unknown) => unknown>(() => ({
      isAdmitted: false,
      isJoined: true,
      isKnocking: false,
    }));
    vi.mocked(getCallObject).mockReturnValueOnce({ readAccess } as unknown as ReturnType<typeof getCallObject>);

    await expect(
      callCaller.knocker.dismissKnocker({ callSessionId, sessionId: "knocker-session" }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Must be call creator to dismiss knockers]`);
  });
});
