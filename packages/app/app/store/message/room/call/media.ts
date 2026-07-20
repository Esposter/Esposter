import { authClient } from "@/services/auth/authClient";

export const useMediaStore = defineStore("message/room/call/media", () => {
  const session = authClient.useSession();
  const isCameraEnabled = ref(false);
  const isDeafened = ref(false);
  const isForceMuted = ref(false);
  const isPoppedOut = ref(false);
  const isScreenSharing = ref(false);
  // ParticipantId → volume multiplier percentage; absent = DEFAULT_PARTICIPANT_VOLUME_PERCENTAGE
  const participantVolumePercentageMap = ref(new Map<string, number>());
  const pinnedParticipantId = ref("");
  const selectedVirtualBackground = ref("");
  const screenSharingParticipantIds = ref<string[]>([]);
  const localScreenShareStream = ref<MediaStream | undefined>();
  const localVideoStream = ref<MediaStream | undefined>();
  const remoteScreenShareStreams = ref(new Map<string, MediaStream>());
  const remoteVideoStreams = ref(new Map<string, MediaStream>());
  const sessionId = computed(() => session.value.data?.session.id);
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
    if (activeScreenShareParticipantId.value === sessionId.value) return localScreenShareStream.value;
    return remoteScreenShareStreams.value.get(activeScreenShareParticipantId.value);
  });
  const setLocalScreenShareStream = (stream: MediaStream | undefined) => {
    localScreenShareStream.value = stream;
    const id = sessionId.value;
    if (!id) return;
    if (stream)
      screenSharingParticipantIds.value = [id, ...screenSharingParticipantIds.value.filter((value) => value !== id)];
    else {
      screenSharingParticipantIds.value = screenSharingParticipantIds.value.filter((value) => value !== id);
      if (pinnedParticipantId.value === id) pinnedParticipantId.value = "";
    }
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
    if (stream) {
      remoteScreenShareStreams.value.set(identity, stream);
      screenSharingParticipantIds.value = [
        ...screenSharingParticipantIds.value.filter((participantId) => participantId !== identity),
        identity,
      ];
      return;
    }

    remoteScreenShareStreams.value.delete(identity);
    screenSharingParticipantIds.value = screenSharingParticipantIds.value.filter(
      (participantId) => participantId !== identity,
    );
    if (pinnedParticipantId.value === identity) pinnedParticipantId.value = "";
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
