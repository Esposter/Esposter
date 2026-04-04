import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { VoiceSignalType } from "#shared/models/room/voice/VoiceSignalType";
import { voiceRoomParticipantMap } from "@@/server/services/message/voice/voiceParticipantMap";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { roomRouter } from "@@/server/trpc/routers/room";
import { voiceRouter } from "@@/server/trpc/routers/room/voice";
import { rooms } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, assert, beforeAll, describe, expect, test } from "vitest";

describe("voice", () => {
  let voiceCaller: DecorateRouterRecord<TRPCRouter["voice"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let mockContext: Context;

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

    const newRoom = await roomCaller.createRoom({ name: "name" });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toStrictEqual([]);
  });

  test("joins voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    const participants = await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(getMockSession().user.id);
    expect(takeOne(participants).isMuted).toBe(false);
  });

  test("reads voice participants after join", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toHaveLength(1);
    expect(takeOne(participants).id).toBe(getMockSession().user.id);
  });

  test("leaves voice channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    await voiceCaller.leaveVoiceChannel({ roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toStrictEqual([]);
  });

  test("sets mute", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    await voiceCaller.setMute({ isMuted: true, roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(takeOne(participants).isMuted).toBe(true);
  });

  test("on participant joins", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const onParticipantJoin = await voiceCaller.onParticipantJoin(newRoom.id);
    const { user: joiningUser } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    const [data] = await Promise.all([
      onParticipantJoin[Symbol.asyncIterator]().next(),
      voiceCaller.joinVoiceChannel({ roomId: newRoom.id }),
    ]);

    assert(!data.done);

    expect(data.value.id).toBe(joiningUser.id);
    expect(data.value.isMuted).toBe(false);
  });

  test("on participant leaves", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user: leavingUser } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const onParticipantLeave = await voiceCaller.onParticipantLeave(newRoom.id);
    await mockSessionOnce(mockContext.db, leavingUser);
    const [data] = await Promise.all([
      onParticipantLeave[Symbol.asyncIterator]().next(),
      voiceCaller.leaveVoiceChannel({ roomId: newRoom.id }),
    ]);

    assert(!data.done);

    expect(data.value).toBe(leavingUser.id);
  });

  test("on mute changed", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const onMuteChanged = await voiceCaller.onMuteChanged(newRoom.id);
    const [data] = await Promise.all([
      onMuteChanged[Symbol.asyncIterator]().next(),
      voiceCaller.setMute({ isMuted: true, roomId: newRoom.id }),
    ]);

    assert(!data.done);

    expect(data.value).toStrictEqual({ id: getMockSession().user.id, isMuted: true });
  });

  test("fails join for non-member", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    await mockSessionOnce(mockContext.db);

    await expect(voiceCaller.joinVoiceChannel({ roomId: newRoom.id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: UNAUTHORIZED]`,
    );
  });

  test("setMute is no-op when not in channel", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    await voiceCaller.setMute({ isMuted: true, roomId: newRoom.id });
    const participants = await voiceCaller.readVoiceParticipants({ roomId: newRoom.id });

    expect(participants).toStrictEqual([]);
  });

  test("multiple participants join and see each other", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });
    const { user: secondUser } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    await mockSessionOnce(mockContext.db, secondUser);
    const participants = await voiceCaller.joinVoiceChannel({ roomId: newRoom.id });

    expect(participants).toHaveLength(2);
    expect(participants.some(({ id }) => id === getMockSession().user.id)).toBe(true);
    expect(participants.some(({ id }) => id === secondUser.id)).toBe(true);
  });

  test("on signal delivers to target user", async () => {
    expect.hasAssertions();

    const newRoom = await roomCaller.createRoom({ name: "name" });
    const newInviteCode = await roomCaller.createInvite({ roomId: newRoom.id });
    const { user: targetUser } = getMockSession();
    const onSignal = await voiceCaller.onSignal(newRoom.id);
    const { user: senderUser } = await mockSessionOnce(mockContext.db);
    await roomCaller.joinRoom(newInviteCode);
    const payload = { data: "{}", targetUserId: targetUser.id, type: VoiceSignalType.Offer };
    const [data] = await Promise.all([
      onSignal[Symbol.asyncIterator]().next(),
      voiceCaller.sendSignal({ payload, roomId: newRoom.id }),
    ]);

    assert(!data.done);

    expect(data.value.senderId).toBe(senderUser.id);
    expect(data.value.payload).toStrictEqual(payload);
  });
});
