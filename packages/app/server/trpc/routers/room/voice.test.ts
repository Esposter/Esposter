import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { VoiceSignalType } from "#shared/models/room/voice/VoiceSignalType";
import { voiceEventEmitter } from "@@/server/services/message/events/voiceEventEmitter";
import { voiceRoomParticipantMap } from "@@/server/services/message/voice/voiceParticipantMap";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { voiceRouter } from "@@/server/trpc/routers/room/voice";
import { withAsyncIterator } from "@@/server/trpc/routers/testUtils.test";
import { roomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

describe("voice", () => {
  let mockContext: Context;
  let voiceCaller: DecorateRouterRecord<TRPCRouter["voice"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    voiceCaller = createCallerFactory(voiceRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  afterEach(async () => {
    voiceRoomParticipantMap.clear();
    await mockContext.db.delete(roomsInMessage);
    vi.clearAllMocks();
  });

  test("reads voice participants when empty", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toStrictEqual([]);
  });

  test("joins voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { session, user } = await mockSessionOnce(mockContext.db, getMockSession().user);
    const participants = await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(session.id);
    expect(takeOne(participants).userId).toBe(user.id);
    expect(takeOne(participants).isMuted).toBe(false);
  });

  test("joining voice channel twice keeps participant list at 1", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    const participants = await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(sessionPayload.session.id);
  });

  test("joining voice channel twice always emits join event for reconnect", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const emitSpy = vi.spyOn(voiceEventEmitter, "emit");
    replayMockSession(sessionPayload);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });

    expect(emitSpy).toHaveBeenCalledWith("joinVoiceChannel", expect.objectContaining({ roomId: newRoom.id }));
  });

  test("reads voice participants after join", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { session } = await mockSessionOnce(mockContext.db, getMockSession().user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(session.id);
  });

  test("leaves voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await voiceCaller.leaveVoiceChannel({ roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toStrictEqual([]);
  });

  test("does not emit leave event when participant was not in voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const emitSpy = vi.spyOn(voiceEventEmitter, "emit");
    await voiceCaller.leaveVoiceChannel({ roomId: newRoom.id });

    expect(emitSpy).not.toHaveBeenCalled();
  });

  test("sets mute", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    await voiceCaller.setMute({ isMuted: true, roomId: newRoom.id });
    replayMockSession(sessionPayload);
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(takeOne(participants).isMuted).toBe(true);
  });

  test("on participant joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const onParticipantJoin = await voiceCaller.onParticipantJoin(newRoom.id);
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    const { session: voiceSession } = await mockSessionOnce(mockContext.db, user);
    const data = await withAsyncIterator(
      () => onParticipantJoin,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), voiceCaller.joinVoiceChannel({ roomId: newRoom.id })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.id).toBe(voiceSession.id);
    expect(data.value.userId).toBe(user.id);
    expect(data.value.isMuted).toBe(false);
  });

  test("on participant leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    const joiningSessionPayload = await mockSessionOnce(mockContext.db, user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const onParticipantLeave = await voiceCaller.onParticipantLeave(newRoom.id);
    replayMockSession(joiningSessionPayload);
    const data = await withAsyncIterator(
      () => onParticipantLeave,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), voiceCaller.leaveVoiceChannel({ roomId: newRoom.id })]);
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
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const onMuteChanged = await voiceCaller.onMuteChanged(newRoom.id);
    replayMockSession(sessionPayload);
    const data = await withAsyncIterator(
      () => onMuteChanged,
      async (iterator) => {
        const [result] = await Promise.all([
          iterator.next(),
          voiceCaller.setMute({ isMuted: true, roomId: newRoom.id }),
        ]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toStrictEqual({ id: sessionPayload.session.id, isMuted: true });
  });

  test("fails join for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(voiceCaller.joinVoiceChannel({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("fails setMute if caller is not in voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });

    await expect(voiceCaller.setMute({ isMuted: true, roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Must join voice channel first]`,
    );
  });

  test("multiple participants join and see each other", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const defaultSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    const { session: userBSession } = await mockSessionOnce(mockContext.db, user);
    const participants = await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });

    expect(participants).toHaveLength(2);
    expect(participants.some(({ id }) => id === defaultSessionPayload.session.id)).toBe(true);
    expect(participants.some(({ id }) => id === userBSession.id)).toBe(true);
  });

  test("on signal delivers to target user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const defaultSessionPayload = await mockSessionOnce(mockContext.db, getMockSession().user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    replayMockSession(defaultSessionPayload);
    const onSignal = await voiceCaller.onSignal(newRoom.id);
    const { user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    const userBSessionPayload = await mockSessionOnce(mockContext.db, user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    replayMockSession(userBSessionPayload);
    const payload = { data: "{}", targetId: defaultSessionPayload.session.id, type: VoiceSignalType.Offer };
    const data = await withAsyncIterator(
      () => onSignal,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), voiceCaller.sendSignal({ payload, roomId: newRoom.id })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.senderId).toBe(userBSessionPayload.session.id);
    expect(data.value.payload).toStrictEqual(payload);
  });

  test("fails sendSignal if sender is not in voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const sessionId = getMockSession().session.id;
    const payload = { data: "{}", targetId: sessionId, type: VoiceSignalType.Offer };

    await expect(voiceCaller.sendSignal({ payload, roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Must join voice channel first]`,
    );
  });

  test("fails sendSignal if target is not in voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const { user } = getMockSession();
    const sessionPayload = await mockSessionOnce(mockContext.db, user);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    replayMockSession(sessionPayload);
    const payload = { data: "{}", targetId: crypto.randomUUID(), type: VoiceSignalType.Offer };

    await expect(voiceCaller.sendSignal({ payload, roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Target participant not found]`,
    );
  });
});
