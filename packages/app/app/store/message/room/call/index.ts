import { AdminActionType } from "@esposter/db-schema";
import { getResultAsync, withFinalizerAsync } from "@esposter/shared";
import { Room } from "livekit-client";

import { authClient } from "@/services/auth/authClient";
import { AdminActionHookMap } from "@/services/message/moderation/AdminActionHookMap";
import { useRoomStore } from "@/store/message/room";
import { useCallMediaStore } from "@/store/message/room/call/media";
import { useCallParticipantStore } from "@/store/message/room/call/participant";
import { useLiveKitStore } from "@/store/message/room/liveKit";

export const useCallStore = defineStore("message/room/call", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const session = authClient.useSession();
  const mediaStore = useCallMediaStore();
  const { resetCallMedia, setLocalScreenShareStream, setRemoteScreenShareStream, setRemoteVideoStream } = mediaStore;
  const participantStore = useCallParticipantStore();
  const {
    clearJoinNotice,
    clearSpeakers,
    createCallParticipant,
    createSpeaker,
    deleteCallParticipant,
    deleteSpeaker,
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
  const roomParticipants = computed(() => participantStore.getParticipants(currentRoomCallSessionId.value));
  const callParticipants = computed(() => participantStore.getParticipants(activeCallSessionId.value));
  const activeScreenShareParticipant = computed(() =>
    callParticipants.value.find(({ id }) => id === mediaStore.activeScreenShareParticipantId),
  );
  const isInCall = computed(() => callParticipants.value.some(({ id }) => id === sessionId.value));
  const isMuted = computed(() => callParticipants.value.find(({ id }) => id === sessionId.value)?.isMuted ?? false);
  const setCameraEnabled = async (newIsCameraEnabled: boolean) => {
    if (!activeCallSessionId.value || !sessionId.value) return;
    mediaStore.isCameraEnabled = newIsCameraEnabled;
    setParticipantCamera(activeCallSessionId.value, sessionId.value, newIsCameraEnabled);
    await $trpc.roomCall.setCamera.mutate({
      callSessionId: activeCallSessionId.value,
      isCameraEnabled: newIsCameraEnabled,
    });
  };
  const setCurrentRoomCallSessionId = (callSessionId: string) => {
    currentRoomCallSessionId.value = callSessionId;
  };
  const setPinnedParticipantId = (participantId: string) => {
    mediaStore.pinnedParticipantId = participantId;
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
    })
      .orElse((error) =>
        getResultAsync(async () => {
          console.error(error);
          if (isJoined) await leaveCall();
          else {
            activeCallSessionId.value = "";
            await disconnect();
          }
        }),
      )
      .unwrapOr(undefined);
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
    })
      .orElse((error) =>
        getResultAsync(async () => {
          console.error(error);
          if (isJoined) await leaveCall();
          else {
            callRoomId.value = "";
            activeCallSessionId.value = "";
            await disconnect();
          }
        }),
      )
      .unwrapOr(undefined);
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
    if (!imagePath) {
      await setVirtualBackground("");
      mediaStore.selectedVirtualBackground = "";
      return;
    }

    if (!mediaStore.isCameraEnabled) {
      await setCamera(true);
      await setCameraEnabled(true);
    }

    const isApplied = await setVirtualBackground(imagePath);
    if (isApplied) mediaStore.selectedVirtualBackground = imagePath;
  };
  const toggleCamera = async () => {
    const newIsCameraEnabled = !mediaStore.isCameraEnabled;
    if (!newIsCameraEnabled) {
      await setVirtualBackground("");
      mediaStore.selectedVirtualBackground = "";
    }

    await setCamera(newIsCameraEnabled);
    await setCameraEnabled(newIsCameraEnabled);
  };
  const toggleDeafen = () => {
    mediaStore.isDeafened = !mediaStore.isDeafened;
    setRemoteAudioMuted(mediaStore.isDeafened);
  };
  const toggleMute = async () => {
    if (!activeCallSessionId.value || !sessionId.value) return;
    const newIsMuted = !isMuted.value;
    setMute(activeCallSessionId.value, sessionId.value, newIsMuted);
    await setMicrophone(!newIsMuted);
    await $trpc.roomCall.setMute.mutate({ callSessionId: activeCallSessionId.value, isMuted: newIsMuted });
  };
  const toggleScreenShare = async () => {
    await getResultAsync(async () => {
      await setScreenShare(!mediaStore.isScreenSharing);
    })
      .orTee(console.error)
      .unwrapOr(undefined);
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
  AdminActionHookMap[AdminActionType.TimeoutUser].push(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });

  return {
    activeCallSessionId,
    activeScreenShareParticipant,
    activeScreenShareParticipantId: computed(() => mediaStore.activeScreenShareParticipantId),
    activeScreenShareStream: computed(() => mediaStore.activeScreenShareStream),
    callParticipants,
    callRoomId,
    callSessionParticipantsMap: computed(() => participantStore.callSessionParticipantsMap),
    clearJoinNotice,
    clearSpeakers,
    createCall,
    createCallParticipant,
    createSpeaker,
    currentRoomCallSessionId,
    deleteCallParticipant,
    deleteSpeaker,
    hasScreenShare: computed(() => mediaStore.hasScreenShare),
    isCallViewOpen,
    isCameraEnabled: computed(() => mediaStore.isCameraEnabled),
    isConnecting,
    isDeafened: computed(() => mediaStore.isDeafened),
    isForceMuted: computed(() => mediaStore.isForceMuted),
    isInCall,
    isMuted,
    isScreenSharing: computed(() => mediaStore.isScreenSharing),
    joinCall,
    joinCallByRoomId,
    joinNoticeParticipant: computed(() => participantStore.joinNoticeParticipant),
    leaveCall,
    localScreenShareStream: computed(() => mediaStore.localScreenShareStream),
    localVideoStream: computed(() => mediaStore.localVideoStream),
    pinnedParticipantId: computed(() => mediaStore.pinnedParticipantId),
    remoteScreenShareStreams: computed(() => mediaStore.remoteScreenShareStreams),
    remoteVideoStreams: computed(() => mediaStore.remoteVideoStreams),
    roomParticipants,
    screenSharingParticipantIds: computed(() => mediaStore.screenSharingParticipantIds),
    selectedVirtualBackground: computed(() => mediaStore.selectedVirtualBackground),
    selectVirtualBackground,
    setCameraEnabled,
    setCurrentRoomCallSessionId,
    setLocalScreenShareStream,
    setMute,
    setParticipantCamera,
    setParticipants,
    setPinnedParticipantId,
    setRemoteScreenShareStream,
    setRemoteVideoStream,
    speakingIds: computed(() => participantStore.speakingIds),
    toggleCamera,
    toggleDeafen,
    toggleMute,
    toggleScreenShare,
  };
});
