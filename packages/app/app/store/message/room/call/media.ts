import { useParticipantStore } from "@/store/message/room/call/participant";

export const useMediaStore = defineStore("message/room/call/media", () => {
  const participantStore = useParticipantStore();
  const isCameraEnabled = ref(false);
  const isDeafened = ref(false);
  const isForceMuted = ref(false);
  const isPoppedOut = ref(false);
  const isScreenSharing = ref(false);
  // `participantId` → volume multiplier percentage; absent = DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE
  const participantVolumePercentageMap = ref(new Map<string, number>());
  const pinnedParticipantId = ref("");
  const selectedVirtualBackground = ref("");
  const screenSharingParticipantIds = ref<string[]>([]);
  const localScreenShareStream = ref<MediaStream | undefined>();
  const localVideoStream = ref<MediaStream | undefined>();
  const remoteScreenShareStreams = ref(new Map<string, MediaStream>());
  const remoteVideoStreams = ref(new Map<string, MediaStream>());
  const hasScreenShare = computed(
    () => Boolean(localScreenShareStream.value) || remoteScreenShareStreams.value.size > 0,
  );
  const activeScreenShareParticipantId = computed(
    () =>
      pinnedParticipantId.value ||
      (localScreenShareStream.value ? participantStore.sessionId : undefined) ||
      screenSharingParticipantIds.value[0],
  );
  const activeScreenShareStream = computed(() => {
    if (!activeScreenShareParticipantId.value) return undefined;
    if (activeScreenShareParticipantId.value === participantStore.sessionId) return localScreenShareStream.value;
    return remoteScreenShareStreams.value.get(activeScreenShareParticipantId.value);
  });
  // One presenter list, maintained the same way for the local share and every remote one — and the pin follows,
  // Since a pinned participant who has stopped sharing has nothing left to show
  const setParticipantScreenSharing = (participantId: string, isParticipantScreenSharing: boolean) => {
    screenSharingParticipantIds.value = [
      ...screenSharingParticipantIds.value.filter((id) => id !== participantId),
      ...(isParticipantScreenSharing ? [participantId] : []),
    ];
    if (!isParticipantScreenSharing && pinnedParticipantId.value === participantId) pinnedParticipantId.value = "";
  };
  const setLocalScreenShareStream = (stream: MediaStream | undefined) => {
    localScreenShareStream.value = stream;
    if (!participantStore.sessionId) return;

    setParticipantScreenSharing(participantStore.sessionId, Boolean(stream));
  };
  const setParticipantVolumePercentage = (participantId: string, volumePercentage: number) => {
    participantVolumePercentageMap.value.set(participantId, volumePercentage);
  };
  const deleteParticipantVolumePercentage = (participantId: string) => {
    participantVolumePercentageMap.value.delete(participantId);
  };
  const setRemoteVideoStream = (identity: string, stream: MediaStream | undefined) => {
    if (stream) remoteVideoStreams.value.set(identity, stream);
    else remoteVideoStreams.value.delete(identity);
  };
  const setRemoteScreenShareStream = (identity: string, stream: MediaStream | undefined) => {
    if (stream) remoteScreenShareStreams.value.set(identity, stream);
    else remoteScreenShareStreams.value.delete(identity);
    setParticipantScreenSharing(identity, Boolean(stream));
  };
  const resetCallMedia = () => {
    isCameraEnabled.value = false;
    isDeafened.value = false;
    isForceMuted.value = false;
    isPoppedOut.value = false;
    isScreenSharing.value = false;
    participantVolumePercentageMap.value.clear();
    pinnedParticipantId.value = "";
    selectedVirtualBackground.value = "";
    screenSharingParticipantIds.value = [];
    localScreenShareStream.value = undefined;
    localVideoStream.value = undefined;
    remoteScreenShareStreams.value.clear();
    remoteVideoStreams.value.clear();
  };

  return {
    activeScreenShareParticipantId,
    activeScreenShareStream,
    deleteParticipantVolumePercentage,
    hasScreenShare,
    isCameraEnabled,
    isDeafened,
    isForceMuted,
    isPoppedOut,
    isScreenSharing,
    localScreenShareStream,
    localVideoStream,
    participantVolumePercentageMap,
    pinnedParticipantId,
    remoteScreenShareStreams,
    remoteVideoStreams,
    resetCallMedia,
    screenSharingParticipantIds,
    selectedVirtualBackground,
    setLocalScreenShareStream,
    setParticipantVolumePercentage,
    setRemoteScreenShareStream,
    setRemoteVideoStream,
  };
});
