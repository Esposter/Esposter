import { authClient } from "@/services/auth/authClient";

export const useCallMediaStore = defineStore("message/room/call/media", () => {
  const session = authClient.useSession();
  const isCameraEnabled = ref(false);
  const isDeafened = ref(false);
  const isForceMuted = ref(false);
  const isScreenSharing = ref(false);
  const pinnedParticipantId = ref("");
  const selectedVirtualBackground = ref("");
  const screenSharingParticipantIds = ref<string[]>([]);
  const localScreenShareStream = ref<MediaStream | null>(null);
  const localVideoStream = ref<MediaStream | null>(null);
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
    if (activeScreenShareParticipantId.value === sessionId.value) return localScreenShareStream.value ?? undefined;
    return remoteScreenShareStreams.value.get(activeScreenShareParticipantId.value);
  });
  const setLocalScreenShareStream = (stream: MediaStream | null) => {
    localScreenShareStream.value = stream;
    const id = sessionId.value;
    if (!id) return;
    if (stream)
      screenSharingParticipantIds.value = [id, ...screenSharingParticipantIds.value.filter((value) => value !== id)];
    else screenSharingParticipantIds.value = screenSharingParticipantIds.value.filter((value) => value !== id);
  };
  const setRemoteVideoStream = (identity: string, stream: MediaStream | null) => {
    if (stream) remoteVideoStreams.value.set(identity, stream);
    else remoteVideoStreams.value.delete(identity);
  };
  const setRemoteScreenShareStream = (identity: string, stream: MediaStream | null) => {
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
    isScreenSharing.value = false;
    pinnedParticipantId.value = "";
    selectedVirtualBackground.value = "";
    screenSharingParticipantIds.value = [];
    localScreenShareStream.value = null;
    localVideoStream.value = null;
    remoteScreenShareStreams.value.clear();
    remoteVideoStreams.value.clear();
  };

  return {
    activeScreenShareParticipantId,
    activeScreenShareStream,
    hasScreenShare,
    isCameraEnabled,
    isDeafened,
    isForceMuted,
    isScreenSharing,
    localScreenShareStream,
    localVideoStream,
    pinnedParticipantId,
    remoteScreenShareStreams,
    remoteVideoStreams,
    resetCallMedia,
    screenSharingParticipantIds,
    selectedVirtualBackground,
    setLocalScreenShareStream,
    setRemoteScreenShareStream,
    setRemoteVideoStream,
  };
});
