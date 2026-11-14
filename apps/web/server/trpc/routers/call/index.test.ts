import type { Context } from "#server/trpc/context";

import { createParticipant } from "#server/services/message/call/createParticipant";
import { getCallObject } from "#server/services/message/call/getCallObject";
import { createMockAuthSession, createMockCaller, createMockContext } from "#server/trpc/context.test";
import { callRouter } from "#server/trpc/routers/call";
import { callSessionsInMessage, DatabaseEntityType } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The call object answers for the call's state, so the router's guards are tested against what it reports
vi.mock(import("#server/services/message/call/getCallObject"), () => ({
  getCallObject: vi.fn<typeof getCallObject>(),
}));

describe("callRouter", () => {
  let mockContext: Context;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  afterEach(async () => {
    await mockContext.db.delete(callSessionsInMessage);
    vi.restoreAllMocks();
  });

  test("joinCall refuses a joiner the call object does not admit", async () => {
    expect.hasAssertions();

    const creatorCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const { callSessionId } = await creatorCaller.createCall();
    const joinerCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const joinCall = vi.fn<(input: unknown) => Promise<null>>(() => Promise.resolve(null));
    vi.mocked(getCallObject).mockReturnValueOnce({ joinCall } as unknown as ReturnType<typeof getCallObject>);

    await expect(joinerCaller.joinCall({ id: callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Must be admitted to join this call]`,
    );
  });

  test("joinCall returns the join of the call object, and the creator is the doorkeeper", async () => {
    expect.hasAssertions();

    const creatorAuthSession = await createMockAuthSession(mockContext.db);
    const creatorCaller = await createMockCaller(callRouter, creatorAuthSession);
    const { callSessionId } = await creatorCaller.createCall();
    const joinCall = vi.fn<(input: unknown) => Promise<unknown>>(() =>
      Promise.resolve({
        authToken: "auth-token",
        isFirstJoiner: true,
        meetingId: "meeting-id",
        participantMap: new Map(),
      }),
    );
    vi.mocked(getCallObject).mockReturnValueOnce({ joinCall } as unknown as ReturnType<typeof getCallObject>);

    const result = await creatorCaller.joinCall({ id: callSessionId });

    expect(joinCall).toHaveBeenCalledExactlyOnceWith({
      callSessionId,
      isAdmissionRequired: false,
      participant: createParticipant(creatorAuthSession.session, creatorAuthSession.user),
    });
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

    const creatorCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const { callSessionId } = await creatorCaller.createCall();
    const leaveCall = vi.fn<(input: unknown) => Promise<null>>(() => Promise.resolve(null));
    vi.mocked(getCallObject).mockReturnValueOnce({ leaveCall } as unknown as ReturnType<typeof getCallObject>);

    await expect(creatorCaller.leaveCall({ callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, callSessionId).message}]`,
    );
  });

  test("setMuted refuses a caller whose participant the call object does not hold", async () => {
    expect.hasAssertions();

    const creatorCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const { callSessionId } = await creatorCaller.createCall();
    const setMuted = vi.fn<(input: unknown) => Promise<boolean>>(() => Promise.resolve(false));
    vi.mocked(getCallObject).mockReturnValueOnce({ setMuted } as unknown as ReturnType<typeof getCallObject>);

    await expect(creatorCaller.setMuted({ callSessionId, isMuted: true })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Must join call first]`,
    );
  });
});
