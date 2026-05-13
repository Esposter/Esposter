// @vitest-environment nuxt
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { Context } from "@@/server/trpc/context";

import { useCallStore } from "@/store/message/room/call";
import { createMockContext, getMockSession, mockSessionOnce } from "@@/server/trpc/context.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(useCallStore, () => {
  const callSessionId = crypto.randomUUID();
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

      const callStore = useCallStore();
      const { createSpeaker } = callStore;
      const { speakingIds } = storeToRefs(callStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);

      expect(speakingIds.value).toStrictEqual([sessionId]);
    });

    test("is no-op when already speaking", () => {
      expect.hasAssertions();

      const callStore = useCallStore();
      const { createSpeaker } = callStore;
      const { speakingIds } = storeToRefs(callStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);
      createSpeaker(sessionId);

      expect(speakingIds.value).toHaveLength(1);
    });
  });

  describe("deleteSpeaker", () => {
    test("removes id from speakingIds", () => {
      expect.hasAssertions();

      const callStore = useCallStore();
      const { createSpeaker, deleteSpeaker } = callStore;
      const { speakingIds } = storeToRefs(callStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);
      deleteSpeaker(sessionId);

      expect(speakingIds.value).toStrictEqual([]);
    });

    test("is no-op when id not present", () => {
      expect.hasAssertions();

      const callStore = useCallStore();
      const { deleteSpeaker } = callStore;
      const { speakingIds } = storeToRefs(callStore);
      deleteSpeaker("-1");

      expect(speakingIds.value).toStrictEqual([]);
    });
  });

  describe("clearSpeakers", () => {
    test("empties speakingIds", () => {
      expect.hasAssertions();

      const callStore = useCallStore();
      const { clearSpeakers, createSpeaker } = callStore;
      const { speakingIds } = storeToRefs(callStore);
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
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const callStore = useCallStore();
      const { createSpeaker } = callStore;
      const { speakingIds } = storeToRefs(callStore);
      createSpeaker(participant.id);
      const isSpeaking = computed(() => speakingIds.value.includes(participant.id));

      expect(isSpeaking.value).toBe(true);
    });

    test("participant is not speaking when session id absent", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const callStore = useCallStore();
      const { speakingIds } = storeToRefs(callStore);
      const isSpeaking = computed(() => speakingIds.value.includes(participant.id));

      expect(isSpeaking.value).toBe(false);
    });

    test("userId does not match speakingIds keyed by session id", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const callStore = useCallStore();
      const { createSpeaker } = callStore;
      const { speakingIds } = storeToRefs(callStore);
      createSpeaker(participant.id);
      const isSpeaking = computed(() => speakingIds.value.includes(participant.userId));

      expect(isSpeaking.value).toBe(false);
    });
  });

  describe("createCallParticipant", () => {
    test("adds participant to session", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const callStore = useCallStore();
      const { createCallParticipant } = callStore;
      const { callSessionParticipantsMap } = storeToRefs(callStore);
      createCallParticipant(callSessionId, participant);

      const sessionParticipants = callSessionParticipantsMap.value.get(callSessionId) ?? [];

      expect(sessionParticipants).toHaveLength(1);
      expect(takeOne(sessionParticipants)).toStrictEqual(participant);
    });

    test("deduplicates same participant", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const callStore = useCallStore();
      const { createCallParticipant } = callStore;
      const { callSessionParticipantsMap } = storeToRefs(callStore);
      createCallParticipant(callSessionId, participant);
      createCallParticipant(callSessionId, participant);

      expect(callSessionParticipantsMap.value.get(callSessionId)).toHaveLength(1);
    });
  });

  describe("deleteCallParticipant", () => {
    test("removes participant from session", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const callStore = useCallStore();
      const { createCallParticipant, deleteCallParticipant } = callStore;
      const { callSessionParticipantsMap } = storeToRefs(callStore);
      createCallParticipant(callSessionId, participant);
      deleteCallParticipant(callSessionId, participant.id);

      expect(callSessionParticipantsMap.value.get(callSessionId)).toStrictEqual([]);
    });

    test("is no-op when participant not in session", () => {
      expect.hasAssertions();

      const callStore = useCallStore();
      const { deleteCallParticipant } = callStore;
      const { callSessionParticipantsMap } = storeToRefs(callStore);
      deleteCallParticipant(callSessionId, "-1");

      expect(callSessionParticipantsMap.value.get(callSessionId)).toBeUndefined();
    });
  });

  describe("setMute", () => {
    test("updates participant mute state", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const callStore = useCallStore();
      const { createCallParticipant, setMute } = callStore;
      const { callSessionParticipantsMap } = storeToRefs(callStore);
      createCallParticipant(callSessionId, participant);
      setMute(callSessionId, participant.id, true);

      const sessionParticipants = callSessionParticipantsMap.value.get(callSessionId) ?? [];

      expect(takeOne(sessionParticipants).isMuted).toBe(true);
    });

    test("is no-op when participant not in session", () => {
      expect.hasAssertions();

      const sessionId = getMockSession().session.id;
      const callStore = useCallStore();
      const { setMute } = callStore;
      const { callSessionParticipantsMap } = storeToRefs(callStore);
      setMute(callSessionId, sessionId, true);

      expect(callSessionParticipantsMap.value.get(callSessionId)).toBeUndefined();
    });
  });

  describe("setParticipants", () => {
    test("replaces all participants for session", async () => {
      expect.hasAssertions();

      const { session: firstSession, user: firstUser } = getMockSession();
      const { session: secondSession, user: secondUser } = await mockSessionOnce(mockContext.db);
      const participants: CallParticipant[] = [
        { id: firstSession.id, image: firstUser.image, isMuted: false, name: firstUser.name, userId: firstUser.id },
        { id: secondSession.id, image: secondUser.image, isMuted: false, name: secondUser.name, userId: secondUser.id },
      ];

      const callStore = useCallStore();
      const { setParticipants } = callStore;
      const { callSessionParticipantsMap } = storeToRefs(callStore);
      setParticipants(callSessionId, participants);

      expect(callSessionParticipantsMap.value.get(callSessionId)).toStrictEqual(participants);
    });
  });
});
