import type { Context } from "#server/trpc/context";
import type { TRPCRouter } from "#server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { getCallObject } from "#server/services/message/call/getCallObject";
import { createCallerFactory } from "#server/trpc";
import { createMockContext, mockSessionOnce, replayMockSession } from "#server/trpc/context.test";
import { callRouter } from "#server/trpc/routers/call";
import { callSessionsInMessage, DatabaseEntityType } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The call object answers for the call's state, so the router's guards are tested against what it reports
vi.mock("#server/services/message/call/getCallObject", () => ({
  getCallObject: vi.fn<(callSessionId: string) => unknown>(),
}));

describe("callRouter", () => {
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

  test("joinCall refuses a joiner the call object does not admit", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db);
    const { callSessionId } = await callCaller.createCall();
    await mockSessionOnce(mockContext.db);
    const joinCall = vi.fn<(input: unknown) => Promise<null>>(() => Promise.resolve(null));
    vi.mocked(getCallObject).mockReturnValueOnce({ joinCall } as unknown as ReturnType<typeof getCallObject>);

    await expect(callCaller.joinCall({ id: callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Must be admitted to join this call]`,
    );
  });

  test("joinCall returns the join of the call object, and the creator is the doorkeeper", async () => {
    expect.hasAssertions();

    const creatorPayload = await mockSessionOnce(mockContext.db);
    const { callSessionId } = await callCaller.createCall();
    replayMockSession(creatorPayload);
    const joinCall = vi.fn<(input: unknown) => Promise<unknown>>(() =>
      Promise.resolve({
        authToken: "auth-token",
        isFirstJoiner: true,
        meetingId: "meeting-id",
        participantMap: new Map(),
      }),
    );
    vi.mocked(getCallObject).mockReturnValueOnce({ joinCall } as unknown as ReturnType<typeof getCallObject>);

    const result = await callCaller.joinCall({ id: callSessionId });

    expect(joinCall).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ callSessionId, isAdmissionRequired: false }),
    );
    expect(result).toStrictEqual({
      authToken: "auth-token",
      callSessionId,
      isDoorkeeper: true,
      meetingId: "meeting-id",
      participantMap: new Map(),
    });
  });

  test("leaveCall reports a call the caller is not in as not found", async () => {
    expect.hasAssertions();

    const creatorPayload = await mockSessionOnce(mockContext.db);
    const { callSessionId } = await callCaller.createCall();
    replayMockSession(creatorPayload);
    const leaveCall = vi.fn<(input: unknown) => Promise<null>>(() => Promise.resolve(null));
    vi.mocked(getCallObject).mockReturnValueOnce({ leaveCall } as unknown as ReturnType<typeof getCallObject>);

    await expect(callCaller.leaveCall({ callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, callSessionId).message}]`,
    );
  });

  test("setMuted refuses a caller whose participant the call object does not hold", async () => {
    expect.hasAssertions();

    const creatorPayload = await mockSessionOnce(mockContext.db);
    const { callSessionId } = await callCaller.createCall();
    replayMockSession(creatorPayload);
    const setMuted = vi.fn<(input: unknown) => Promise<boolean>>(() => Promise.resolve(false));
    vi.mocked(getCallObject).mockReturnValueOnce({ setMuted } as unknown as ReturnType<typeof getCallObject>);

    await expect(callCaller.setMuted({ callSessionId, isMuted: true })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Must join call first]`,
    );
  });
});
