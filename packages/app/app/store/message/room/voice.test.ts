import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";
import type { Context } from "@@/server/trpc/context";

import { useVoiceStore } from "@/store/message/room/voice";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(useVoiceStore, () => {
  const roomId = crypto.randomUUID();
  let mockContext: Context;

  beforeAll(async () => {
    mockContext = await createMockContext();
  });

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

  describe("createVoiceParticipant", () => {
    test("adds participant to room", () => {
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
      const { createVoiceParticipant } = voiceStore;
      const { voiceParticipantsRoomMap } = storeToRefs(voiceStore);
      createVoiceParticipant(roomId, participant);

      const roomParticipants = voiceParticipantsRoomMap.value.get(roomId) ?? [];

      expect(roomParticipants).toHaveLength(1);
      expect(takeOne(roomParticipants)).toStrictEqual(participant);
    });

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
      const { createVoiceParticipant } = voiceStore;
      const { voiceParticipantsRoomMap } = storeToRefs(voiceStore);
      createVoiceParticipant(roomId, participant);
      createVoiceParticipant(roomId, participant);

      expect(voiceParticipantsRoomMap.value.get(roomId)).toHaveLength(1);
    });
  });

  describe("deleteVoiceParticipant", () => {
    test("removes participant from room", () => {
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
      const { createVoiceParticipant, deleteVoiceParticipant } = voiceStore;
      const { voiceParticipantsRoomMap } = storeToRefs(voiceStore);
      createVoiceParticipant(roomId, participant);
      deleteVoiceParticipant(roomId, participant.id);

      expect(voiceParticipantsRoomMap.value.get(roomId)).toStrictEqual([]);
    });

    test("is no-op when participant not in room", () => {
      expect.hasAssertions();

      const voiceStore = useVoiceStore();
      const { deleteVoiceParticipant } = voiceStore;
      const { voiceParticipantsRoomMap } = storeToRefs(voiceStore);
      deleteVoiceParticipant(roomId, "-1");

      expect(voiceParticipantsRoomMap.value.get(roomId)).toBeUndefined();
    });
  });

  describe("setMute", () => {
    test("updates participant mute state", () => {
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
      const { createVoiceParticipant, setMute } = voiceStore;
      const { voiceParticipantsRoomMap } = storeToRefs(voiceStore);
      createVoiceParticipant(roomId, participant);
      setMute(roomId, participant.id, true);

      const roomParticipants = voiceParticipantsRoomMap.value.get(roomId) ?? [];

      expect(takeOne(roomParticipants).isMuted).toBe(true);
    });

    test("is no-op when participant not in room", () => {
      expect.hasAssertions();

      const sessionId = getMockSession().session.id;
      const voiceStore = useVoiceStore();
      const { setMute } = voiceStore;
      const { voiceParticipantsRoomMap } = storeToRefs(voiceStore);
      setMute(roomId, sessionId, true);

      expect(voiceParticipantsRoomMap.value.get(roomId)).toBeUndefined();
    });
  });

  describe("setParticipants", () => {
    test("replaces all participants for room", async () => {
      expect.hasAssertions();

      const { session: firstSession, user: firstUser } = getMockSession();
      const { session: secondSession, user: secondUser } = await mockSessionOnce(mockContext.db);
      const participants: VoiceParticipant[] = [
        { id: firstSession.id, image: firstUser.image, isMuted: false, name: firstUser.name, userId: firstUser.id },
        { id: secondSession.id, image: secondUser.image, isMuted: false, name: secondUser.name, userId: secondUser.id },
      ];

      const voiceStore = useVoiceStore();
      const { setParticipants } = voiceStore;
      const { voiceParticipantsRoomMap } = storeToRefs(voiceStore);
      setParticipants(roomId, participants);

      expect(voiceParticipantsRoomMap.value.get(roomId)).toStrictEqual(participants);
    });
  });
});
