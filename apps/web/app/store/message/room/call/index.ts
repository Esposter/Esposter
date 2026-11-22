import type { ClientMessage } from "#src/models/message/ClientMessage";
import type { CallParticipant } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { AdminActionHookMap } from "#src/services/message/moderation/AdminActionHookMap";
import { participantTable } from "#src/services/message/room/call/constants";
import { getLeaveCallEntry } from "#src/services/message/room/call/getLeaveCallEntry";
import { getParticipantFlagEntry } from "#src/services/message/room/call/getParticipantFlagEntry";
import { createRowResponse } from "#src/services/shared/overlay/createRowResponse";
import { createErrorAlert } from "#src/services/trpc/createErrorAlert";
import { useKnockerStore } from "#src/store/message/room/call/knocker";
import { useMediaStore } from "#src/store/message/room/call/media";
import { useParticipantStore } from "#src/store/message/room/call/participant";
import { useRealtimeStore } from "#src/store/message/room/realtime";
import { useOverlayStore } from "#src/store/overlay";
import { useConnectionStore } from "#src/store/realtime/connection";
import { AdminActionType } from "@esposter/db-schema";
import { getResultAsync, noop, RoutePath, withFinalizerAsync } from "@esposter/shared";

export const useCallStore = defineStore("message/room/call", () => {
  const { $trpc } = useNuxtApp();
  const overlayStore = useOverlayStore();
  const { writeOptimistic } = overlayStore;
  const knockerStore = useKnockerStore();
  const { resetKnockerState } = knockerStore;
  const mediaStore = useMediaStore();
  const { resetCallMedia } = mediaStore;
  const participantStore = useParticipantStore();
  const { clearJoinNotice, clearSpeakers, setParticipantId, storeCallParticipants } = participantStore;
  const realtimeStore = useRealtimeStore();
  const { connect, disconnect, setCamera, setMicrophone, setRemoteAudioMuted, setScreenShare, setVirtualBackground } =
    realtimeStore;
  const connectionStore = useConnectionStore();
  const { closeCall, openCall } = connectionStore;
  const callRoomId = ref("");
  // The thread the joined call belongs to, empty for the room's own call — what tells the thread pane whether
  // The call it can start is the one the user is already in
  const callThreadRootId = ref<0 | ClientMessage["id"]>(0);
  const activeCallSessionId = ref("");
  // Whether the joined call's knocks are this participant's to answer — the server rejects the knock stream for
  // Anyone else, so it is opened only when this is true
  const isDoorkeeper = ref(false);
  // Where the joined call is shown: inside its room for a room call, on the thread that addresses it for a
  // Thread call, on the call's own page otherwise — the status bar's link and the picture-in-picture window's
  // Way back both land there. A thread call's route is the thread's own, so the pane the call announced itself
  // In opens with it rather than leaving the user in the room hunting for the message it hangs off
  const callRoute = computed(() => {
    if (!callRoomId.value) return RoutePath.Calls(activeCallSessionId.value);
    else if (callThreadRootId.value) return RoutePath.MessagesThread(callRoomId.value, callThreadRootId.value);
    else return RoutePath.Messages(callRoomId.value);
  });
  const currentRoomCallSessionId = ref("");
  const isCallViewOpen = ref(false);
  const isConnecting = ref(false);
  const selfParticipant = computed(() =>
    participantStore.participantId
      ? participantStore.callSessionParticipantsMap.get(activeCallSessionId.value)?.get(participantStore.participantId)
      : undefined,
  );
  const isInCall = computed(() => Boolean(selfParticipant.value));
  // Hosted here (not a component) so hold-to-talk survives navigation, like the call itself
  usePushToTalk(isInCall);
  const isHandRaised = computed(() => selfParticipant.value?.isHandRaised ?? false);
  const isMuted = computed(() => selfParticipant.value?.isMuted ?? false);
  // A toggle is a write the screen shows at once: its entry sets the flag on the row, and the answer's row confirms the flag at
  // The version the call object left it. Writes to one row queue behind each other, so a lower of a hand waits behind a raise
  const writeParticipantFlag = (
    participantId: string,
    flags: Parameters<typeof getParticipantFlagEntry>[1],
    mutate: (callSessionId: string) => Promise<CallParticipant>,
  ) => {
    const callSessionId = activeCallSessionId.value;
    if (!callSessionId || !participantId) return;

    writeOptimistic(
      async () => {
        const participant = await mutate(callSessionId);
        return createRowResponse(participantTable, { ...participant, callSessionId });
      },
      { entry: getParticipantFlagEntry(participantId, flags), onError: createErrorAlert },
    );
  };
  const setHandRaised = (newIsHandRaised: boolean, targetParticipantId?: string) => {
    const handParticipantId = targetParticipantId ?? participantStore.participantId;
    writeParticipantFlag(handParticipantId, { isHandRaised: newIsHandRaised }, (callSessionId) =>
      $trpc.callSession.setHandRaised.mutate({
        callSessionId,
        isHandRaised: newIsHandRaised,
        participantId: handParticipantId,
      }),
    );
  };
  const setCameraEnabled = (newIsCameraEnabled: boolean) => {
    writeParticipantFlag(participantStore.participantId, { isCameraEnabled: newIsCameraEnabled }, (callSessionId) =>
      $trpc.callSession.setCameraEnabled.mutate({ callSessionId, isCameraEnabled: newIsCameraEnabled }),
    );
  };
  const setMuted = (newIsMuted: boolean) => {
    writeParticipantFlag(participantStore.participantId, { isMuted: newIsMuted }, (callSessionId) =>
      $trpc.callSession.setMuted.mutate({ callSessionId, isMuted: newIsMuted }),
    );
  };
  const setCurrentRoomCallSessionId = (callSessionId: string) => {
    currentRoomCallSessionId.value = callSessionId;
  };
  // Nothing that starts or ends a call rejects: each terminates its own chain and, where the user acted, alerts
  // Through createErrorAlert — which defers to the error link, so a coded rejection is still shown exactly once.
  // Rejecting instead would put the alert in the caller, and the callers are inline click handlers and a
  // Subscription onData, none of which holds anything to catch it
  // How far a failed join got decides how it unwinds: past the connect there is a call to leave properly, and
  // Before it only the state this attempt itself wrote. Shared by both entry points, because getting it the
  // Wrong way round either strands a connected call or issues a leave for a session that was never joined.
  // The room and thread refs are cleared unconditionally — no call is active on this path, so they hold at most
  // What the attempt put there
  const unwindJoin = async (isJoined: boolean, error: Error) => {
    if (isJoined) leaveCall();
    else {
      callRoomId.value = "";
      callThreadRootId.value = 0;
      activeCallSessionId.value = "";
      setParticipantId("");
      // The teardown reports rather than propagates: it is unwinding an attempt that already failed, and a
      // Rejected disconnect must not take the join's own error off screen or strand the connecting flag
      await getResultAsync(() => disconnect()).match(noop, console.error);
    }

    createErrorAlert(error);
  };
  // Set while a leave is out, so a join that starts meanwhile waits for the socket the leave is taking down
  const isLeaving = ref(false);
  const joinCall = async (id: string) => {
    if (activeCallSessionId.value) return activeCallSessionId.value;
    // A leave still taking its socket down would close the one this join opens
    if (isLeaving.value) return undefined;
    isConnecting.value = true;
    let isJoined = false;
    let joinedCallSessionId: string | undefined;
    await getResultAsync(async () => {
      const {
        authToken,
        callSessionId,
        isDoorkeeper: newIsDoorkeeper,
        participantId,
        participantMap,
      } = await $trpc.callSession.joinCall.mutate({ id });
      // Seeded before the connect rather than after it: the participant events delivered while the connect is open
      // Land in this map in place, and a snapshot written once the connect resolves would discard them
      setParticipantId(participantId);
      storeCallParticipants(callSessionId, [...participantMap.values()]);
      const { isCameraEnabled, isMicrophoneEnabled } = knockerStore.joinCallOptions;
      await connect(authToken, leaveCall, isMicrophoneEnabled);
      isDoorkeeper.value = newIsDoorkeeper;
      // The socket opens before the session is joined, because joining starts the participant read, which must not
      // Begin before the socket can deliver the changes that land after it
      await openCall(callSessionId);
      activeCallSessionId.value = callSessionId;
      joinedCallSessionId = callSessionId;
      isJoined = true;
      // The call is connected by here, so these only sync the participant row, which is drawn at once and unwinds itself
      // If it is refused — a rejected flag must not tear down a call that is already up
      if (!isMicrophoneEnabled) setMuted(true);
      if (isCameraEnabled) {
        await setCamera(true);
        setCameraEnabled(true);
      }
    }).match(noop, (error) => unwindJoin(isJoined, error));
    // Set after the await rather than through a finalizer: the chain above resolves to a Result rather than
    // Rejecting, so no path skips this line
    isConnecting.value = false;
    return joinedCallSessionId;
  };
  // A thread's call is the room's call addressed by the thread it belongs to, so joining one is the same act
  // With the root the pane is showing — the room's own call is the empty root. Both ids come from the caller
  // Rather than from the thread store: a call is not a thread's own state, and reaching for it here would put
  // The drawer's layout behind every join
  const joinCallByRoomId = async (roomId: string, threadRootId: 0 | ClientMessage["id"] = 0) => {
    if (!roomId || activeCallSessionId.value || isLeaving.value) return;
    isConnecting.value = true;
    callRoomId.value = roomId;
    callThreadRootId.value = threadRootId;
    let isJoined = false;
    await getResultAsync(async () => {
      const { authToken, callSessionId, participantId, participantMap } =
        await $trpc.callSession.joinCallByRoomId.mutate({ roomId, threadRootId });
      // Seeded before the connect, as in `joinCall`: the room's participant events that arrive while it is open
      // Would otherwise be overwritten by this snapshot once it resolves
      setParticipantId(participantId);
      storeCallParticipants(callSessionId, [...participantMap.values()]);
      await connect(authToken, leaveCall, true);
      await openCall(callSessionId);
      // Only the room's own call is the one the room header offers to join — a thread's call is reached from
      // Its pane, and writing it here would light up the header for a call that is not the room's
      if (!threadRootId) currentRoomCallSessionId.value = callSessionId;
      activeCallSessionId.value = callSessionId;
      isJoined = true;
      isCallViewOpen.value = true;
    }).match(noop, (error) => unwindJoin(isJoined, error));
    isConnecting.value = false;
  };
  // The local teardown a leave runs. A rejected disconnect is reported rather than thrown, so it cannot strand the call's
  // Notices and speakers
  const teardownCall = async () => {
    resetKnockerState();
    closeCall();
    resetCallMedia();
    await getResultAsync(() => disconnect()).match(noop, console.error);
    clearJoinNotice();
    clearSpeakers();
  };
  // The screen lets go of the call as the leave is sent: the call view closes and the joined call is forgotten, and the
  // Socket and the media come down before the server is told, so no teardown is left to land on a call joined after it.
  // Only the send waits for the writes still in flight on the participant's row. A refused leave changes nothing back: the
  // Local call is already down, and the session reaps the participant row on its own, so the refusal is logged rather than
  // Alerting a call that visibly ended
  const leaveCall = () => {
    const callSessionId = activeCallSessionId.value;
    // A second press finds the call already let go, so it sends nothing
    if (!callSessionId) return;

    const participantId = participantStore.participantId;
    isLeaving.value = true;
    setParticipantId("");
    callRoomId.value = "";
    callThreadRootId.value = 0;
    isDoorkeeper.value = false;
    activeCallSessionId.value = "";
    isCallViewOpen.value = false;
    const tearingDown = getResultAsync(teardownCall).match(noop, console.error);
    writeOptimistic(
      () =>
        withFinalizerAsync(
          async () => {
            await tearingDown;
            const participant = await $trpc.callSession.leaveCall.mutate({ callSessionId });
            return createRowResponse(participantTable, { ...participant, callSessionId });
          },
          () => {
            isLeaving.value = false;
          },
        ),
      { entry: getLeaveCallEntry(participantId, new Date()), onError: console.error },
    );
  };
  const selectVirtualBackground = async (imagePath: string) => {
    if (imagePath && !mediaStore.isCameraEnabled) {
      // Only the local device call decides whether to go on: a camera that never turned on has nothing to composite a
      // Background onto. The participant row's write is drawn as it is sent, so the background does not wait on it
      const isEnabled = await getResultAsync(() => setCamera(true))
        .map(() => true)
        .orTee(console.error)
        .unwrapOr(false);
      if (!isEnabled) return;
      setCameraEnabled(true);
    }

    setVirtualBackground(imagePath);
  };
  const toggleCamera = async () => {
    const newIsCameraEnabled = !mediaStore.isCameraEnabled;
    await getResultAsync(async () => {
      await setCamera(newIsCameraEnabled);
      setCameraEnabled(newIsCameraEnabled);
    }).match(noop, console.error);
  };
  const toggleDeafen = () => {
    mediaStore.isDeafened = !mediaStore.isDeafened;
    setRemoteAudioMuted(mediaStore.isDeafened);
  };
  const toggleMute = async () => {
    const newIsMuted = !isMuted.value;
    await getResultAsync(async () => {
      await setMicrophone(!newIsMuted);
      setMuted(newIsMuted);
    }).match(noop, console.error);
  };
  const toggleHandRaised = () => {
    setHandRaised(!isHandRaised.value);
  };
  const toggleScreenShare = async () => {
    const newIsScreenSharing = !mediaStore.isScreenSharing;
    await getResultAsync(async () => {
      await setScreenShare(newIsScreenSharing);
      // Pop out only after the picker resolves. requestWindow and getDisplayMedia both consume the
      // Click's transient activation, so opening the PiP first would steal it and the share would
      // Fail (or vice versa). Choosing a screen in the picker grants a fresh activation, so popping
      // Out here keeps the call visible while presenting, Meet-style. Pip/Host reverts the intent if
      // The OS window never materialises (unsupported browser / activation lost).
      if (newIsScreenSharing) mediaStore.isPoppedOut = true;
    }).match(noop, console.error);
  };
  // The room is checked first, so an admin action taken in a room whose call the user is not in never reaches the
  // Call they are in: a force mute from there would otherwise mark them muted while their microphone stays live
  const registerCallAdminActionHook = (adminActionType: AdminActionType, handler: () => Promisable<void>) =>
    AdminActionHookMap[adminActionType].register(async (roomId) => {
      if (callRoomId.value !== roomId) return;
      await handler();
    });
  // Being removed from the room, for good or for a while, takes the user out of its call as well — and a kick from
  // The call is from that room's call, never from one the user is in elsewhere
  for (const adminActionType of [
    AdminActionType.CreateBan,
    AdminActionType.KickFromCall,
    AdminActionType.KickFromRoom,
    AdminActionType.SoftBan,
    AdminActionType.TimeoutUser,
  ])
    registerCallAdminActionHook(adminActionType, leaveCall);
  // The mute is written to the call the user is actually in, which is the thread's session during a Thread call —
  // `currentRoomCallSessionId` stays on the room call for the header and is empty or stale here. The write is the same one
  // The user's own toggle sends, so the other members see the forced mute on the row too
  registerCallAdminActionHook(AdminActionType.ForceMute, async () => {
    setMuted(true);
    await setMicrophone(false);
    mediaStore.isForceMuted = true;
  });
  registerCallAdminActionHook(AdminActionType.ForceUnmute, async () => {
    setMuted(false);
    await setMicrophone(true);
    mediaStore.isForceMuted = false;
  });
  registerCallAdminActionHook(AdminActionType.StopScreenShare, async () => {
    await setScreenShare(false);
  });

  return {
    activeCallSessionId,
    callRoomId,
    callRoute,
    callThreadRootId,
    currentRoomCallSessionId,
    isCallViewOpen,
    isConnecting,
    isDoorkeeper,
    isHandRaised,
    isInCall,
    isLeaving,
    isMuted,
    joinCall,
    joinCallByRoomId,
    leaveCall,
    selectVirtualBackground,
    setCurrentRoomCallSessionId,
    setHandRaised,
    toggleCamera,
    toggleDeafen,
    toggleHandRaised,
    toggleMute,
    toggleScreenShare,
  };
});
