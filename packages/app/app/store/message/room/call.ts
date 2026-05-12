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
  const callRoomId = ref("");
  const isDeafened = ref(false);
  const isForceMuted = ref(false);
  const callParticipantsRoomMap = ref(new Map<string, CallParticipant[]>());
  const speakingIds = ref<string[]>([]);
  const sessionId = computed(() => session.value.data?.session.id);
  const roomParticipants = computed(() =>
    roomStore.currentRoomId ? (callParticipantsRoomMap.value.get(roomStore.currentRoomId) ?? []) : [],
  );
  const callParticipants = computed(() =>
    callRoomId.value ? (callParticipantsRoomMap.value.get(callRoomId.value) ?? []) : [],
  );
  const isInCall = computed(() => callParticipants.value.some(({ id }) => id === sessionId.value));
  const isMuted = computed(() => callParticipants.value.find(({ id }) => id === sessionId.value)?.isMuted ?? false);

  const createCallParticipant = (roomId: string, participant: CallParticipant) => {
    const participants = callParticipantsRoomMap.value.get(roomId) ?? [];
    if (participants.some(({ id }) => id === participant.id)) return;
    callParticipantsRoomMap.value.set(roomId, [...participants, participant]);
  };
  const deleteCallParticipant = (roomId: string, id: string) => {
    const participants = callParticipantsRoomMap.value.get(roomId);
    if (!participants) return;
    callParticipantsRoomMap.value.set(
      roomId,
      participants.filter((p) => p.id !== id),
    );
  };
  const setMute = (roomId: string, id: string, isMuted: boolean) => {
    const participants = callParticipantsRoomMap.value.get(roomId);
    if (!participants) return;
    const participant = participants.find((p) => p.id === id);
    if (!participant) return;
    participant.isMuted = isMuted;
  };
  const setParticipants = (roomId: string, participants: CallParticipant[]) => {
    callParticipantsRoomMap.value.set(roomId, participants);
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
    if (!roomId || callRoomId.value) return;
    callRoomId.value = roomId;
    let isJoined = false;
    await getResultAsync(async () => {
      const stream = await acquireLocalStream();
      subscribeToSignals(roomId);
      const participants = await $trpc.call.joinCall.mutate({ roomId });
      isJoined = true;
      setParticipants(roomId, participants);
      if (sessionId.value) await setupSpeakingDetection(LOCAL_PARTICIPANT_ID, sessionId.value, stream);
    })
      .orElse((error) =>
        getResultAsync(async () => {
          console.error(error);
          if (isJoined) await leaveCall();
          else {
            callRoomId.value = "";
            await cleanupAll();
          }
        }),
      )
      .unwrapOr(undefined);
  };

  const leaveCall = async () => {
    const roomId = callRoomId.value;
    if (!roomId) return;
    await withFinalizerAsync(
      async () => {
        if (sessionId.value) deleteCallParticipant(roomId, sessionId.value);
        await $trpc.call.leaveCall.mutate({ roomId });
      },
      async () => {
        callRoomId.value = "";
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
    if (!callRoomId.value || !sessionId.value) return;
    const newIsMuted = !isMuted.value;
    setMute(callRoomId.value, sessionId.value, newIsMuted);
    setLocalStreamMuted(newIsMuted);
    await $trpc.call.setMute.mutate({ isMuted: newIsMuted, roomId: callRoomId.value });
  };

  AdminActionHookMap[AdminActionType.CreateBan].push(async (roomId) => {
    if (callRoomId.value === roomId) await leaveCall();
  });
  AdminActionHookMap[AdminActionType.ForceMute].push((roomId) => {
    if (sessionId.value) setMute(roomId, sessionId.value, true);
    if (callRoomId.value !== roomId) return;
    setLocalStreamMuted(true);
    isForceMuted.value = true;
  });
  AdminActionHookMap[AdminActionType.ForceUnmute].push((roomId) => {
    if (sessionId.value) setMute(roomId, sessionId.value, false);
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
    callParticipantsRoomMap,
    callRoomId,
    clearSpeakers,
    createCallParticipant,
    createSpeaker,
    deleteCallParticipant,
    deleteSpeaker,
    isDeafened,
    isForceMuted,
    isInCall,
    isMuted,
    joinCall,
    leaveCall,
    roomParticipants,
    setMute,
    setParticipants,
    speakingIds,
    toggleDeafen,
    toggleMute,
  };
});
