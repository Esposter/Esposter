import { authClient } from "@/services/auth/authClient";
import { AdminActionHookMap } from "@/services/message/moderation/AdminActionHookMap";
import { useRoomStore } from "@/store/message/room";
import { useCallMediaStore } from "@/store/message/room/call/media";
import { useCallParticipantStore } from "@/store/message/room/call/participant";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { AdminActionType } from "@esposter/db-schema";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";
import { Room } from "livekit-client";

export const useCallStore = defineStore("message/room/call", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const session = authClient.useSession();
  const mediaStore = useCallMediaStore();
  const { resetCallMedia } = mediaStore;
  const participantStore = useCallParticipantStore();
  const {
    clearJoinNotice,
    clearSpeakers,
    deleteCallParticipant,
    getParticipants,
    setMute,
    setParticipantCamera,
    setParticipants,
  } = participantStore;
  const liveKitStore = useLiveKitStore();
  const { connect, disconnect, setCamera, setMicrophone, setRemoteAudioMuted, setScreenShare, setVirtualBackground } =
    liveKitStore;
  const callRoomId = ref("");
  const activeCallSessionId = ref("");
  const currentRoomCallSessionId = ref("");
  const isCallViewOpen = ref(false);
  const isConnecting = ref(false);
  const sessionId = computed(() => session.value.data?.session.id);
  const callParticipants = computed(() => getParticipants(activeCallSessionId.value));
  const isInCall = computed(() => callParticipants.value.some(({ id }) => id === sessionId.value));
  const isMuted = computed(() => callParticipants.value.find(({ id }) => id === sessionId.value)?.isMuted ?? false);
  const setCameraEnabled = async (newIsCameraEnabled: boolean) => {
    const sessionIdValue = sessionId.value;
    if (!activeCallSessionId.value || !sessionIdValue) return;

    const oldIsCameraEnabled = mediaStore.isCameraEnabled;
    mediaStore.isCameraEnabled = newIsCameraEnabled;
    setParticipantCamera(activeCallSessionId.value, sessionIdValue, newIsCameraEnabled);

    await getResultAsync(() =>
      $trpc.roomCall.setCamera.mutate({
        callSessionId: activeCallSessionId.value,
        isCameraEnabled: newIsCameraEnabled,
      }),
    ).match(noop, (error) => {
      mediaStore.isCameraEnabled = oldIsCameraEnabled;
      setParticipantCamera(activeCallSessionId.value, sessionIdValue, oldIsCameraEnabled);
      throw error;
    });
  };
  const setMuteEnabled = async (newIsMuted: boolean) => {
    const sessionIdValue = sessionId.value;
    if (!activeCallSessionId.value || !sessionIdValue) return;

    const oldIsMuted = isMuted.value;
    setMute(activeCallSessionId.value, sessionIdValue, newIsMuted);

    await getResultAsync(() =>
      $trpc.roomCall.setMute.mutate({
        callSessionId: activeCallSessionId.value,
        isMuted: newIsMuted,
      }),
    ).match(noop, (error) => {
      setMute(activeCallSessionId.value, sessionIdValue, oldIsMuted);
      throw error;
    });
  };
  const setCurrentRoomCallSessionId = (callSessionId: string) => {
    currentRoomCallSessionId.value = callSessionId;
  };
  const createCall = async (): Promise<string | undefined> => {
    const { callSessionId } = await $trpc.roomCall.createCall.mutate();
    return callSessionId;
  };
  const joinCall = async (id: string): Promise<string | undefined> => {
    if (activeCallSessionId.value) return activeCallSessionId.value;
    isConnecting.value = true;
    let isJoined = false;
    let joinedCallSessionId: string | undefined;
    await getResultAsync(async () => {
      const { callSessionId, livekitToken, livekitUrl, participants } = await $trpc.roomCall.joinCall.mutate({ id });
      await connect(new Room({ adaptiveStream: true, dynacast: true }), livekitUrl, livekitToken, leaveCall);
      activeCallSessionId.value = callSessionId;
      joinedCallSessionId = callSessionId;
      isJoined = true;
      setParticipants(callSessionId, participants);
    }).match(noop, async (error) => {
      console.error(error);
      if (isJoined) await leaveCall();
      else {
        activeCallSessionId.value = "";
        await disconnect();
      }
    });
    isConnecting.value = false;
    return joinedCallSessionId;
  };
  const joinCallByRoomId = async () => {
    const roomId = roomStore.currentRoomId;
    if (!roomId || activeCallSessionId.value) return;
    isConnecting.value = true;
    callRoomId.value = roomId;
    let isJoined = false;
    await getResultAsync(async () => {
      const { callSessionId, livekitToken, livekitUrl, participants } = await $trpc.roomCall.joinCallByRoomId.mutate({
        roomId,
      });
      await connect(new Room({ adaptiveStream: true, dynacast: true }), livekitUrl, livekitToken, leaveCall);
      currentRoomCallSessionId.value = callSessionId;
      activeCallSessionId.value = callSessionId;
      isJoined = true;
      setParticipants(callSessionId, participants);
      isCallViewOpen.value = true;
    }).match(noop, async (error) => {
      console.error(error);
      if (isJoined) await leaveCall();
      else {
        callRoomId.value = "";
        activeCallSessionId.value = "";
        await disconnect();
      }
    });
    isConnecting.value = false;
  };
  const leaveCall = async () => {
    const callSessionId = activeCallSessionId.value;
    if (!callSessionId) return;
    await withFinalizerAsync(
      async () => {
        if (sessionId.value) deleteCallParticipant(callSessionId, sessionId.value);
        await $trpc.roomCall.leaveCall.mutate({ callSessionId });
      },
      async () => {
        callRoomId.value = "";
        activeCallSessionId.value = "";
        isCallViewOpen.value = false;
        resetCallMedia();
        await disconnect();
        clearJoinNotice();
        clearSpeakers();
      },
    );
  };
  const selectVirtualBackground = async (imagePath: string) => {
    if (imagePath && !mediaStore.isCameraEnabled) {
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
      await setMuteEnabled(newIsMuted);
    }).match(noop, console.error);
  };
  const toggleScreenShare = async () => {
    await getResultAsync(async () => {
      await setScreenShare(!mediaStore.isScreenSharing);
    }).match(noop, console.error);
  };

  AdminActionHookMap[AdminActionType.CreateBan].push(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });
  AdminActionHookMap[AdminActionType.ForceMute].push(async (roomId) => {
    if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, true);
    if (callRoomId.value !== roomId) return;
    await setMicrophone(false);
    mediaStore.isForceMuted = true;
  });
  AdminActionHookMap[AdminActionType.ForceUnmute].push(async (roomId) => {
    if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, false);
    if (callRoomId.value !== roomId) return;
    await setMicrophone(true);
    mediaStore.isForceMuted = false;
  });
  AdminActionHookMap[AdminActionType.KickFromRoom].push(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });
  AdminActionHookMap[AdminActionType.KickFromCall].push(async () => {
    await leaveCall();
  });
  AdminActionHookMap[AdminActionType.StopScreenShare].push(async (roomId) => {
    if (callRoomId.value !== roomId) return;
    await setScreenShare(false);
  });
  AdminActionHookMap[AdminActionType.TimeoutUser].push(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });

  return {
    activeCallSessionId,
    callRoomId,
    createCall,
    currentRoomCallSessionId,
    isCallViewOpen,
    isConnecting,
    isInCall,
    isMuted,
    joinCall,
    joinCallByRoomId,
    leaveCall,
    selectVirtualBackground,
    setCameraEnabled,
    setCurrentRoomCallSessionId,
    setMuteEnabled,
    toggleCamera,
    toggleDeafen,
    toggleMute,
    toggleScreenShare,
  };
});
