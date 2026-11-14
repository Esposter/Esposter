// @vitest-environment nuxt
import type { CallParticipant, MessageInMessage } from "@esposter/db-schema";
import { getMockSession } from "#server/trpc/context.test";
import { createId } from "#shared/util/math/random/createId";
import { useSession } from "@/services/auth/authClient.test";
import { AdminActionHookMap } from "@/services/message/moderation/AdminActionHookMap";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useAlertStore } from "@/store/alert";
import { useCallStore } from "@/store/message/room/call";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useRealtimeStore } from "@/store/message/room/realtime";
import { AdminActionType, CALL_ID_LENGTH } from "@esposter/db-schema";
import { RoutePath, takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

const createParticipant = (id: string): CallParticipant => ({
  id,
  image: "image",
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name: "name",
  userId: "userId",
});

describe(useCallStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const callSessionId = createId(CALL_ID_LENGTH);
  const imagePath = "imagePath";
  const roomId = crypto.randomUUID();
  const threadRootId = crypto.randomUUID();

  beforeEach(() => {
    useSession.mockReturnValue(ref({ data: getMockSession() }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The camera flag is a participant row like any other, so the primitive unwinds and reports its rejection.
  // Rethrowing lets a rejected server write cancel the local work it is composed with — the picked background
  // Never reaches the camera that is in fact running, and the same throw inside joinCall tears down a live call
  test("applies a virtual background when the camera write is rejected", async () => {
    expect.hasAssertions();

    trpcMsw.callSession.setCameraEnabled.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
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

  // A force mute names the room it was issued in, so one from a room whose call the user is not in leaves the call
  // They are in alone — marking them muted there would show a live microphone as muted
  test("ignores a force mute from a room whose call the user is not in", async () => {
    expect.hasAssertions();

    const { session, user } = getMockSession();
    const participantStore = useParticipantStore();
    const { setParticipantMap } = participantStore;
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    const callStore = useCallStore();
    const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;
    callRoomId.value = roomId;
    setParticipantMap(
      callSessionId,
      new Map([
        [
          session.id,
          {
            id: session.id,
            image: user.image,
            isCameraEnabled: false,
            isHandRaised: false,
            isMuted: false,
            name: user.name,
            userId: user.id,
          },
        ],
      ]),
    );
    await AdminActionHookMap[AdminActionType.ForceMute].run(crypto.randomUUID());

    expect(callSessionParticipantsMap.value.get(callSessionId)?.get(session.id)?.isMuted).toBe(false);
  });

  // A thread call carries the room it belongs to, so a route keyed on the room alone lands in the room with the
  // Thread pane shut — the call announced itself in a pane the link then refuses to open
  test.each<{ expected: string; threadRootId: "" | MessageInMessage["id"]; title: string }>([
    { expected: RoutePath.Messages(roomId), threadRootId: "", title: "the room for a room call" },
    { expected: RoutePath.MessagesThread(roomId, threadRootId), threadRootId, title: "the thread for a thread call" },
  ])("routes to $title", ({ expected, threadRootId: rootId }) => {
    expect.hasAssertions();

    const callStore = useCallStore();
    const { callRoomId, callRoute, callThreadRootId } = storeToRefs(callStore);
    callRoomId.value = roomId;
    callThreadRootId.value = rootId;

    expect(callRoute.value).toBe(expected);
  });

  // A join is the user's own click, and a rejection only this store sees — the callers are an inline click
  // Handler and a subscription onData, neither of which holds anything to catch a rethrow. So it unwinds the
  // State the attempt wrote and alerts, rather than leaving the failure to a caller that does not exist
  test("alerts and unwinds a rejected join", async () => {
    expect.hasAssertions();

    trpcMsw.callSession.joinCallByRoomId.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
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
      join: async (callStore: ReturnType<typeof useCallStore>) => {
        await callStore.joinCall(callSessionId);
      },
      registerJoin: () => {
        trpcMsw.callSession.joinCall.mutation(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
        });
      },
      title: "an id",
    },
    {
      join: async (callStore: ReturnType<typeof useCallStore>) => {
        await callStore.joinCallByRoomId(roomId);
      },
      registerJoin: () => {
        trpcMsw.callSession.joinCallByRoomId.mutation(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
        });
      },
      title: "a room id",
    },
  ])("alerts a join by $title that a rejected teardown unwinds", async ({ join, registerJoin }) => {
    expect.hasAssertions();

    registerJoin();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const realtimeStore = useRealtimeStore();
    vi.spyOn(realtimeStore, "disconnect").mockRejectedValue(new Error(" "));
    const callStore = useCallStore();
    const { isConnecting } = storeToRefs(callStore);
    await join(callStore);

    expect(isConnecting.value).toBe(false);
    expect(takeOne(alerts.value).text).toBe(" ");
  });

  // The room's subscription keeps applying participant events while the connect is open, to the map it holds. The
  // Join's snapshot used to replace that map once the connect resolved, so the leave and the join that landed in the
  // Meantime were lost and the leaver stayed listed
  test.each<{
    join: (callStore: ReturnType<typeof useCallStore>) => Promise<unknown>;
    registerJoin: (participantMap: Map<string, CallParticipant>) => void;
    title: string;
  }>([
    {
      join: (callStore) => callStore.joinCall(callSessionId),
      registerJoin: (participantMap) => {
        trpcMsw.callSession.joinCall.mutation(() => ({
          authToken: "",
          callSessionId,
          isDoorkeeper: false,
          participantMap,
        }));
      },
      title: "an id",
    },
    {
      join: (callStore) => callStore.joinCallByRoomId(roomId),
      registerJoin: (participantMap) => {
        trpcMsw.callSession.joinCallByRoomId.mutation(() => ({
          authToken: "",
          callSessionId,
          isDoorkeeper: false,
          participantMap,
        }));
      },
      title: "a room id",
    },
  ])("keeps the participant events a join's connect delivers, by $title", async ({ join, registerJoin }) => {
    expect.hasAssertions();

    const { session } = getMockSession();
    const leavingId = crypto.randomUUID();
    const joiningId = crypto.randomUUID();
    registerJoin(
      new Map([
        [leavingId, createParticipant(leavingId)],
        [session.id, createParticipant(session.id)],
      ]),
    );
    const participantStore = useParticipantStore();
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    participantStore.setParticipantMap(callSessionId, new Map([[leavingId, createParticipant(leavingId)]]));
    const realtimeStore = useRealtimeStore();
    const connectStarted = Promise.withResolvers<void>();
    const connectEnded = Promise.withResolvers<void>();
    vi.spyOn(realtimeStore, "connect").mockImplementation(async () => {
      connectStarted.resolve();
      await connectEnded.promise;
    });
    const callStore = useCallStore();
    const joining = join(callStore);
    await connectStarted.promise;
    participantStore.deleteCallParticipant(callSessionId, leavingId);
    participantStore.createCallParticipant(callSessionId, createParticipant(joiningId));
    connectEnded.resolve();
    await joining;

    expect([...(callSessionParticipantsMap.value.get(callSessionId)?.keys() ?? [])]).toStrictEqual([
      session.id,
      joiningId,
    ]);
  });

  test("routes to the call's own page when the call belongs to no room", () => {
    expect.hasAssertions();

    const callStore = useCallStore();
    const { activeCallSessionId, callRoute } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;

    expect(callRoute.value).toBe(RoutePath.Calls(callSessionId));
  });

  // The call stays up until the server answers the leave, so a second press lands while the first is still out
  test("sends one leave for a second press while the first is out", async () => {
    expect.hasAssertions();

    const leaveCall = vi.fn<() => void>();
    trpcMsw.callSession.leaveCall.mutation(() => {
      leaveCall();
    });
    const callStore = useCallStore();
    const { activeCallSessionId, isLeaving } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;
    const firstLeave = callStore.leaveCall();

    expect(isLeaving.value).toBe(true);

    await Promise.all([firstLeave, callStore.leaveCall()]);

    expect(leaveCall).toHaveBeenCalledTimes(1);
    expect(isLeaving.value).toBe(false);
  });

  test("clears the leaving flag when the disconnect is rejected", async () => {
    expect.hasAssertions();

    trpcMsw.callSession.leaveCall.mutation(() => undefined);
    const realtimeStore = useRealtimeStore();
    vi.spyOn(realtimeStore, "disconnect").mockRejectedValue(new Error(" "));
    const callStore = useCallStore();
    const { activeCallSessionId, isLeaving } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;
    await callStore.leaveCall();

    expect(isLeaving.value).toBe(false);
  });
});
