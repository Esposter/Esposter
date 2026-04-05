import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";
import type { Context } from "@@/server/trpc/context";
import type { VueWrapper } from "@vue/test-utils";

import { useVoiceStore } from "@/store/message/voice";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe(useVoiceChannel, () => {
  let wrapper: VueWrapper;
  let mockContext: Context;
  let isInChannel: Ref<boolean>;
  let isMuted: Ref<boolean>;
  let speakingIds: Ref<string[]>;
  let join: () => Promise<void>;
  let leave: () => Promise<void>;
  let toggleMute: () => Promise<void>;
  let voiceParticipantsRoomMap: Ref<Map<string, VoiceParticipant[]>>;
  let joinVoice: (roomId: string, participant: VoiceParticipant) => void;
  let leaveVoice: (roomId: string, id: string) => void;
  let setMute: (roomId: string, id: string, isMuted: boolean) => void;
  let setParticipants: (roomId: string, participants: VoiceParticipant[]) => void;
  const roomId = crypto.randomUUID();

  const mountVoiceChannel = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          ({ join, leave, toggleMute } = useVoiceChannel());
          const voiceStore = useVoiceStore();
          ({ isInChannel, isMuted, speakingIds, voiceParticipantsRoomMap } = storeToRefs(voiceStore));
          ({ joinVoice, leaveVoice, setMute, setParticipants } = voiceStore);
          speakingIds.value = [];
          voiceParticipantsRoomMap.value = new Map<string, VoiceParticipant[]>();
        },
      }),
    );
    await flushPromises();
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  test("starts with empty state", async () => {
    expect.hasAssertions();

    await mountVoiceChannel();

    expect(isInChannel.value).toBe(false);
    expect(isMuted.value).toBe(false);
    expect(speakingIds.value).toStrictEqual([]);
  });

  test("participants are empty initially", async () => {
    expect.hasAssertions();

    await mountVoiceChannel();

    expect(voiceParticipantsRoomMap.value.size).toBe(0);
  });

  test("join is no-op without room id", async () => {
    expect.hasAssertions();

    await mountVoiceChannel();
    await join();

    expect(isInChannel.value).toBe(false);
  });

  test("leave is no-op when not in channel", async () => {
    expect.hasAssertions();

    await mountVoiceChannel();
    await leave();

    expect(isInChannel.value).toBe(false);
  });

  test("toggleMute is no-op without joining", async () => {
    expect.hasAssertions();

    await mountVoiceChannel();
    await toggleMute();

    expect(isMuted.value).toBe(false);
  });

  test("joinVoice adds participant to room", async () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();
    const participant: VoiceParticipant = {
      id: session.id,
      image: user.image,
      isMuted: false,
      name: user.name,
      userId: user.id,
    };

    await mountVoiceChannel();
    joinVoice(roomId, participant);

    const roomParticipants = voiceParticipantsRoomMap.value.get(roomId) ?? [];

    expect(roomParticipants).toHaveLength(1);
    expect(takeOne(roomParticipants)).toStrictEqual(participant);
  });

  test("joinVoice deduplicates same participant", async () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();
    const participant: VoiceParticipant = {
      id: session.id,
      image: user.image,
      isMuted: false,
      name: user.name,
      userId: user.id,
    };

    await mountVoiceChannel();
    joinVoice(roomId, participant);
    joinVoice(roomId, participant);

    expect(voiceParticipantsRoomMap.value.get(roomId)).toHaveLength(1);
  });

  test("leaveVoice removes participant from room", async () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();
    const participant: VoiceParticipant = {
      id: session.id,
      image: user.image,
      isMuted: false,
      name: user.name,
      userId: user.id,
    };

    await mountVoiceChannel();
    joinVoice(roomId, participant);
    leaveVoice(roomId, participant.id);

    expect(voiceParticipantsRoomMap.value.get(roomId)).toStrictEqual([]);
  });

  test("setMute updates participant mute state", async () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();
    const participant: VoiceParticipant = {
      id: session.id,
      image: user.image,
      isMuted: false,
      name: user.name,
      userId: user.id,
    };

    await mountVoiceChannel();
    joinVoice(roomId, participant);
    setMute(roomId, participant.id, true);

    const roomParticipants = voiceParticipantsRoomMap.value.get(roomId) ?? [];

    expect(takeOne(roomParticipants).isMuted).toBe(true);
  });

  test("setMute is no-op when participant not in room", async () => {
    expect.hasAssertions();

    const sessionId = getMockSession().session.id;
    await mountVoiceChannel();
    setMute(roomId, sessionId, true);

    expect(voiceParticipantsRoomMap.value.get(roomId)).toBeUndefined();
  });

  test("setParticipants replaces all participants for room", async () => {
    expect.hasAssertions();

    const { session: firstSession, user: firstUser } = getMockSession();
    const { session: secondSession, user: secondUser } = await mockSessionOnce(mockContext.db);
    const participants: VoiceParticipant[] = [
      { id: firstSession.id, image: firstUser.image, isMuted: false, name: firstUser.name, userId: firstUser.id },
      { id: secondSession.id, image: secondUser.image, isMuted: false, name: secondUser.name, userId: secondUser.id },
    ];

    await mountVoiceChannel();
    setParticipants(roomId, participants);

    expect(voiceParticipantsRoomMap.value.get(roomId)).toStrictEqual(participants);
  });
});
