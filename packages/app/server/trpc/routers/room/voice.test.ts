import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { VoiceSignalType } from "#shared/models/room/voice/VoiceSignalType";
import { voiceRoomParticipantMap } from "@@/server/services/message/voice/voiceParticipantMap";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { voiceRouter } from "@@/server/trpc/routers/room/voice";
import { withAsyncIterator } from "@@/server/trpc/routers/testUtils.test";
import { rooms } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

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
    await mockContext.db.delete(rooms);
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
    const participants = await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(getMockSession().session.id);
    expect(takeOne(participants).userId).toBe(getMockSession().user.id);
    expect(takeOne(participants).isMuted).toBe(false);
  });

  test("reads voice participants after join", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(getMockSession().session.id);
  });

  test("leaves voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    await voiceCaller.leaveVoiceChannel({ roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toStrictEqual([]);
  });

  test("sets mute", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    await voiceCaller.setMute({ isMuted: true, roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(takeOne(participants).isMuted).toBe(true);
  });

  test("on participant joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const onParticipantJoin = await voiceCaller.onParticipantJoin(newRoom.id);
    const { session, user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    await mockSessionOnce(mockContext.db, user);
    const data = await withAsyncIterator(
      () => onParticipantJoin,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), voiceCaller.joinVoiceChannel({ roomId: newRoom.id })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.id).toBe(session.id);
    expect(data.value.userId).toBe(user.id);
    expect(data.value.isMuted).toBe(false);
  });

  test("on participant leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { session, user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const onParticipantLeave = await voiceCaller.onParticipantLeave(newRoom.id);
    await mockSessionOnce(mockContext.db, user);
    const data = await withAsyncIterator(
      () => onParticipantLeave,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), voiceCaller.leaveVoiceChannel({ roomId: newRoom.id })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value).toBe(session.id);
  });

  test("on mute changed", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const onMuteChanged = await voiceCaller.onMuteChanged(newRoom.id);
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

    expect(data.value).toStrictEqual({ id: getMockSession().session.id, isMuted: true });
  });

  test("fails join for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await mockSessionOnce(mockContext.db);

    await expect(voiceCaller.joinVoiceChannel({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("setMute is no-op when not in channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await voiceCaller.setMute({ isMuted: true, roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toStrictEqual([]);
  });

  test("multiple participants join and see each other", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const { session, user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    await mockSessionOnce(mockContext.db, user);
    const participants = await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });

    expect(participants).toHaveLength(2);
    expect(participants.some(({ id }) => id === getMockSession().session.id)).toBe(true);
    expect(participants.some(({ id }) => id === session.id)).toBe(true);
  });

  test("on signal delivers to target user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const sessionId = getMockSession().session.id;
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const onSignal = await voiceCaller.onSignal(newRoom.id);
    const { session, user } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    await mockSessionOnce(mockContext.db, user);
    const payload = { data: "{}", targetId: sessionId, type: VoiceSignalType.Offer };
    const data = await withAsyncIterator(
      () => onSignal,
      async (iterator) => {
        const [result] = await Promise.all([iterator.next(), voiceCaller.sendSignal({ payload, roomId: newRoom.id })]);
        return result;
      },
    );

    assert(!data.done);

    expect(data.value.senderId).toBe(session.id);
    expect(data.value.payload).toStrictEqual(payload);
  });

  test("fails sendSignal if sender is not in voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    const payload = { data: "{}", targetId: getMockSession().session.id, type: VoiceSignalType.Offer };

    await expect(voiceCaller.sendSignal({ payload, roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Must join voice channel first]`,
    );
  });

  test("fails sendSignal if target is not in voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const payload = { data: "{}", targetId: crypto.randomUUID(), type: VoiceSignalType.Offer };

    await expect(voiceCaller.sendSignal({ payload, roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Target participant not found]`,
    );
  });
});
