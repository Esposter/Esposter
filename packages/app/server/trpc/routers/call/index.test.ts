import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { callRouter } from "@@/server/trpc/routers/call";
import { roomRouter } from "@@/server/trpc/routers/room";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { callSessionsInMessage, DatabaseEntityType, roomsInMessage } from "@esposter/db-schema";
import { ForbiddenError, NotFoundError, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

describe("call", () => {
  let mockContext: Context;
  let callCaller: DecorateRouterRecord<TRPCRouter["callSession"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    callCaller = createCallerFactory(callRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    callAdmittedParticipantMap.clear();
    callKnockerMap.clear();
    callSessionParticipantMap.clear();
    await mockContext.db.delete(callSessionsInMessage);
    await mockContext.db.delete(roomsInMessage);
    vi.clearAllMocks();
  });

  test("reads call participants when empty", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await callCaller.leaveCall({ callSessionId });
    const participants = await callCaller.readCallParticipants({ callSessionId });

    expect(participants).toStrictEqual([]);
  });

  test("joins call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { session, user } = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId, participants } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(session.id);
    expect(takeOne(participants).userId).toBe(user.id);
    expect(takeOne(participants).isCameraEnabled).toBe(false);
    expect(takeOne(participants).isMuted).toBe(false);

    const readCallSessionId = await callCaller.readCallSessionId({ roomId: newRoom.id });

    expect(callSessionId).toStrictEqual(readCallSessionId);
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

  test("joining call twice keeps participant list at 1", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    const { participants } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(sessionPayload.session.id);
  });

  test("joining call twice always emits join event for reconnect", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    const emitSpy = vi.spyOn(callEventEmitter, "emit");
    replayMockSession(sessionPayload);
    await callCaller.joinCallByRoomId({ roomId: newRoom.id });

    expect(emitSpy).toHaveBeenCalledWith("joinCall", expect.objectContaining({ callSessionId }));
  });

  test("reads call participants after join", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { session } = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    const participants = await callCaller.readCallParticipants({ callSessionId });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(session.id);
  });

  test("leaves call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await callCaller.leaveCall({ callSessionId });
    const participants = await callCaller.readCallParticipants({ callSessionId });

    expect(participants).toStrictEqual([]);
  });

  test("fails leaveCall if caller is not in call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    const { session } = await mockSessionOnce(mockContext.db, getMockSession().user);

    await expect(callCaller.leaveCall({ callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, session.id).message}]`,
    );
  });

  test("sets mute", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await callCaller.setMute({ callSessionId, isMuted: true });
    const participants = await callCaller.readCallParticipants({ callSessionId });

    expect(takeOne(participants).isMuted).toBe(true);
  });

  test("on participant joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteToken = await roomCaller.createInvite({ roomId: newRoom.id });
    await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    const onJoinCall = await callCaller.onJoinCall(callSessionId);
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteToken);
    const { session: callSession } = await mockSessionOnce(mockContext.db, user);
    const data = await withAsyncIterator(
      () => onJoinCall,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), callCaller.joinCallByRoomId({ roomId: newRoom.id })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.id).toBe(callSession.id);
    expect(data.value.userId).toBe(user.id);
    expect(data.value.isMuted).toBe(false);
  });

  test("on participant leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteToken = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteToken);
    const joiningSessionPayload = await mockSessionOnce(mockContext.db, user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    const onLeaveCall = await callCaller.onLeaveCall(callSessionId);
    replayMockSession(joiningSessionPayload);
    const data = await withAsyncIterator(
      () => onLeaveCall,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), callCaller.leaveCall({ callSessionId })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toBe(joiningSessionPayload.session.id);
  });

  test("on mute changed", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    const onSetMute = await callCaller.onSetMute(callSessionId);
    replayMockSession(sessionPayload);
    const data = await withAsyncIterator(
      () => onSetMute,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), callCaller.setMute({ callSessionId, isMuted: true })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toStrictEqual({ id: sessionPayload.session.id, isMuted: true });
  });

  test("on video changed", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    const onVideoChanged = await callCaller.onVideoChanged(callSessionId);
    replayMockSession(sessionPayload);
    const data = await withAsyncIterator(
      () => onVideoChanged,
      async (iterator) => {
        const [result] = await Promise.all([
          iterator.next(),
          callCaller.setCamera({ callSessionId, isCameraEnabled: true }),
        ]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toStrictEqual({ id: sessionPayload.session.id, isCameraEnabled: true });
  });

  test("fails join for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(callCaller.joinCallByRoomId({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails setMute if caller is not in call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });

    await expect(callCaller.setMute({ callSessionId, isMuted: true })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Must join call first").message}]`,
    );
  });

  test("multiple participants join and see each other", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteToken = await roomCaller.createInvite({ roomId: newRoom.id });
    const defaultSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteToken);
    const { session: userBSession } = await mockSessionOnce(mockContext.db, user);
    const { participants } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });

    expect(participants).toHaveLength(2);
    expect(participants.some(({ id }) => id === defaultSessionPayload.session.id)).toBe(true);
    expect(participants.some(({ id }) => id === userBSession.id)).toBe(true);
  });

  test("fails setCamera if caller is not in call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });

    await expect(
      callCaller.setCamera({ callSessionId, isCameraEnabled: true }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${new ForbiddenError("Must join call first").message}]`);
  });

  test("joins standalone call by id", async () => {
    expect.hasAssertions();

    const { callSessionId: expectedCallSessionId } = await callCaller.createCall();
    const { callSessionId, participants } = await callCaller.joinCall({ id: expectedCallSessionId });

    expect(participants).toHaveLength(1);
    expect(callSessionId).toBe(expectedCallSessionId);
    expect(takeOne(participants).isMuted).toBe(false);
  });

  test("prevents non-creator from directly joining standalone call", async () => {
    expect.hasAssertions();

    const { callSessionId } = await callCaller.createCall();
    await mockSessionOnce(mockContext.db);

    await expect(callCaller.joinCall({ id: callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Must be admitted to join this call").message}]`,
    );
  });

  test("fails joinCall for room call session", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await callCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await callCaller.leaveCall({ callSessionId });
    await mockSessionOnce(mockContext.db);

    await expect(callCaller.joinCall({ id: callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Room calls must be joined via joinCallByRoomId").message}]`,
    );
  });
});
