import { AdminActionHookMap } from "@/services/message/moderation/AdminActionHookMap";
import { getAudioCaptureDefaults } from "@/services/message/room/call/getAudioCaptureDefaults";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { useUserSettingsStore } from "@/store/message/user/settings";
import { useVoiceDeviceSettingsStore } from "@/store/message/user/settings/voiceDevice";
import { AdminActionType, NoiseSuppressionMode } from "@esposter/db-schema";
import { getResultAsync, noop, RoutePath, withFinalizerAsync } from "@esposter/shared";
import { Room } from "livekit-client";

export const useCallStore = defineStore("message/room/call", () => {
  const { $trpc } = useNuxtApp();
  // Camera, mute and hand each own a different field of the participant row, so they share the participant key
  // Without contending — separate instances let a hand going up while the mic is unmuting land in either order
  const { executeMutation: executeSetCameraMutation } = useMutation();
  const { executeMutation: executeSetHandRaisedMutation } = useMutation();
  const { executeMutation: executeSetMuteMutation } = useMutation();
  const knockerStore = useKnockerStore();
  const { resetKnockerState } = knockerStore;
  const mediaStore = useMediaStore();
  const { resetCallMedia } = mediaStore;
  const participantStore = useParticipantStore();
  const {
    clearJoinNotice,
    clearSpeakers,
    deleteCallParticipant,
    setParticipantCameraEnabled,
    setParticipantHandRaised,
    setParticipantMap,
    setParticipantMuted,
  } = participantStore;
  const liveKitStore = useLiveKitStore();
  const { connect, disconnect, setCamera, setMicrophone, setRemoteAudioMuted, setScreenShare, setVirtualBackground } =
    liveKitStore;
  const userSettingsStore = useUserSettingsStore();
  const voiceDeviceSettingsStore = useVoiceDeviceSettingsStore();
  const callRoomId = ref("");
  // The thread the joined call belongs to, empty for the room's own call — what tells the thread pane whether
  // The call it can start is the one the user is already in
  const callThreadRootRowKey = ref("");
  const activeCallSessionId = ref("");
  // Where the joined call is shown: inside its room for a room call, on the thread that addresses it for a
  // Thread call, on the call's own page otherwise — the status bar's link and the picture-in-picture window's
  // Way back both land there. A thread call's route is the thread's own, so the pane the call announced itself
  // In opens with it rather than leaving the user in the room hunting for the message it hangs off
  const callRoute = computed(() => {
    if (!callRoomId.value) return RoutePath.Calls(activeCallSessionId.value);
    else if (callThreadRootRowKey.value) return RoutePath.MessagesThread(callRoomId.value, callThreadRootRowKey.value);

    return RoutePath.Messages(callRoomId.value);
  });
  const currentRoomCallSessionId = ref("");
  const isCallViewOpen = ref(false);
  const isConnecting = ref(false);
  const selfParticipant = computed(() =>
    participantStore.sessionId
      ? participantStore.callSessionParticipantsMap.get(activeCallSessionId.value)?.get(participantStore.sessionId)
      : undefined,
  );
  const isInCall = computed(() => Boolean(selfParticipant.value));
  // Hosted here (not a component) so hold-to-talk survives navigation, like the call itself
  usePushToTalk(isInCall);
  const isHandRaised = computed(() => selfParticipant.value?.isHandRaised ?? false);
  const isMuted = computed(() => selfParticipant.value?.isMuted ?? false);
  const setHandRaised = async (newIsHandRaised: boolean, targetSessionId?: string) => {
    const callSessionId = activeCallSessionId.value;
    const sessionId = participantStore.sessionId;
    const participantSessionId = targetSessionId ?? sessionId;
    if (!callSessionId || !sessionId || !participantSessionId) return;

    await executeSetHandRaisedMutation(
      () =>
        $trpc.callSession.setHandRaised.mutate({
          callSessionId,
          isHandRaised: newIsHandRaised,
          participantId: participantSessionId,
        }),
      {
        applyOptimistic: () => {
          const oldIsHandRaised =
            participantStore.callSessionParticipantsMap.get(callSessionId)?.get(participantSessionId)?.isHandRaised ??
            false;
          setParticipantHandRaised(callSessionId, participantSessionId, newIsHandRaised);
          return () => {
            setParticipantHandRaised(callSessionId, participantSessionId, oldIsHandRaised);
          };
        },
        // Keyed per participant so a moderator lowering several hands never queues behind the other
        key: participantSessionId,
      },
    );
  };
  const setCameraEnabled = async (newIsCameraEnabled: boolean) => {
    const callSessionId = activeCallSessionId.value;
    const sessionId = participantStore.sessionId;
    if (!callSessionId || !sessionId) return;

    await executeSetCameraMutation(
      () =>
        $trpc.callSession.setCameraEnabled.mutate({
          callSessionId,
          isCameraEnabled: newIsCameraEnabled,
        }),
      {
        applyOptimistic: () => {
          const oldIsCameraEnabled = mediaStore.isCameraEnabled;
          mediaStore.isCameraEnabled = newIsCameraEnabled;
          setParticipantCameraEnabled(callSessionId, sessionId, newIsCameraEnabled);
          return () => {
            mediaStore.isCameraEnabled = oldIsCameraEnabled;
            setParticipantCameraEnabled(callSessionId, sessionId, oldIsCameraEnabled);
          };
        },
        key: sessionId,
      },
    );
  };
  const setMuted = async (newIsMuted: boolean) => {
    const callSessionId = activeCallSessionId.value;
    const sessionId = participantStore.sessionId;
    if (!callSessionId || !sessionId) return;

    await executeSetMuteMutation(
      () =>
        $trpc.callSession.setMuted.mutate({
          callSessionId,
          isMuted: newIsMuted,
        }),
      {
        applyOptimistic: () => {
          const oldIsMuted = isMuted.value;
          setParticipantMuted(callSessionId, sessionId, newIsMuted);
          return () => {
            setParticipantMuted(callSessionId, sessionId, oldIsMuted);
          };
        },
        key: sessionId,
      },
    );
  };
  const setCurrentRoomCallSessionId = (callSessionId: string) => {
    currentRoomCallSessionId.value = callSessionId;
  };
  const createLiveKitRoom = () =>
    new Room({
      adaptiveStream: true,
      audioCaptureDefaults: {
        ...getAudioCaptureDefaults(userSettingsStore.userSettings?.noiseSuppressionMode ?? NoiseSuppressionMode.Custom),
        deviceId: voiceDeviceSettingsStore.inputDeviceId || undefined,
      },
      dynacast: true,
      videoCaptureDefaults: { deviceId: voiceDeviceSettingsStore.cameraDeviceId || undefined },
    });
  // Nothing that starts or ends a call rejects: each terminates its own chain and, where the user acted, alerts
  // Through createErrorAlert — which defers to the error link, so a coded rejection is still shown exactly once.
  // Rejecting instead would put the alert in the caller, and the callers are inline click handlers and a
  // Subscription onData, none of which holds anything to catch it
  const createCall = () =>
    getResultAsync(() => $trpc.callSession.createCall.mutate()).match(
      ({ callSessionId }) => callSessionId,
      (error) => {
        createErrorAlert(error);
        return undefined;
      },
    );
  // How far a failed join got decides how it unwinds: past the connect there is a call to leave properly, and
  // Before it only the state this attempt itself wrote. Shared by both entry points, because getting it the
  // Wrong way round either strands a connected call or issues a leave for a session that was never joined.
  // The room and thread refs are cleared unconditionally — no call is active on this path, so they hold at most
  // What the attempt put there
  const unwindJoin = async (isJoined: boolean, error: Error) => {
    if (isJoined) await leaveCall();
    else {
      callRoomId.value = "";
      callThreadRootRowKey.value = "";
      activeCallSessionId.value = "";
      // The teardown reports rather than propagates: it is unwinding an attempt that already failed, and a
      // Rejected disconnect must not take the join's own error off screen or strand the connecting flag
      await getResultAsync(() => disconnect()).match(noop, console.error);
    }

    createErrorAlert(error);
  };
  const joinCall = async (id: string) => {
    if (activeCallSessionId.value) return activeCallSessionId.value;
    isConnecting.value = true;
    let isJoined = false;
    let joinedCallSessionId: string | undefined;
    await getResultAsync(async () => {
      const { callSessionId, liveKitToken, liveKitUrl, participantMap } = await $trpc.callSession.joinCall.mutate({
        id,
      });
      const { isCameraEnabled, isMicrophoneEnabled } = knockerStore.joinCallOptions;
      await connect(createLiveKitRoom(), liveKitUrl, liveKitToken, leaveCall, isMicrophoneEnabled);
      activeCallSessionId.value = callSessionId;
      joinedCallSessionId = callSessionId;
      isJoined = true;
      setParticipantMap(callSessionId, participantMap);
      // The call is connected by here, so these only sync the participant row and report their own
      // Failures — a rejected flag must not tear down a call that is already up
      if (!isMicrophoneEnabled) await setMuted(true);
      if (isCameraEnabled) {
        await setCamera(true);
        await setCameraEnabled(true);
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
  const joinCallByRoomId = async (roomId: string, threadRootRowKey = "") => {
    if (!roomId || activeCallSessionId.value) return;
    isConnecting.value = true;
    callRoomId.value = roomId;
    callThreadRootRowKey.value = threadRootRowKey;
    let isJoined = false;
    await getResultAsync(async () => {
      const { callSessionId, liveKitToken, liveKitUrl, participantMap } =
        await $trpc.callSession.joinCallByRoomId.mutate({
          roomId,
          threadRootRowKey,
        });
      await connect(createLiveKitRoom(), liveKitUrl, liveKitToken, leaveCall, true);
      // Only the room's own call is the one the room header offers to join — a thread's call is reached from
      // Its pane, and writing it here would light up the header for a call that is not the room's
      if (!threadRootRowKey) currentRoomCallSessionId.value = callSessionId;
      activeCallSessionId.value = callSessionId;
      isJoined = true;
      setParticipantMap(callSessionId, participantMap);
      isCallViewOpen.value = true;
    }).match(noop, (error) => unwindJoin(isJoined, error));
    isConnecting.value = false;
  };
  // The teardown is the finalizer because it has to run whether or not the server accepted the leave — by the
  // Time it answers, the local call is already down. A rejected leave is then bookkeeping the user cannot act
  // On, and the session reaps the participant row on its own, so it logs rather than alerting a call that
  // Visibly ended
  const leaveCall = async () => {
    const callSessionId = activeCallSessionId.value;
    if (!callSessionId) return;
    await getResultAsync(() =>
      withFinalizerAsync(
        async () => {
          if (participantStore.sessionId) deleteCallParticipant(callSessionId, participantStore.sessionId);
          await $trpc.callSession.leaveCall.mutate({ callSessionId });
        },
        async () => {
          callRoomId.value = "";
          callThreadRootRowKey.value = "";
          resetKnockerState();
          activeCallSessionId.value = "";
          isCallViewOpen.value = false;
          resetCallMedia();
          await disconnect();
          clearJoinNotice();
          clearSpeakers();
        },
      ),
    ).match(noop, console.error);
  };
  const selectVirtualBackground = async (imagePath: string) => {
    if (imagePath && !mediaStore.isCameraEnabled) {
      // Only the local device call decides whether to go on: a camera that never turned on has nothing to
      // Composite a background onto, while the participant-row write reports and unwinds itself
      const isEnabled = await getResultAsync(async () => {
        await setCamera(true);
        await setCameraEnabled(true);
      }).match(
        () => true,
        (error) => {
          console.error(error);
          return false;
        },
      );
      if (!isEnabled) return;
    }

    await setVirtualBackground(imagePath);
  };
  const toggleCamera = async () => {
    const newIsCameraEnabled = !mediaStore.isCameraEnabled;
    await getResultAsync(async () => {
      await setCamera(newIsCameraEnabled);
      await setCameraEnabled(newIsCameraEnabled);
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
      await setMuted(newIsMuted);
    }).match(noop, console.error);
  };
  const toggleHandRaised = () => setHandRaised(!isHandRaised.value);
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

  AdminActionHookMap[AdminActionType.CreateBan].register(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });
  // The participant map is keyed by the call the user is actually in, which is the thread's session during a
  // Thread call — `currentRoomCallSessionId` stays on the room call for the header and is empty or stale here
  AdminActionHookMap[AdminActionType.ForceMute].register(async (roomId) => {
    if (participantStore.sessionId) setParticipantMuted(activeCallSessionId.value, participantStore.sessionId, true);
    if (callRoomId.value !== roomId) return;
    await setMicrophone(false);
    mediaStore.isForceMuted = true;
  });
  AdminActionHookMap[AdminActionType.ForceUnmute].register(async (roomId) => {
    if (participantStore.sessionId) setParticipantMuted(activeCallSessionId.value, participantStore.sessionId, false);
    if (callRoomId.value !== roomId) return;
    await setMicrophone(true);
    mediaStore.isForceMuted = false;
  });
  AdminActionHookMap[AdminActionType.KickFromRoom].register(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });
  AdminActionHookMap[AdminActionType.KickFromCall].register(async () => {
    await leaveCall();
  });
  AdminActionHookMap[AdminActionType.StopScreenShare].register(async (roomId) => {
    if (callRoomId.value !== roomId) return;
    await setScreenShare(false);
  });
  AdminActionHookMap[AdminActionType.TimeoutUser].register(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });

  return {
    activeCallSessionId,
    callRoomId,
    callRoute,
    callThreadRootRowKey,
    createCall,
    currentRoomCallSessionId,
    isCallViewOpen,
    isConnecting,
    isHandRaised,
    isInCall,
    isMuted,
    joinCall,
    joinCallByRoomId,
    leaveCall,
    selectVirtualBackground,
    setCurrentRoomCallSessionId,
    toggleCamera,
    toggleDeafen,
    toggleHandRaised,
    toggleMute,
    toggleScreenShare,
  };
});
