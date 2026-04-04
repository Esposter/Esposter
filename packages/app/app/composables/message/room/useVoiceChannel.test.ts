import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";
import type { VueWrapper } from "@vue/test-utils";

import { useVoiceStore } from "@/store/message/voice";
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test } from "vitest";

describe(useVoiceChannel, () => {
  let wrapper: VueWrapper;
  let isInChannel: Ref<boolean>;
  let isMuted: Ref<boolean>;
  let speakingUserIds: Ref<string[]>;
  let join: () => Promise<void>;
  let leave: () => Promise<void>;
  let toggleMute: () => Promise<void>;
  let participantsByRoom: Ref<Record<string, VoiceParticipant[]>>;
  let joinVoice: (roomId: string, participant: VoiceParticipant) => void;
  let leaveVoice: (roomId: string, id: string) => void;
  let setMute: (roomId: string, id: string, isMuted: boolean) => void;
  let setParticipants: (roomId: string, participants: VoiceParticipant[]) => void;

  const mountVoiceChannel = async () => {
    wrapper = await mountSuspended(
      defineComponent({
        render: () => h("div"),
        setup: () => {
          ({ isInChannel, isMuted, join, leave, speakingUserIds, toggleMute } = useVoiceChannel());
          const voiceStore = useVoiceStore();
          ({ participantsByRoom } = storeToRefs(voiceStore));
          ({ joinVoice, leaveVoice, setMute, setParticipants } = voiceStore);
          participantsByRoom.value = {};
        },
      }),
    );
    await flushPromises();
  };

  afterEach(() => {
    wrapper?.unmount();
  });

  test("starts with empty state", async () => {
    expect.hasAssertions();

    await mountVoiceChannel();

    expect(isInChannel.value).toBe(false);
    expect(isMuted.value).toBe(false);
    expect(speakingUserIds.value).toStrictEqual([]);
  });

  test("participants are empty initially", async () => {
    expect.hasAssertions();

    await mountVoiceChannel();

    expect(Object.keys(participantsByRoom.value)).toHaveLength(0);
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

    const roomId = crypto.randomUUID();
    const participant: VoiceParticipant = { id: crypto.randomUUID(), image: null, isMuted: false, name: "" };

    await mountVoiceChannel();
    joinVoice(roomId, participant);

    const roomParticipants = participantsByRoom.value[roomId] ?? [];

    expect(roomParticipants).toHaveLength(1);
    expect(takeOne(roomParticipants)).toStrictEqual(participant);
  });

  test("joinVoice deduplicates same participant", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const participant: VoiceParticipant = { id: crypto.randomUUID(), image: null, isMuted: false, name: "" };

    await mountVoiceChannel();
    joinVoice(roomId, participant);
    joinVoice(roomId, participant);

    expect(participantsByRoom.value[roomId]).toHaveLength(1);
  });

  test("leaveVoice removes participant from room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const participant: VoiceParticipant = { id: crypto.randomUUID(), image: null, isMuted: false, name: "" };

    await mountVoiceChannel();
    joinVoice(roomId, participant);
    leaveVoice(roomId, participant.id);

    expect(participantsByRoom.value[roomId]).toStrictEqual([]);
  });

  test("setMute updates participant mute state", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const participant: VoiceParticipant = { id: crypto.randomUUID(), image: null, isMuted: false, name: "" };

    await mountVoiceChannel();
    joinVoice(roomId, participant);
    setMute(roomId, participant.id, true);

    const roomParticipants = participantsByRoom.value[roomId] ?? [];

    expect(takeOne(roomParticipants).isMuted).toBe(true);
  });

  test("setMute is no-op when participant not in room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();

    await mountVoiceChannel();
    setMute(roomId, crypto.randomUUID(), true);

    expect(participantsByRoom.value[roomId]).toBeUndefined();
  });

  test("setParticipants replaces all participants for room", async () => {
    expect.hasAssertions();

    const roomId = crypto.randomUUID();
    const participants: VoiceParticipant[] = [
      { id: crypto.randomUUID(), image: null, isMuted: false, name: "" },
      { id: crypto.randomUUID(), image: null, isMuted: false, name: " " },
    ];

    await mountVoiceChannel();
    setParticipants(roomId, participants);

    expect(participantsByRoom.value[roomId]).toStrictEqual(participants);
  });
});
