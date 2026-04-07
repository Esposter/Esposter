import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

import { useVoiceStore } from "@/store/message/room/voice";
import { getMockSession } from "@@/server/trpc/context.test";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useVoiceStore, () => {
  const roomId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("createSpeaker", () => {
    test("adds id to speakingIds", () => {
      expect.hasAssertions();

      const voiceStore = useVoiceStore();
      const { createSpeaker } = voiceStore;
      const { speakingIds } = storeToRefs(voiceStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);

      expect(speakingIds.value).toStrictEqual([sessionId]);
    });

    test("is no-op when already speaking", () => {
      expect.hasAssertions();

      const voiceStore = useVoiceStore();
      const { createSpeaker } = voiceStore;
      const { speakingIds } = storeToRefs(voiceStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);
      createSpeaker(sessionId);

      expect(speakingIds.value).toHaveLength(1);
    });
  });

  describe("deleteSpeaker", () => {
    test("removes id from speakingIds", () => {
      expect.hasAssertions();

      const voiceStore = useVoiceStore();
      const { createSpeaker, deleteSpeaker } = voiceStore;
      const { speakingIds } = storeToRefs(voiceStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);
      deleteSpeaker(sessionId);

      expect(speakingIds.value).toStrictEqual([]);
    });

    test("is no-op when id not present", () => {
      expect.hasAssertions();

      const voiceStore = useVoiceStore();
      const { deleteSpeaker } = voiceStore;
      const { speakingIds } = storeToRefs(voiceStore);
      deleteSpeaker("-1");

      expect(speakingIds.value).toStrictEqual([]);
    });
  });

  describe("clearSpeakers", () => {
    test("empties speakingIds", () => {
      expect.hasAssertions();

      const voiceStore = useVoiceStore();
      const { clearSpeakers, createSpeaker } = voiceStore;
      const { speakingIds } = storeToRefs(voiceStore);
      createSpeaker(getMockSession().session.id);
      createSpeaker(getMockSession().session.id);
      clearSpeakers();

      expect(speakingIds.value).toStrictEqual([]);
    });
  });

  describe("isSpeaking", () => {
    test("participant is speaking when their session id is in speakingIds", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: VoiceParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const voiceStore = useVoiceStore();
      const { createSpeaker } = voiceStore;
      const { speakingIds } = storeToRefs(voiceStore);
      createSpeaker(participant.id);
      const isSpeaking = computed(() => speakingIds.value.includes(participant.id));

      expect(isSpeaking.value).toBe(true);
    });

    test("participant is not speaking when session id absent", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: VoiceParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const voiceStore = useVoiceStore();
      const { speakingIds } = storeToRefs(voiceStore);
      const isSpeaking = computed(() => speakingIds.value.includes(participant.id));

      expect(isSpeaking.value).toBe(false);
    });

    test("userId does not match speakingIds keyed by session id", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: VoiceParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const voiceStore = useVoiceStore();
      const { createSpeaker } = voiceStore;
      const { speakingIds } = storeToRefs(voiceStore);
      createSpeaker(participant.id);
      const isSpeaking = computed(() => speakingIds.value.includes(participant.userId));

      expect(isSpeaking.value).toBe(false);
    });
  });

  describe("joinVoice", () => {
    test("deduplicates same participant", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: VoiceParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const voiceStore = useVoiceStore();
      const { joinVoice } = voiceStore;
      const { voiceParticipantsRoomMap } = storeToRefs(voiceStore);
      joinVoice(roomId, participant);
      joinVoice(roomId, participant);

      expect(voiceParticipantsRoomMap.value.get(roomId)).toHaveLength(1);
    });
  });
});
