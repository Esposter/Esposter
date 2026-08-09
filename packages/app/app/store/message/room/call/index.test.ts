// @vitest-environment nuxt
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { getMockSession } from "@@/server/trpc/context.test";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

const createCallParticipant = (name: string): CallParticipant => ({
  id: crypto.randomUUID(),
  image: "",
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name,
  userId: crypto.randomUUID(),
});

describe(useParticipantStore, () => {
  const callSessionId = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("createSpeaker", () => {
    test("adds id to speakingIds", () => {
      expect.hasAssertions();

      const participantStore = useParticipantStore();
      const { createSpeaker } = participantStore;
      const { speakingIds } = storeToRefs(participantStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);

      expect(speakingIds.value).toStrictEqual([sessionId]);
    });

    test("createSpeaker is idempotent", () => {
      expect.hasAssertions();

      const participantStore = useParticipantStore();
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

      const participantStore = useParticipantStore();
      const { createSpeaker, deleteSpeaker } = participantStore;
      const { speakingIds } = storeToRefs(participantStore);
      const sessionId = getMockSession().session.id;
      createSpeaker(sessionId);
      deleteSpeaker(sessionId);

      expect(speakingIds.value).toStrictEqual([]);
    });
  });

  describe("setHandRaised", () => {
    test("sets raised hand state", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isCameraEnabled: false,
        isHandRaised: false,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };
      const participantStore = useParticipantStore();
      const { createCallParticipant, setHandRaised } = participantStore;
      const { callSessionParticipantsMap } = storeToRefs(participantStore);
      createCallParticipant(callSessionId, participant);
      setHandRaised(callSessionId, session.id, true);

      expect(callSessionParticipantsMap.value.get(callSessionId)?.get(session.id)?.isHandRaised).toBe(true);

      setHandRaised(callSessionId, session.id, false);

      expect(callSessionParticipantsMap.value.get(callSessionId)?.get(session.id)?.isHandRaised).toBe(false);
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
        isHandRaised: false,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };
      const participantStore = useParticipantStore();
      const { createCallParticipant } = participantStore;
      const { callSessionParticipantsMap } = storeToRefs(participantStore);
      createCallParticipant(callSessionId, participant);

      const sessionMap = callSessionParticipantsMap.value.get(callSessionId);

      expect(sessionMap?.size).toBe(1);
      expect(sessionMap?.get(participant.id)).toStrictEqual(participant);
    });

    test("createCallParticipant is idempotent", () => {
      expect.hasAssertions();

      const { session, user } = getMockSession();
      const participant: CallParticipant = {
        id: session.id,
        image: user.image,
        isCameraEnabled: false,
        isHandRaised: false,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };
      const participantStore = useParticipantStore();
      const { createCallParticipant } = participantStore;
      const { callSessionParticipantsMap } = storeToRefs(participantStore);
      createCallParticipant(callSessionId, participant);
      createCallParticipant(callSessionId, participant);

      expect(callSessionParticipantsMap.value.get(callSessionId)?.size).toBe(1);
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
        isHandRaised: false,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };
      const participantStore = useParticipantStore();
      const { createCallParticipant, setMute } = participantStore;
      const { callSessionParticipantsMap } = storeToRefs(participantStore);
      createCallParticipant(callSessionId, participant);
      setMute(callSessionId, participant.id, true);

      expect(callSessionParticipantsMap.value.get(callSessionId)?.get(participant.id)?.isMuted).toBe(true);
    });
  });
});

describe(useMediaStore, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("setRemoteScreenShareStream", () => {
    test("stores remote screen share stream", () => {
      expect.hasAssertions();

      const stream = new MediaStream();
      const participantId = getMockSession().session.id;
      const mediaStore = useMediaStore();
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
      const mediaStore = useMediaStore();
      const { setRemoteScreenShareStream } = mediaStore;
      const { hasScreenShare, pinnedParticipantId, remoteScreenShareStreams, screenSharingParticipantIds } =
        storeToRefs(mediaStore);
      setRemoteScreenShareStream(participantId, stream);
      pinnedParticipantId.value = participantId;
      setRemoteScreenShareStream(participantId, undefined);

      expect(hasScreenShare.value).toBe(false);
      expect(remoteScreenShareStreams.value.has(participantId)).toBe(false);
      expect(screenSharingParticipantIds.value).toStrictEqual([]);
      expect(pinnedParticipantId.value).toBe("");
    });
  });

  describe("setParticipantVolumePercentage", () => {
    test("stores participant volume percentage", () => {
      expect.hasAssertions();

      const participantId = getMockSession().session.id;
      const mediaStore = useMediaStore();
      const { setParticipantVolumePercentage } = mediaStore;
      const { participantVolumePercentageMap } = storeToRefs(mediaStore);
      setParticipantVolumePercentage(participantId, 1);

      expect(participantVolumePercentageMap.value.get(participantId)).toBe(1);
    });
  });

  describe("deleteParticipantVolumePercentage", () => {
    test("removes participant volume percentage", () => {
      expect.hasAssertions();

      const participantId = getMockSession().session.id;
      const mediaStore = useMediaStore();
      const { deleteParticipantVolumePercentage, setParticipantVolumePercentage } = mediaStore;
      const { participantVolumePercentageMap } = storeToRefs(mediaStore);
      setParticipantVolumePercentage(participantId, 1);
      deleteParticipantVolumePercentage(participantId);

      expect(participantVolumePercentageMap.value.has(participantId)).toBe(false);
    });
  });

  describe("resetCallMedia", () => {
    test("clears participant volume percentages", () => {
      expect.hasAssertions();

      const participantId = getMockSession().session.id;
      const mediaStore = useMediaStore();
      const { resetCallMedia, setParticipantVolumePercentage } = mediaStore;
      const { participantVolumePercentageMap } = storeToRefs(mediaStore);
      setParticipantVolumePercentage(participantId, 1);
      resetCallMedia();

      expect(participantVolumePercentageMap.value.size).toBe(0);
    });
  });
});

describe(useKnockerStore, () => {
  const server = setupMswTrpc();
  const callSessionId = crypto.randomUUID();
  const first = createCallParticipant("first");
  const second = createCallParticipant("second");

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Each knocker is its own target, so a host working down the lobby has several writes in flight at once. A
  // Rejected one that reinstated the lobby as it stood would put back the knocker already admitted beside it —
  // And drop whichever knockers the live subscription delivered meanwhile
  test("puts back only the knocker whose admission was rejected, where they stood", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.callSession.knocker.admitKnocker.mutation(({ input: { sessionId } }) => {
        if (sessionId === first.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const knockerStore = useKnockerStore();
    const { admitKnocker, createKnocker } = knockerStore;
    const { knockers } = storeToRefs(knockerStore);
    createKnocker(first);
    createKnocker(second);
    await Promise.all([admitKnocker(callSessionId, first.id), admitKnocker(callSessionId, second.id)]);

    expect(knockers.value).toStrictEqual([first]);
  });

  test("keeps a knocker that arrived while a dismissal was in flight", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.callSession.knocker.dismissKnocker.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const knockerStore = useKnockerStore();
    const { createKnocker, dismissKnocker } = knockerStore;
    const { knockers } = storeToRefs(knockerStore);
    createKnocker(first);
    const dismissal = dismissKnocker(callSessionId, first.id);
    createKnocker(second);
    await dismissal;

    expect(knockers.value).toStrictEqual([first, second]);
  });
});
