import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { authClient } from "@/services/auth/authClient";
import { AdminActionHookMap } from "@/services/message/moderation/AdminActionHookMap";
import { useRoomStore } from "@/store/message/room";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { AdminActionType } from "@esposter/db-schema";
import { getResultAsync, withFinalizerAsync } from "@esposter/shared";
import { Room } from "livekit-client";

export const useCallStore = defineStore("message/room/call", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const session = authClient.useSession();
  const liveKitStore = useLiveKitStore();
  const { connect, disconnect, setCamera, setMicrophone, setRemoteAudioMuted, setScreenShare } = liveKitStore;
  // The room the user is currently in a call for — kept for admin action roomId checks.
  const callRoomId = ref("");
  const isConnecting = ref(false);
  // The call session the user is actively participating in.
  const activeCallSessionId = ref("");
  // The call session for the room currently being viewed (set by useCallSubscribables on room enter).
  const currentRoomCallSessionId = ref("");
  const isDeafened = ref(false);
  const isForceMuted = ref(false);
  const isCameraEnabled = ref(false);
  const isScreenSharing = ref(false);
  const isCallViewOpen = ref(false);
  const pinnedParticipantId = ref("");
  const screenSharingParticipantIds = ref<string[]>([]);
  const callSessionParticipantsMap = ref(new Map<string, CallParticipant[]>());
  const joinNoticeParticipant = ref<CallParticipant>();
  const localScreenShareStream = ref<MediaStream | null>(null);
  const localVideoStream = ref<MediaStream | null>(null);
  const remoteScreenShareStreams = ref(new Map<string, MediaStream>());
  const remoteVideoStreams = ref(new Map<string, MediaStream>());
  const speakingIds = ref<string[]>([]);
  const sessionId = computed(() => session.value.data?.session.id);
  const roomParticipants = computed(() =>
    currentRoomCallSessionId.value ? (callSessionParticipantsMap.value.get(currentRoomCallSessionId.value) ?? []) : [],
  );
  const callParticipants = computed(() =>
    activeCallSessionId.value ? (callSessionParticipantsMap.value.get(activeCallSessionId.value) ?? []) : [],
  );
  const hasScreenShare = computed(
    () => Boolean(localScreenShareStream.value) || remoteScreenShareStreams.value.size > 0,
  );
  const activeScreenShareParticipantId = computed(
    () =>
      pinnedParticipantId.value ||
      (localScreenShareStream.value ? sessionId.value : undefined) ||
      screenSharingParticipantIds.value[0],
  );
  const activeScreenShareStream = computed(() => {
    if (!activeScreenShareParticipantId.value) return undefined;
    if (activeScreenShareParticipantId.value === sessionId.value) return localScreenShareStream.value ?? undefined;
    return remoteScreenShareStreams.value.get(activeScreenShareParticipantId.value);
  });
  const activeScreenShareParticipant = computed(() =>
    callParticipants.value.find(({ id }) => id === activeScreenShareParticipantId.value),
  );
  const isInCall = computed(() => callParticipants.value.some(({ id }) => id === sessionId.value));
  const isMuted = computed(() => callParticipants.value.find(({ id }) => id === sessionId.value)?.isMuted ?? false);

  const createCallParticipant = (callSessionId: string, participant: CallParticipant) => {
    const participants = callSessionParticipantsMap.value.get(callSessionId) ?? [];
    if (participants.some(({ id }) => id === participant.id)) return;
    callSessionParticipantsMap.value.set(callSessionId, [...participants, participant]);
    if (participant.id !== sessionId.value) joinNoticeParticipant.value = participant;
  };
  const deleteCallParticipant = (callSessionId: string, id: string) => {
    const participants = callSessionParticipantsMap.value.get(callSessionId);
    if (!participants) return;
    callSessionParticipantsMap.value.set(
      callSessionId,
      participants.filter((p) => p.id !== id),
    );
  };
  const setMute = (callSessionId: string, id: string, isMuted: boolean) => {
    const participants = callSessionParticipantsMap.value.get(callSessionId);
    if (!participants) return;
    const participant = participants.find((p) => p.id === id);
    if (!participant) return;
    participant.isMuted = isMuted;
  };
  const setParticipantCamera = (callSessionId: string, id: string, isCameraEnabled: boolean) => {
    const participants = callSessionParticipantsMap.value.get(callSessionId);
    if (!participants) return;
    const participant = participants.find((p) => p.id === id);
    if (!participant) return;
    participant.isCameraEnabled = isCameraEnabled;
  };
  const setCameraEnabled = async (newIsCameraEnabled: boolean) => {
    if (!activeCallSessionId.value || !sessionId.value) return;
    isCameraEnabled.value = newIsCameraEnabled;
    setParticipantCamera(activeCallSessionId.value, sessionId.value, newIsCameraEnabled);
    await $trpc.roomCall.setCamera.mutate({
      callSessionId: activeCallSessionId.value,
      isCameraEnabled: newIsCameraEnabled,
    });
  };
  const setParticipants = (callSessionId: string, participants: CallParticipant[]) => {
    callSessionParticipantsMap.value.set(callSessionId, participants);
  };
  const setCurrentRoomCallSessionId = (callSessionId: string) => {
    currentRoomCallSessionId.value = callSessionId;
  };
  const setLocalVideoStream = (stream: MediaStream | null) => {
    localVideoStream.value = stream;
  };
  const setLocalScreenShareStream = (stream: MediaStream | null) => {
    localScreenShareStream.value = stream;
    const id = sessionId.value;
    if (!id) return;
    if (stream)
      screenSharingParticipantIds.value = [id, ...screenSharingParticipantIds.value.filter((value) => value !== id)];
    else screenSharingParticipantIds.value = screenSharingParticipantIds.value.filter((value) => value !== id);
  };
  const setRemoteVideoStream = (identity: string, stream: MediaStream | null) => {
    const newRemoteVideoStreams = new Map(remoteVideoStreams.value);
    if (stream) newRemoteVideoStreams.set(identity, stream);
    else newRemoteVideoStreams.delete(identity);
    remoteVideoStreams.value = newRemoteVideoStreams;
  };
  const setRemoteScreenShareStream = (identity: string, stream: MediaStream | null) => {
    const newRemoteScreenShareStreams = new Map(remoteScreenShareStreams.value);
    if (stream) {
      newRemoteScreenShareStreams.set(identity, stream);
      screenSharingParticipantIds.value = [
        ...screenSharingParticipantIds.value.filter((participantId) => participantId !== identity),
        identity,
      ];
    } else {
      newRemoteScreenShareStreams.delete(identity);
      screenSharingParticipantIds.value = screenSharingParticipantIds.value.filter(
        (participantId) => participantId !== identity,
      );
      if (pinnedParticipantId.value === identity) pinnedParticipantId.value = "";
    }

    remoteScreenShareStreams.value = newRemoteScreenShareStreams;
  };
  const setScreenSharing = (newIsScreenSharing: boolean) => {
    isScreenSharing.value = newIsScreenSharing;
  };
  const setPinnedParticipantId = (participantId: string) => {
    pinnedParticipantId.value = participantId;
  };
  const clearJoinNotice = () => {
    joinNoticeParticipant.value = undefined;
  };
  const createSpeaker = (id: string) => {
    if (speakingIds.value.includes(id)) return;
    speakingIds.value = [...speakingIds.value, id];
  };
  const deleteSpeaker = (id: string) => {
    speakingIds.value = speakingIds.value.filter((speakingId) => speakingId !== id);
  };
  const clearSpeakers = () => {
    speakingIds.value = [];
  };

  const joinCall = async (id: string): Promise<string | undefined> => {
    if (activeCallSessionId.value) return activeCallSessionId.value;
    isConnecting.value = true;
    let isJoined = false;
    let joinedCallSessionId: string | undefined;
    await getResultAsync(async () => {
      const { callSessionId, livekitToken, livekitUrl, participants } = await $trpc.roomCall.joinCall.mutate({ id });
      await connect(new Room({ adaptiveStream: true, dynacast: true }), livekitUrl, livekitToken);
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

  const createCall = async (): Promise<string | undefined> => {
    const { callSessionId } = await $trpc.roomCall.createCall.mutate();
    return callSessionId;
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
      await connect(new Room({ adaptiveStream: true, dynacast: true }), livekitUrl, livekitToken);
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
        isDeafened.value = false;
        isForceMuted.value = false;
        isCameraEnabled.value = false;
        isScreenSharing.value = false;
        isCallViewOpen.value = false;
        pinnedParticipantId.value = "";
        screenSharingParticipantIds.value = [];
        joinNoticeParticipant.value = undefined;
        localScreenShareStream.value = null;
        localVideoStream.value = null;
        remoteScreenShareStreams.value = new Map();
        remoteVideoStreams.value = new Map();
        await disconnect();
        clearSpeakers();
      },
    );
  };

  const toggleDeafen = () => {
    isDeafened.value = !isDeafened.value;
    setRemoteAudioMuted(isDeafened.value);
  };

  const toggleCamera = async () => {
    const newIsCameraEnabled = !isCameraEnabled.value;
    await setCamera(newIsCameraEnabled);
  };

  const toggleScreenShare = async () => {
    const newIsScreenSharing = !isScreenSharing.value;
    await getResultAsync(async () => {
      await setScreenShare(newIsScreenSharing);
    })
      .orTee(console.error)
      .unwrapOr(undefined);
  };

  const toggleMute = async () => {
    if (!activeCallSessionId.value || !sessionId.value) return;
    const newIsMuted = !isMuted.value;
    setMute(activeCallSessionId.value, sessionId.value, newIsMuted);
    await setMicrophone(!newIsMuted);
    await $trpc.roomCall.setMute.mutate({ callSessionId: activeCallSessionId.value, isMuted: newIsMuted });
  };

  AdminActionHookMap[AdminActionType.CreateBan].push(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });
  AdminActionHookMap[AdminActionType.ForceMute].push(async (roomId) => {
    if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, true);
    if (callRoomId.value !== roomId) return;
    await setMicrophone(false);
    isForceMuted.value = true;
  });
  AdminActionHookMap[AdminActionType.ForceUnmute].push(async (roomId) => {
    if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, false);
    if (callRoomId.value !== roomId) return;
    await setMicrophone(true);
    isForceMuted.value = false;
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
    activeScreenShareParticipantId,
    activeScreenShareStream,
    callParticipants,
    callRoomId,
    callSessionParticipantsMap,
    clearJoinNotice,
    clearSpeakers,
    createCall,
    createCallParticipant,
    createSpeaker,
    currentRoomCallSessionId,
    deleteCallParticipant,
    deleteSpeaker,
    hasScreenShare,
    isCallViewOpen,
    isCameraEnabled,
    isConnecting,
    isDeafened,
    isForceMuted,
    isInCall,
    isMuted,
    isScreenSharing,
    joinCall,
    joinCallByRoomId,
    joinNoticeParticipant,
    leaveCall,
    localScreenShareStream,
    localVideoStream,
    pinnedParticipantId,
    remoteScreenShareStreams,
    remoteVideoStreams,
    roomParticipants,
    screenSharingParticipantIds,
    setCameraEnabled,
    setCurrentRoomCallSessionId,
    setLocalScreenShareStream,
    setLocalVideoStream,
    setMute,
    setParticipantCamera,
    setParticipants,
    setPinnedParticipantId,
    setRemoteScreenShareStream,
    setRemoteVideoStream,
    setScreenSharing,
    speakingIds,
    toggleCamera,
    toggleDeafen,
    toggleMute,
    toggleScreenShare,
  };
});
