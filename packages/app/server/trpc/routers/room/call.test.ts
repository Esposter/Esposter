import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { callRouter } from "@@/server/trpc/routers/room/call";
import { withAsyncIterator } from "@@/server/trpc/routers/withAsyncIterator.test";
import { callSessionsInMessage, DatabaseEntityType, roomsInMessage } from "@esposter/db-schema";
import { ForbiddenError, NotFoundError, takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

describe("call", () => {
  let mockContext: Context;
  let roomCallCaller: DecorateRouterRecord<TRPCRouter["roomCall"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    roomCallCaller = createCallerFactory(callRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    callSessionParticipantMap.clear();
    await mockContext.db.delete(callSessionsInMessage);
    await mockContext.db.delete(roomsInMessage);
    vi.clearAllMocks();
  });

  test("reads call participants when empty", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await roomCallCaller.leaveCall({ callSessionId });
    const participants = await roomCallCaller.readCallParticipants({ callSessionId });

    expect(participants).toStrictEqual([]);
  });

  test("joins call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { session, user } = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId, participants } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(session.id);
    expect(takeOne(participants).userId).toBe(user.id);
    expect(takeOne(participants).isCameraEnabled).toBe(false);
    expect(takeOne(participants).isMuted).toBe(false);

    const readSessionId = await roomCallCaller.readCallSessionId({ roomId: newRoom.id });

    expect(callSessionId).toStrictEqual(readSessionId);
  });

  test("creates standalone call", async () => {
    expect.hasAssertions();

    const { callSessionId } = await roomCallCaller.createCall();
    const callSession = await mockContext.db.query.callSessionsInMessage.findFirst({
      where: { id: { eq: callSessionId } },
    });

    expect(callSession?.id).toBe(callSessionId);
    expect(callSession?.roomId).toBeNull();
  });

  test("joining call twice keeps participant list at 1", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    const { participants } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(sessionPayload.session.id);
  });

  test("joining call twice always emits join event for reconnect", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    const emitSpy = vi.spyOn(callEventEmitter, "emit");
    replayMockSession(sessionPayload);
    await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });

    expect(emitSpy).toHaveBeenCalledWith("joinCall", expect.objectContaining({ callSessionId }));
  });

  test("reads call participants after join", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { session } = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    const participants = await roomCallCaller.readCallParticipants({ callSessionId });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(session.id);
  });

  test("leaves call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await roomCallCaller.leaveCall({ callSessionId });
    const participants = await roomCallCaller.readCallParticipants({ callSessionId });

    expect(participants).toStrictEqual([]);
  });

  test("fails leaveCall if caller is not in call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    const { session } = await mockSessionOnce(mockContext.db, getMockSession().user);

    await expect(roomCallCaller.leaveCall({ callSessionId })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new NotFoundError(DatabaseEntityType.CallSession, session.id).message}]`,
    );
  });

  test("sets mute", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await roomCallCaller.setMute({ callSessionId, isMuted: true });
    const participants = await roomCallCaller.readCallParticipants({ callSessionId });

    expect(takeOne(participants).isMuted).toBe(true);
  });

  test("on participant joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteToken = await roomCaller.createInvite({ roomId: newRoom.id });
    await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    const onJoinCall = await roomCallCaller.onJoinCall(callSessionId);
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteToken);
    const { session: callSession } = await mockSessionOnce(mockContext.db, user);
    const data = await withAsyncIterator(
      () => onJoinCall,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), roomCallCaller.joinCallByRoomId({ roomId: newRoom.id })]);
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
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    const onLeaveCall = await roomCallCaller.onLeaveCall(callSessionId);
    replayMockSession(joiningSessionPayload);
    const data = await withAsyncIterator(
      () => onLeaveCall,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), roomCallCaller.leaveCall({ callSessionId })]);
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
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    const onSetMute = await roomCallCaller.onSetMute(callSessionId);
    replayMockSession(sessionPayload);
    const data = await withAsyncIterator(
      () => onSetMute,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), roomCallCaller.setMute({ callSessionId, isMuted: true })]);
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
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    const onVideoChanged = await roomCallCaller.onVideoChanged(callSessionId);
    replayMockSession(sessionPayload);
    const data = await withAsyncIterator(
      () => onVideoChanged,
      async (iterator) => {
        const [result] = await Promise.all([
          iterator.next(),
          roomCallCaller.setCamera({ callSessionId, isCameraEnabled: true }),
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

    await expect(roomCallCaller.joinCallByRoomId({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails setMute if caller is not in call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });

    await expect(roomCallCaller.setMute({ callSessionId, isMuted: true })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: ${new ForbiddenError("Must join call first").message}]`,
    );
  });

  test("multiple participants join and see each other", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteToken = await roomCaller.createInvite({ roomId: newRoom.id });
    const defaultSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteToken);
    const { session: userBSession } = await mockSessionOnce(mockContext.db, user);
    const { participants } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });

    expect(participants).toHaveLength(2);
    expect(participants.some(({ id }) => id === defaultSessionPayload.session.id)).toBe(true);
    expect(participants.some(({ id }) => id === userBSession.id)).toBe(true);
  });

  test("fails setCamera if caller is not in call", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });

    await expect(
      roomCallCaller.setCamera({ callSessionId, isCameraEnabled: true }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: ${new ForbiddenError("Must join call first").message}]`);
  });

  test("joins call by id", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    const { callSessionId: expectedCallSessionId } = await roomCallCaller.joinCallByRoomId({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await roomCallCaller.leaveCall({ callSessionId: expectedCallSessionId });
    await mockSessionOnce(mockContext.db);
    const { callSessionId, participants } = await roomCallCaller.joinCall({ id: expectedCallSessionId });

    expect(participants).toHaveLength(1);
    expect(callSessionId).toBe(expectedCallSessionId);
    expect(takeOne(participants).isMuted).toBe(false);
  });
});
