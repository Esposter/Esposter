import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { authClient } from "@/services/auth/authClient";
import { LOCAL_PARTICIPANT_ID } from "@/services/message/call/constants";
import { AdminActionHookMap } from "@/services/message/moderation/AdminActionHookMap";
import { useRoomStore } from "@/store/message/room";
import { useWebRtcStore } from "@/store/message/room/webRtc";
import { AdminActionType } from "@esposter/db-schema";
import { getResultAsync, withFinalizerAsync } from "@esposter/shared";

export const useCallStore = defineStore("message/room/call", () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const session = authClient.useSession();
  const webRtcStore = useWebRtcStore();
  const {
    acquireLocalStream,
    cleanupAll,
    setLocalStreamMuted,
    setRemoteAudioMuted,
    setupSpeakingDetection,
    subscribeToSignals,
  } = webRtcStore;
  // The room the user is currently in a call for — kept for admin action roomId checks.
  const callRoomId = ref("");
  // The call session the user is actively participating in.
  const activeCallSessionId = ref("");
  // The call session for the room currently being viewed (set by useCallSubscribables on room enter).
  const currentRoomCallSessionId = ref("");
  const isDeafened = ref(false);
  const isForceMuted = ref(false);
  const callSessionParticipantsMap = ref(new Map<string, CallParticipant[]>());
  const speakingIds = ref<string[]>([]);
  const sessionId = computed(() => session.value.data?.session.id);
  const roomParticipants = computed(() =>
    currentRoomCallSessionId.value ? (callSessionParticipantsMap.value.get(currentRoomCallSessionId.value) ?? []) : [],
  );
  const callParticipants = computed(() =>
    activeCallSessionId.value ? (callSessionParticipantsMap.value.get(activeCallSessionId.value) ?? []) : [],
  );
  const isInCall = computed(() => callParticipants.value.some(({ id }) => id === sessionId.value));
  const isMuted = computed(() => callParticipants.value.find(({ id }) => id === sessionId.value)?.isMuted ?? false);

  const createCallParticipant = (callSessionId: string, participant: CallParticipant) => {
    const participants = callSessionParticipantsMap.value.get(callSessionId) ?? [];
    if (participants.some(({ id }) => id === participant.id)) return;
    callSessionParticipantsMap.value.set(callSessionId, [...participants, participant]);
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
  const setParticipants = (callSessionId: string, participants: CallParticipant[]) => {
    callSessionParticipantsMap.value.set(callSessionId, participants);
  };
  const setCurrentRoomCallSessionId = (callSessionId: string) => {
    currentRoomCallSessionId.value = callSessionId;
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

  const joinCall = async () => {
    const roomId = roomStore.currentRoomId;
    if (!roomId || activeCallSessionId.value || !currentRoomCallSessionId.value) return;
    callRoomId.value = roomId;
    const callSessionId = currentRoomCallSessionId.value;
    let isJoined = false;
    await getResultAsync(async () => {
      const stream = await acquireLocalStream();
      subscribeToSignals(callSessionId);
      const { participants } = await $trpc.roomCall.joinCall.mutate({ roomId });
      activeCallSessionId.value = callSessionId;
      isJoined = true;
      setParticipants(callSessionId, participants);
      if (sessionId.value) await setupSpeakingDetection(LOCAL_PARTICIPANT_ID, sessionId.value, stream);
    })
      .orElse((error) =>
        getResultAsync(async () => {
          console.error(error);
          if (isJoined) await leaveCall();
          else {
            callRoomId.value = "";
            activeCallSessionId.value = "";
            await cleanupAll();
          }
        }),
      )
      .unwrapOr(undefined);
  };

  const joinCallByToken = async (id: string): Promise<string | undefined> => {
    if (activeCallSessionId.value) return activeCallSessionId.value;
    let isJoined = false;
    let joinedCallSessionId: string | undefined;
    await getResultAsync(async () => {
      const stream = await acquireLocalStream();
      const { callSessionId, participants } = await $trpc.roomCall.joinCallByToken.mutate({ id });
      subscribeToSignals(callSessionId);
      activeCallSessionId.value = callSessionId;
      joinedCallSessionId = callSessionId;
      isJoined = true;
      setParticipants(callSessionId, participants);
      if (sessionId.value) await setupSpeakingDetection(LOCAL_PARTICIPANT_ID, sessionId.value, stream);
    })
      .orElse((error) =>
        getResultAsync(async () => {
          console.error(error);
          if (isJoined) await leaveCall();
          else {
            activeCallSessionId.value = "";
            await cleanupAll();
          }
        }),
      )
      .unwrapOr(undefined);
    return joinedCallSessionId;
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
        await cleanupAll();
        clearSpeakers();
      },
    );
  };

  const toggleDeafen = () => {
    isDeafened.value = !isDeafened.value;
    setRemoteAudioMuted(isDeafened.value);
  };

  const toggleMute = async () => {
    if (!activeCallSessionId.value || !sessionId.value) return;
    const newIsMuted = !isMuted.value;
    setMute(activeCallSessionId.value, sessionId.value, newIsMuted);
    setLocalStreamMuted(newIsMuted);
    await $trpc.roomCall.setMute.mutate({ callSessionId: activeCallSessionId.value, isMuted: newIsMuted });
  };

  AdminActionHookMap[AdminActionType.CreateBan].push(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });
  AdminActionHookMap[AdminActionType.ForceMute].push((roomId) => {
    if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, true);
    if (callRoomId.value !== roomId) return;
    setLocalStreamMuted(true);
    isForceMuted.value = true;
  });
  AdminActionHookMap[AdminActionType.ForceUnmute].push((roomId) => {
    if (sessionId.value) setMute(currentRoomCallSessionId.value, sessionId.value, false);
    if (callRoomId.value !== roomId) return;
    setLocalStreamMuted(false);
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
    callParticipants,
    callRoomId,
    callSessionParticipantsMap,
    clearSpeakers,
    createCallParticipant,
    createSpeaker,
    currentRoomCallSessionId,
    deleteCallParticipant,
    deleteSpeaker,
    isDeafened,
    isForceMuted,
    isInCall,
    isMuted,
    joinCall,
    joinCallByToken,
    leaveCall,
    roomParticipants,
    setCurrentRoomCallSessionId,
    setMute,
    setParticipants,
    speakingIds,
    toggleDeafen,
    toggleMute,
  };
});
