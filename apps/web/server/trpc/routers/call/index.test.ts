import type { Context } from "#server/trpc/context";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { userObjectCalls } from "#server/composables/realtime/useUserObject.test";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { createMockAuthSession, createMockCaller, createMockContext } from "#server/trpc/context.test";
import { callRouter } from "#server/trpc/routers/call/index";
import { callSessionsInMessage, DatabaseEntityType } from "@esposter/db-schema";
import { NotFoundError } from "@esposter/shared";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

// The call object answers for the call's state, so the router's guards are tested against what it reports
vi.mock(import("#server/composables/realtime/useCallObject"), () => ({ useCallObject: vi.fn<typeof useCallObject>() }));

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
    vi.mocked(useCallObject).mockReturnValueOnce({ joinCall } as unknown as ReturnType<typeof useCallObject>);

    await expect(joinerCaller.joinCall({ id: callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Must be admitted to join this call]`,
    );
  });

  // No D1 row names who was admitted to a call without a room, so revoking the joiner's session finds the call here
  test("joinCall records an admitted joiner's call on the joiner's object", async () => {
    expect.hasAssertions();

    const creatorCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const { callSessionId } = await creatorCaller.createCall();
    const joinerAuthSession = await createMockAuthSession(mockContext.db);
    const joinerCaller = await createMockCaller(callRouter, joinerAuthSession);
    const joinCall = vi.fn<(input: unknown) => Promise<unknown>>(() =>
      Promise.resolve({ authToken: "auth-token", meetingId: "meeting-id", participantMap: new Map() }),
    );
    vi.mocked(useCallObject).mockReturnValueOnce({ joinCall } as unknown as ReturnType<typeof useCallObject>);
    userObjectCalls.length = 0;
    await joinerCaller.joinCall({ id: callSessionId });

    expect(userObjectCalls).toStrictEqual([
      { args: [callSessionId], method: "addJoinedCall", userId: joinerAuthSession.user.id },
    ]);
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
    vi.mocked(useCallObject).mockReturnValueOnce({ joinCall } as unknown as ReturnType<typeof useCallObject>);

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
    vi.mocked(useCallObject).mockReturnValueOnce({ leaveCall } as unknown as ReturnType<typeof useCallObject>);

    await expect(creatorCaller.leaveCall({ callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, callSessionId).message}]`,
    );
  });

  test("setMuted refuses a caller whose participant the call object does not hold", async () => {
    expect.hasAssertions();

    const creatorCaller = await createMockCaller(callRouter, await createMockAuthSession(mockContext.db));
    const { callSessionId } = await creatorCaller.createCall();
    const setMuted = vi.fn<(input: unknown) => Promise<boolean>>(() => Promise.resolve(false));
    vi.mocked(useCallObject).mockReturnValueOnce({ setMuted } as unknown as ReturnType<typeof useCallObject>);

    await expect(creatorCaller.setMuted({ callSessionId, isMuted: true })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Must join call first]`,
    );
  });
});
