import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { authClient } from "@/services/auth/authClient";
import { AdminActionHookMap } from "@/services/message/moderation/AdminActionHookMap";
import { useRoomStore } from "@/store/message/room";
import { useKnockerStore } from "@/store/message/room/call/knocker";
import { useMediaStore } from "@/store/message/room/call/media";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useLiveKitStore } from "@/store/message/room/liveKit";
import { AdminActionType } from "@esposter/db-schema";
import { getResultAsync, noop, withFinalizerAsync } from "@esposter/shared";
import { Room } from "livekit-client";

export const useCallStore = defineStore("message/room/call", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const session = authClient.useSession();
  const knockerStore = useKnockerStore();
  const mediaStore = useMediaStore();
  const { resetCallMedia } = mediaStore;
  const participantStore = useParticipantStore();
  const {
    clearJoinNotice,
    clearSpeakers,
    deleteCallParticipant,
    setHandRaised,
    setMute,
    setParticipantCamera,
    setParticipantMap,
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
  const callParticipantMap = computed(
    () =>
      participantStore.callSessionParticipantsMap.get(activeCallSessionId.value) ?? new Map<string, CallParticipant>(),
  );
  const selfParticipant = computed(() => (sessionId.value ? callParticipantMap.value.get(sessionId.value) : undefined));
  const isInCall = computed(() => Boolean(selfParticipant.value));
  const isHandRaised = computed(() => selfParticipant.value?.isHandRaised ?? false);
  const isMuted = computed(() => selfParticipant.value?.isMuted ?? false);
  const setHandRaisedEnabled = async (newIsHandRaised: boolean, targetSessionId?: string) => {
    const callSessionId = activeCallSessionId.value;
    const sessionIdValue = sessionId.value;
    const participantSessionId = targetSessionId ?? sessionIdValue;
    if (!callSessionId || !sessionIdValue || !participantSessionId) return;

    const oldIsHandRaised =
      participantStore.callSessionParticipantsMap.get(callSessionId)?.get(participantSessionId)?.isHandRaised ?? false;
    setHandRaised(callSessionId, participantSessionId, newIsHandRaised);

    await getResultAsync(() =>
      $trpc.callSession.setHandRaised.mutate({
        callSessionId,
        isHandRaised: newIsHandRaised,
        participantId: participantSessionId,
      }),
    ).match(noop, (error) => {
      setHandRaised(callSessionId, participantSessionId, oldIsHandRaised);
      throw error;
    });
  };
  const setCameraEnabled = async (newIsCameraEnabled: boolean) => {
    const callSessionId = activeCallSessionId.value;
    const sessionIdValue = sessionId.value;
    if (!callSessionId || !sessionIdValue) return;

    const oldIsCameraEnabled = mediaStore.isCameraEnabled;
    mediaStore.isCameraEnabled = newIsCameraEnabled;
    setParticipantCamera(callSessionId, sessionIdValue, newIsCameraEnabled);

    await getResultAsync(() =>
      $trpc.callSession.setCamera.mutate({
        callSessionId,
        isCameraEnabled: newIsCameraEnabled,
      }),
    ).match(noop, (error) => {
      mediaStore.isCameraEnabled = oldIsCameraEnabled;
      setParticipantCamera(callSessionId, sessionIdValue, oldIsCameraEnabled);
      throw error;
    });
  };
  const setMuteEnabled = async (newIsMuted: boolean) => {
    const callSessionId = activeCallSessionId.value;
    const sessionIdValue = sessionId.value;
    if (!callSessionId || !sessionIdValue) return;

    const oldIsMuted = isMuted.value;
    setMute(callSessionId, sessionIdValue, newIsMuted);

    await getResultAsync(() =>
      $trpc.callSession.setMute.mutate({
        callSessionId,
        isMuted: newIsMuted,
      }),
    ).match(noop, (error) => {
      setMute(callSessionId, sessionIdValue, oldIsMuted);
      throw error;
    });
  };
  const setCurrentRoomCallSessionId = (callSessionId: string) => {
    currentRoomCallSessionId.value = callSessionId;
  };
  const createCall = async (): Promise<string | undefined> => {
    const { callSessionId } = await $trpc.callSession.createCall.mutate();
    return callSessionId;
  };
  const joinCall = async (id: string): Promise<string | undefined> => {
    if (activeCallSessionId.value) return activeCallSessionId.value;
    isConnecting.value = true;
    let isJoined = false;
    let joinedCallSessionId: string | undefined;
    await withFinalizerAsync(
      async () => {
        await getResultAsync(async () => {
          const { callSessionId, livekitToken, livekitUrl, participantMap } = await $trpc.callSession.joinCall.mutate({
            id,
          });
          const { isCameraEnabled, isMicrophoneEnabled } = knockerStore.joinCallOptions;
          await connect(
            new Room({ adaptiveStream: true, dynacast: true }),
            livekitUrl,
            livekitToken,
            leaveCall,
            isMicrophoneEnabled,
          );
          activeCallSessionId.value = callSessionId;
          joinedCallSessionId = callSessionId;
          isJoined = true;
          setParticipantMap(callSessionId, participantMap);
          if (!isMicrophoneEnabled) await setMuteEnabled(true);
          if (isCameraEnabled) {
            await setCamera(true);
            await setCameraEnabled(true);
          }
        }).match(noop, async (error) => {
          console.error(error);
          if (isJoined) await leaveCall();
          else {
            activeCallSessionId.value = "";
            await disconnect();
          }
          throw error;
        });
      },
      () => {
        isConnecting.value = false;
      },
    );
    return joinedCallSessionId;
  };
  const joinCallByRoomId = async () => {
    const roomId = roomStore.currentRoomId;
    if (!roomId || activeCallSessionId.value) return;
    isConnecting.value = true;
    callRoomId.value = roomId;
    let isJoined = false;
    await getResultAsync(async () => {
      const { callSessionId, livekitToken, livekitUrl, participantMap } =
        await $trpc.callSession.joinCallByRoomId.mutate({
          roomId,
        });
      await connect(new Room({ adaptiveStream: true, dynacast: true }), livekitUrl, livekitToken, leaveCall, true);
      currentRoomCallSessionId.value = callSessionId;
      activeCallSessionId.value = callSessionId;
      isJoined = true;
      setParticipantMap(callSessionId, participantMap);
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
        await $trpc.callSession.leaveCall.mutate({ callSessionId });
      },
      async () => {
        callRoomId.value = "";
        activeCallSessionId.value = "";
        isCallViewOpen.value = false;
        knockerStore.resetKnockerState();
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
  const toggleHandRaised = async () => {
    await getResultAsync(async () => {
      await setHandRaisedEnabled(!isHandRaised.value);
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
