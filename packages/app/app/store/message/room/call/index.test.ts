// @vitest-environment nuxt
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { useCallMediaStore } from "@/store/message/room/call/media";
import { useCallParticipantStore } from "@/store/message/room/call/participant";
import { getMockSession } from "@@/server/trpc/context.test";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useCallParticipantStore, () => {
  const callSessionId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("createSpeaker", () => {
    test("adds id to speakingIds", () => {
      expect.hasAssertions();

      const participantStore = useCallParticipantStore();
      const { createSpeaker } = participantStore;
      const { speakingIds } = storeToRefs(participantStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);

      expect(speakingIds.value).toStrictEqual([sessionId]);
    });

    test("deduplicates speaking ids", () => {
      expect.hasAssertions();

      const participantStore = useCallParticipantStore();
      const { createSpeaker } = participantStore;
      const { speakingIds } = storeToRefs(participantStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);
      createSpeaker(sessionId);

      expect(speakingIds.value).toHaveLength(1);
    });
  });

  describe("deleteSpeaker", () => {
    test("removes id from speakingIds", () => {
      expect.hasAssertions();

      const participantStore = useCallParticipantStore();
      const { createSpeaker, deleteSpeaker } = participantStore;
      const { speakingIds } = storeToRefs(participantStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);
      deleteSpeaker(sessionId);

      expect(speakingIds.value).toStrictEqual([]);
    });
  });

  describe("createCallParticipant", () => {
    test("adds participant to session", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isCameraEnabled: false,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const participantStore = useCallParticipantStore();
      const { createCallParticipant } = participantStore;
      const { callSessionParticipantsMap } = storeToRefs(participantStore);
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
        isCameraEnabled: false,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const participantStore = useCallParticipantStore();
      const { createCallParticipant } = participantStore;
      const { callSessionParticipantsMap } = storeToRefs(participantStore);
      createCallParticipant(callSessionId, participant);
      createCallParticipant(callSessionId, participant);

      expect(callSessionParticipantsMap.value.get(callSessionId)).toHaveLength(1);
    });
  });

  describe("setMute", () => {
    test("updates participant mute state", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isCameraEnabled: false,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };

      const participantStore = useCallParticipantStore();
      const { createCallParticipant, setMute } = participantStore;
      const { callSessionParticipantsMap } = storeToRefs(participantStore);
      createCallParticipant(callSessionId, participant);
      setMute(callSessionId, participant.id, true);

      const sessionParticipants = callSessionParticipantsMap.value.get(callSessionId) ?? [];

      expect(takeOne(sessionParticipants).isMuted).toBe(true);
    });
  });
});

describe(useCallMediaStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("setRemoteScreenShareStream", () => {
    test("stores remote screen share stream", () => {
      expect.hasAssertions();

      const stream = new MediaStream();
      const participantId = getMockSession().session.id;
      const mediaStore = useCallMediaStore();
      const { setRemoteScreenShareStream } = mediaStore;
      const { hasScreenShare, remoteScreenShareStreams, screenSharingParticipantIds } = storeToRefs(mediaStore);
      setRemoteScreenShareStream(participantId, stream);

      expect(hasScreenShare.value).toBe(true);
      expect(remoteScreenShareStreams.value.get(participantId)).toBe(stream);
      expect(screenSharingParticipantIds.value).toStrictEqual([participantId]);
    });

    test("removes remote screen share stream", () => {
      expect.hasAssertions();

      const stream = new MediaStream();
      const participantId = getMockSession().session.id;
      const mediaStore = useCallMediaStore();
      const { setRemoteScreenShareStream } = mediaStore;
      const { hasScreenShare, pinnedParticipantId, remoteScreenShareStreams, screenSharingParticipantIds } =
        storeToRefs(mediaStore);
      setRemoteScreenShareStream(participantId, stream);
      pinnedParticipantId.value = participantId;
      setRemoteScreenShareStream(participantId, null);

      expect(hasScreenShare.value).toBe(false);
      expect(remoteScreenShareStreams.value.has(participantId)).toBe(false);
      expect(screenSharingParticipantIds.value).toStrictEqual([]);
      expect(pinnedParticipantId.value).toBe("");
    });
  });
});
