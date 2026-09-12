import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallSessionId } from "@@/server/services/message/call/createCallSessionId";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { createCallerFactory } from "@@/server/trpc";
import { getMockSession, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { setCallParticipant } from "@@/server/trpc/routers/call/setCallParticipant.test";
import { setupCallSuite } from "@@/server/trpc/routers/call/setupCallSuite.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { ForbiddenError } from "@esposter/shared";
import { beforeAll, describe, expect, test, vi } from "vitest";

describe("callRouter", () => {
  const { getCallCaller, getMockContext } = setupCallSuite();
  let mockContext: Context;
  let callCaller: DecorateRouterRecord<TRPCRouter["callSession"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";

  beforeAll(() => {
    mockContext = getMockContext();
    callCaller = getCallCaller();
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  test("creates standalone call", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callCaller.createCall();
    const callSession = await mockContext.db.query.callSessionsInMessage.findFirst({
      where: { id: { eq: callSessionId } },
    });

    expect(callSession?.id).toBe(callSessionId);
    expect(callSession?.roomId).toBeNull();
    expect(callSession?.userId).toBe(getMockSession().user.id);
  });

  test("prevents non-creator from directly joining standalone call", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callCaller.createCall();
    await mockSessionOnce(mockContext.db);

    await expect(callCaller.joinCall({ id: callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Must be admitted to join this call").message}]`,
    );
  });

  test("prevents room member from reading room call participants before joining call", async () => {
    expect.hasAssertions();

    const room = await roomCaller.createRoom({ name });
    const callSessionId = await createCallSessionId(mockContext.db, room.id, getMockSession().user.id);
    const invite = await roomCaller.createInvite({ expireAfterMinutes: 0, maxUses: 0, roomId: room.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(invite.id);
    await mockSessionOnce(mockContext.db, user);

    await expect(callCaller.readCallParticipantMap({ callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Must be in call").message}]`,
    );
  });

  test("sets raised hand state", async () => {
    expect.hasAssertions();

    const getSessionPayload = getMockSession();
    replayMockSession(getSessionPayload);
    const { callSessionId } = await callCaller.createCall();
    setCallParticipant(callSessionId, getSessionPayload);
    const emitSpy = vi.spyOn(callEventEmitter, "emit");
    replayMockSession(getSessionPayload);
    await callCaller.setHandRaised({
      callSessionId,
      isHandRaised: true,
      participantId: getSessionPayload.session.id,
    });

    expect(emitSpy).toHaveBeenCalledExactlyOnceWith("handRaisedChanged", {
      callSessionId,
      id: getSessionPayload.session.id,
      isHandRaised: true,
    });
  });

  test("fails join for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(callCaller.joinCallByRoomId({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });
});
