// @vitest-environment nuxt
import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useCallStore } from "@/store/message/room/call";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { getMockSession } from "@@/server/trpc/context.test";
import { RoutePath, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<() => unknown>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

const createParticipant = (name: string): CallParticipant => ({
  id: crypto.randomUUID(),
  image: "",
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name,
  userId: crypto.randomUUID(),
});

beforeEach(() => {
  useSessionMock.mockReturnValue(ref({ data: getMockSession() }));
});

describe(useCallStore, () => {
  const server = setupMswTrpc();
  const callSessionId = crypto.randomUUID();
  const imagePath = "/image.png";
  const roomId = crypto.randomUUID();
  const threadRootRowKey = crypto.randomUUID();

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // The camera flag is a participant row like any other, so the primitive unwinds and reports its rejection.
  // Rethrowing lets a rejected server write cancel the local work it is composed with — the picked background
  // Never reaches the camera that is in fact running, and the same throw inside joinCall tears down a live call
  test("applies a virtual background when the camera write is rejected", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.callSession.setCameraEnabled.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const mediaStore = useMediaStore();
    const { isCameraEnabled, selectedVirtualBackground } = storeToRefs(mediaStore);
    const callStore = useCallStore();
    const { selectVirtualBackground } = callStore;
    const { activeCallSessionId } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;
    await selectVirtualBackground(imagePath);

    expect(selectedVirtualBackground.value).toBe(imagePath);
    expect(isCameraEnabled.value).toBe(false);
  });

  // A thread call carries the room it belongs to, so a route keyed on the room alone lands in the room with the
  // Thread pane shut — the call announced itself in a pane the link then refuses to open
  test.each([
    { expected: RoutePath.Messages(roomId), threadRootRowKey: "", title: "the room for a room call" },
    {
      expected: RoutePath.MessagesThread(roomId, threadRootRowKey),
      threadRootRowKey,
      title: "the thread for a thread call",
    },
  ])("routes to $title", ({ expected, threadRootRowKey: rootRowKey }) => {
    expect.hasAssertions();

    const callStore = useCallStore();
    const { callRoomId, callRoute, callThreadRootRowKey } = storeToRefs(callStore);
    callRoomId.value = roomId;
    callThreadRootRowKey.value = rootRowKey;

    expect(callRoute.value).toBe(expected);
  });

  // A join is the user's own click, and a rejection only this store sees — the callers are an inline click
  // Handler and a subscription onData, neither of which holds anything to catch a rethrow. So it unwinds the
  // State the attempt wrote and alerts, rather than leaving the failure to a caller that does not exist
  test("alerts and unwinds a rejected join", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.callSession.joinCallByRoomId.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const callStore = useCallStore();
    const { joinCallByRoomId } = callStore;
    const { activeCallSessionId, callRoomId, isConnecting } = storeToRefs(callStore);
    await joinCallByRoomId(roomId);

    expect(callRoomId.value).toBe("");
    expect(activeCallSessionId.value).toBe("");
    expect(isConnecting.value).toBe(false);
    expect(takeOne(alerts.value).type).toBe("error");
  });

  // The disconnect is tearing down an attempt that already failed, so its own rejection is not the failure the
  // User can act on. Propagated, it replaces the join's alert with nothing at all and leaves the connecting flag
  // Set, so the composer keeps spinning on a call that never started
  test.each([
    {
      handler: () =>
        trpcMsw.callSession.joinCall.mutation(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        }),
      join: async (callStore: ReturnType<typeof useCallStore>) => {
        await callStore.joinCall(callSessionId);
      },
      title: "an id",
    },
    {
      handler: () =>
        trpcMsw.callSession.joinCallByRoomId.mutation(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
        }),
      join: async (callStore: ReturnType<typeof useCallStore>) => {
        await callStore.joinCallByRoomId(roomId);
      },
      title: "a room id",
    },
  ])("alerts a join by $title that a rejected teardown unwinds", async ({ handler, join }) => {
    expect.hasAssertions();

    server.use(handler());
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const liveKitStore = useLiveKitStore();
    vi.spyOn(liveKitStore, "disconnect").mockRejectedValue(new Error("disconnect"));
    const callStore = useCallStore();
    const { isConnecting } = storeToRefs(callStore);
    await join(callStore);

    expect(isConnecting.value).toBe(false);
    expect(takeOne(alerts.value).text).toBe("error");
  });

  test("routes to the call's own page when the call belongs to no room", () => {
    expect.hasAssertions();

    const callStore = useCallStore();
    const { activeCallSessionId, callRoute } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;

    expect(callRoute.value).toBe(RoutePath.Calls(callSessionId));
  });
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

  describe("setParticipantHandRaised", () => {
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
      const { createCallParticipant, setParticipantHandRaised } = participantStore;
      const { callSessionParticipantsMap } = storeToRefs(participantStore);
      createCallParticipant(callSessionId, participant);
      setParticipantHandRaised(callSessionId, session.id, true);

      expect(callSessionParticipantsMap.value.get(callSessionId)?.get(session.id)?.isHandRaised).toBe(true);

      setParticipantHandRaised(callSessionId, session.id, false);

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

  describe("setParticipantMuted", () => {
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
      const { createCallParticipant, setParticipantMuted } = participantStore;
      const { callSessionParticipantsMap } = storeToRefs(participantStore);
      createCallParticipant(callSessionId, participant);
      setParticipantMuted(callSessionId, participant.id, true);

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
  const first = createParticipant("first");
  const second = createParticipant("second");

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Each knocker is its own target, so a host working down the lobby has several writes in flight at once
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
