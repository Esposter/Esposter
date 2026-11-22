// @vitest-environment nuxt
import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { CallParticipantRow } from "@esposter/db-schema";

import { getMockSession } from "#server/trpc/context.test";
import { createId } from "#shared/util/math/random/createId";
import { useCallParticipantActions } from "#src/composables/message/room/call/useCallParticipantActions";
import { useSession } from "#src/services/auth/authClient.test";
import { AdminActionHookMap } from "#src/services/message/moderation/AdminActionHookMap";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useAlertStore } from "#src/store/alert";
import { useCallStore } from "#src/store/message/room/call/index";
import { useKnockerStore } from "#src/store/message/room/call/knocker";
import { useMediaStore } from "#src/store/message/room/call/media";
import { useParticipantStore } from "#src/store/message/room/call/participant";
import { useRealtimeStore } from "#src/store/message/room/realtime";
import { useRoleStore } from "#src/store/message/room/role";
import { AdminActionType, CALL_ID_LENGTH } from "@esposter/db-schema";
import { RoutePath, takeOne, waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
import { v7 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/realtime/openRealtimeSocket"),
  () => import("#src/services/realtime/openRealtimeSocket.test"),
);

const createParticipant = (id: string): CallParticipantRow => ({
  deletedAt: null,
  id,
  image: "image",
  isCameraEnabled: false,
  isHandRaised: false,
  isMuted: false,
  name: "name",
  userId: "userId",
  version: 1,
});

// The row a leave answers with: the participant's tombstone, one version on
const createLeftParticipant = (id: string): CallParticipantRow => ({
  ...createParticipant(id),
  deletedAt: new Date(0),
  version: 2,
});

describe(useCallStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const callSessionId = createId(CALL_ID_LENGTH);
  const imagePath = "imagePath";
  const roomId = v7();
  const threadRootId = 1;

  beforeEach(() => {
    useSession.mockReturnValue(ref({ data: getMockSession() }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // The camera flag is a participant row like any other, so the primitive unwinds and reports its rejection.
  // The camera write is drawn at once and rolled back if the server refuses it, but the picked background is applied
  // Regardless: a refused camera write must not leave the picked background unapplied
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
    await flushPromises();

    expect(selectedVirtualBackground.value).toBe(imagePath);
    expect(isCameraEnabled.value).toBe(false);
  });

  // A force mute names the room it was issued in, so one from a room whose call the user is not in leaves the call
  // They are in alone — marking them muted there would show a live microphone as muted
  test("ignores a force mute from a room whose call the user is not in", async () => {
    expect.hasAssertions();

    const participantId = v7();
    const participantStore = useParticipantStore();
    const { setParticipantId, storeCallParticipants } = participantStore;
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    const callStore = useCallStore();
    const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;
    callRoomId.value = roomId;
    setParticipantId(participantId);
    storeCallParticipants(callSessionId, [createParticipant(participantId)]);
    await AdminActionHookMap[AdminActionType.ForceMute].run(v7());

    expect(callSessionParticipantsMap.value.get(callSessionId)?.get(participantId)?.isMuted).toBe(false);
  });

  // A toggle the server refuses is revoked: its entry drops, and the row shows what the server last held. The server's own
  // Arrival of the row at a newer version is what the screen shows then, and an older arrival of it does not
  test("a revoked toggle's arrival wins over the toggle, and an older arrival does not", async () => {
    expect.hasAssertions();

    const participantId = v7();
    trpcMsw.callSession.setMuted.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const participantStore = useParticipantStore();
    const { setParticipantId, storeCallParticipant, storeCallParticipants } = participantStore;
    setParticipantId(participantId);
    storeCallParticipants(callSessionId, [createParticipant(participantId)]);
    const callStore = useCallStore();
    const { activeCallSessionId, isMuted } = storeToRefs(callStore);
    const { toggleMute } = callStore;
    activeCallSessionId.value = callSessionId;
    await toggleMute();
    await flushPromises();

    expect(isMuted.value).toBe(false);

    storeCallParticipant(callSessionId, { ...createParticipant(participantId), isMuted: true, version: 2 });

    expect(isMuted.value).toBe(true);

    storeCallParticipant(callSessionId, createParticipant(participantId));

    expect(isMuted.value).toBe(true);
  });

  // A thread call carries the room it belongs to, so a route keyed on the room alone lands in the room with the
  // Thread pane shut — the call announced itself in a pane the link then refuses to open
  test.each<{ expected: string; threadRootId: 0 | ClientMessage["id"]; title: string }>([
    { expected: RoutePath.Messages(roomId), threadRootId: 0, title: "the room for a room call" },
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

  // A camera the device refuses is its own step, so the call the user just joined stays joined rather than being left
  test("keeps a joined call when the device refuses its camera", async () => {
    expect.hasAssertions();

    const selfId = v7();
    trpcMsw.callSession.joinCall.mutation(() => ({
      authToken: "",
      callSessionId,
      isDoorkeeper: false,
      meetingId: "",
      participantId: selfId,
      participantMap: new Map([[selfId, createParticipant(selfId)]]),
    }));
    const realtimeStore = useRealtimeStore();
    vi.spyOn(realtimeStore, "connect").mockResolvedValue();
    vi.spyOn(realtimeStore, "setCamera").mockRejectedValue(new Error(" "));
    const { joinCallOptions } = storeToRefs(useKnockerStore());
    joinCallOptions.value.isCameraEnabled = true;
    const callStore = useCallStore();
    const { activeCallSessionId } = storeToRefs(callStore);
    const { joinCall } = callStore;
    await joinCall(callSessionId);

    expect(activeCallSessionId.value).toBe(callSessionId);
  });

  // The disconnect is tearing down an attempt that already failed, so its own rejection is not the failure the
  // User can act on. Propagated, it replaces the join's alert with nothing at all and leaves the connecting flag
  // Set, so the composer keeps spinning on a call that never started
  test.each([
    {
      join: async ({ joinCall }: ReturnType<typeof useCallStore>) => {
        await joinCall(callSessionId);
      },
      registerJoin: () => {
        trpcMsw.callSession.joinCall.mutation(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
        });
      },
      title: "an id",
    },
    {
      join: async ({ joinCallByRoomId }: ReturnType<typeof useCallStore>) => {
        await joinCallByRoomId(roomId);
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
    registerJoin: (participantId: string, participantMap: Map<string, CallParticipantRow>) => void;
    title: string;
  }>([
    {
      join: ({ joinCall }) => joinCall(callSessionId),
      registerJoin: (participantId, participantMap) => {
        trpcMsw.callSession.joinCall.mutation(() => ({
          authToken: "",
          callSessionId,
          isDoorkeeper: false,
          meetingId: "",
          participantId,
          participantMap,
        }));
      },
      title: "an id",
    },
    {
      join: ({ joinCallByRoomId }) => joinCallByRoomId(roomId),
      registerJoin: (participantId, participantMap) => {
        trpcMsw.callSession.joinCallByRoomId.mutation(() => ({
          authToken: "",
          callSessionId,
          isDoorkeeper: false,
          meetingId: "",
          participantId,
          participantMap,
        }));
      },
      title: "a room id",
    },
  ])("keeps the participant events a join's connect delivers, by $title", async ({ join, registerJoin }) => {
    expect.hasAssertions();

    const selfId = v7();
    const leavingId = v7();
    const joiningId = v7();
    registerJoin(
      selfId,
      new Map([
        [leavingId, createParticipant(leavingId)],
        [selfId, createParticipant(selfId)],
      ]),
    );
    const participantStore = useParticipantStore();
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    const { storeCallParticipant, storeCallParticipants, storeJoinedCallParticipant } = participantStore;
    storeCallParticipants(callSessionId, [createParticipant(leavingId)]);
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
    storeCallParticipant(callSessionId, { ...createParticipant(leavingId), deletedAt: new Date(0), version: 2 });
    storeJoinedCallParticipant(callSessionId, createParticipant(joiningId));
    connectEnded.resolve();
    await joining;

    expect([...(callSessionParticipantsMap.value.get(callSessionId)?.keys() ?? [])]).toStrictEqual([selfId, joiningId]);
  });

  // The join names the caller's own participant, which is the one every self write and the self tile are keyed by
  test("names the caller's own participant by the id the join gave it", async () => {
    expect.hasAssertions();

    const selfId = v7();
    trpcMsw.callSession.joinCall.mutation(() => ({
      authToken: "",
      callSessionId,
      isDoorkeeper: false,
      meetingId: "",
      participantId: selfId,
      participantMap: new Map([[selfId, createParticipant(selfId)]]),
    }));
    const participantStore = useParticipantStore();
    const { participantId } = storeToRefs(participantStore);
    const realtimeStore = useRealtimeStore();
    vi.spyOn(realtimeStore, "connect").mockResolvedValue();
    const callStore = useCallStore();
    const { joinCall } = callStore;
    await joinCall(callSessionId);

    expect(participantId.value).toBe(selfId);
  });

  test("routes to the call's own page when the call belongs to no room", () => {
    expect.hasAssertions();

    const callStore = useCallStore();
    const { activeCallSessionId, callRoute } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;

    expect(callRoute.value).toBe(RoutePath.Calls(callSessionId));
  });

  // The screen lets go of the call as the leave is sent, so a second press finds no call left to leave and sends nothing
  test("sends one leave for a second press while the first is out", async () => {
    expect.hasAssertions();

    const leaveCall = vi.fn<() => void>();
    trpcMsw.callSession.leaveCall.mutation(() => {
      leaveCall();
      return createLeftParticipant(v7());
    });
    const callStore = useCallStore();
    const { activeCallSessionId, isLeaving } = storeToRefs(callStore);
    const { leaveCall: storeLeaveCall } = callStore;
    activeCallSessionId.value = callSessionId;
    storeLeaveCall();

    expect(isLeaving.value).toBe(true);

    storeLeaveCall();
    await flushPromises();

    expect(leaveCall).toHaveBeenCalledExactlyOnceWith();
    expect(isLeaving.value).toBe(false);
  });

  // A teardown step that throws still lets the server know the participant has left, so the leave is not skipped
  test("sends the leave when a teardown step throws", async () => {
    expect.hasAssertions();

    const leaveCall = vi.fn<() => void>();
    trpcMsw.callSession.leaveCall.mutation(() => {
      leaveCall();
      return createLeftParticipant(v7());
    });
    const mediaStore = useMediaStore();
    vi.spyOn(mediaStore, "resetCallMedia").mockImplementation(() => {
      throw new Error(" ");
    });
    const callStore = useCallStore();
    const { activeCallSessionId } = storeToRefs(callStore);
    const { leaveCall: storeLeaveCall } = callStore;
    activeCallSessionId.value = callSessionId;
    storeLeaveCall();
    await flushPromises();

    expect(leaveCall).toHaveBeenCalledExactlyOnceWith();
  });

  test("clears the leaving flag when the disconnect is rejected", async () => {
    expect.hasAssertions();

    trpcMsw.callSession.leaveCall.mutation(() => createLeftParticipant(v7()));
    const realtimeStore = useRealtimeStore();
    vi.spyOn(realtimeStore, "disconnect").mockRejectedValue(new Error(" "));
    const callStore = useCallStore();
    const { activeCallSessionId, isLeaving } = storeToRefs(callStore);
    const { leaveCall } = callStore;
    activeCallSessionId.value = callSessionId;
    leaveCall();
    await flushPromises();

    expect(isLeaving.value).toBe(false);
  });

  // A leave still taking its socket down is the one a join would close, so a room join waits for it
  test("does not join a room call while a leave is still taking its socket down", async () => {
    expect.hasAssertions();

    const joinSent = vi.fn<() => void>();
    trpcMsw.callSession.joinCallByRoomId.mutation(() => {
      joinSent();
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const callStore = useCallStore();
    const { isLeaving } = storeToRefs(callStore);
    const { joinCallByRoomId } = callStore;
    isLeaving.value = true;
    await joinCallByRoomId(roomId);

    expect(joinSent).not.toHaveBeenCalled();
  });

  // A lower is the same row's hand as a raise, so it waits behind the raise still in flight: sent at once, the server
  // Could apply the two in either order and keep whichever arrived last
  test("sends a lower of a participant's hand behind that participant's raise still in flight", async () => {
    expect.hasAssertions();

    const participantId = v7();
    const raiseGate = Promise.withResolvers<void>();
    const handRaisedSent: boolean[] = [];
    trpcMsw.callSession.setHandRaised.mutation(async ({ input }) => {
      handRaisedSent.push(input.isHandRaised);
      if (input.isHandRaised) await raiseGate.promise;
      return createParticipant(participantId);
    });
    const participantStore = useParticipantStore();
    const { setParticipantId, storeCallParticipants } = participantStore;
    setParticipantId(participantId);
    storeCallParticipants(callSessionId, [createParticipant(participantId)]);
    const roleStore = useRoleStore();
    vi.spyOn(roleStore, "checkHasMyPermission").mockReturnValue(true);
    const callStore = useCallStore();
    const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
    const { toggleHandRaised } = callStore;
    activeCallSessionId.value = callSessionId;
    callRoomId.value = roomId;
    toggleHandRaised();
    await flushPromises();
    const { getActions } = useCallParticipantActions();
    const lowerHand = takeOne(
      getActions(participantId, "userId", false, true).filter(({ title }) => title === "Lower Hand"),
    );
    await lowerHand.onClick?.();
    await flushPromises();
    const sentWhileRaiseInFlight = [...handRaisedSent];
    raiseGate.resolve();
    await waitForSynchronizedFunctions();

    expect(sentWhileRaiseInFlight).toStrictEqual([true]);
    expect(handRaisedSent).toStrictEqual([true, false]);
  });

  // The server decides a kick, and nothing is shown ahead of its answer, so a refused kick leaves the participant in the call
  test("a refused kick leaves the participant in the call", async () => {
    expect.hasAssertions();

    const participantId = v7();
    trpcMsw.message.moderation.executeAdminAction.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const participantStore = useParticipantStore();
    const { callSessionParticipantsMap } = storeToRefs(participantStore);
    const { storeCallParticipants } = participantStore;
    storeCallParticipants(callSessionId, [createParticipant(participantId)]);
    const roleStore = useRoleStore();
    vi.spyOn(roleStore, "checkHasMyPermission").mockReturnValue(true);
    const callStore = useCallStore();
    const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;
    callRoomId.value = roomId;
    const { getActions } = useCallParticipantActions();
    const kick = takeOne(
      getActions(participantId, "userId", false, false).filter(({ title }) => title === "Disconnect"),
    );
    await kick.onClick?.();
    await flushPromises();

    expect(callSessionParticipantsMap.value.get(callSessionId)?.has(participantId)).toBe(true);
  });

  // A moderation action names the room the call is held in, which the call reads, not the route the viewer is on
  test("a kick names the room the call is held in", async () => {
    expect.hasAssertions();

    const participantId = v7();
    const kickedRoomIds: string[] = [];
    trpcMsw.message.moderation.executeAdminAction.mutation(({ input }) => {
      kickedRoomIds.push(input.roomId);
    });
    const participantStore = useParticipantStore();
    const { storeCallParticipants } = participantStore;
    storeCallParticipants(callSessionId, [createParticipant(participantId)]);
    const roleStore = useRoleStore();
    vi.spyOn(roleStore, "checkHasMyPermission").mockReturnValue(true);
    const callStore = useCallStore();
    const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
    activeCallSessionId.value = callSessionId;
    callRoomId.value = roomId;
    const { getActions } = useCallParticipantActions();
    const kick = takeOne(
      getActions(participantId, "userId", false, false).filter(({ title }) => title === "Disconnect"),
    );
    await kick.onClick?.();
    await flushPromises();

    expect(kickedRoomIds).toStrictEqual([roomId]);
  });

  // A moderator who has not joined the call has no participant of their own, yet still lowers another's hand from it
  test("lowers another participant's hand when the caller has no participant id of their own", async () => {
    expect.hasAssertions();

    const participantId = v7();
    const handRaisedSent: { callSessionId: string; isHandRaised: boolean; participantId: string }[] = [];
    trpcMsw.callSession.setHandRaised.mutation(({ input }) => {
      handRaisedSent.push(input);
      return createParticipant(input.participantId);
    });
    const participantStore = useParticipantStore();
    const { storeCallParticipants } = participantStore;
    storeCallParticipants(callSessionId, [{ ...createParticipant(participantId), isHandRaised: true }]);
    const roleStore = useRoleStore();
    vi.spyOn(roleStore, "checkHasMyPermission").mockReturnValue(true);
    const callStore = useCallStore();
    const { activeCallSessionId, callRoomId } = storeToRefs(callStore);
    const { setHandRaised } = callStore;
    activeCallSessionId.value = callSessionId;
    callRoomId.value = roomId;
    setHandRaised(false, participantId);
    await flushPromises();
    await waitForSynchronizedFunctions();

    expect(handRaisedSent).toStrictEqual([{ callSessionId, isHandRaised: false, participantId }]);
  });
});
