import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

import { useAdminActionNotification } from "@/composables/message/useAdminActionNotification";
import { authClient } from "@/services/auth/authClient";
import { LOCAL_PARTICIPANT_ID } from "@/services/message/voice/constants";
import { useRoomStore } from "@/store/message/room";
import { useWebRtcStore } from "@/store/message/room/webRtc";
import { AdminActionType } from "@esposter/db-schema";
import { exhaustiveGuard } from "@esposter/shared";

export const useVoiceStore = defineStore("message/room/voice", () => {
  const { $trpc } = useNuxtApp();
  const session = authClient.useSession();
  const roomStore = useRoomStore();
  const webRtcStore = useWebRtcStore();
  const {
    acquireLocalStream,
    cleanupAll,
    setLocalStreamMuted,
    setRemoteAudioMuted,
    setupSpeakingDetection,
    subscribeToSignals,
  } = webRtcStore;
  const { notify } = useAdminActionNotification();
  const callRoomId = ref<string>();
  const isDeafened = ref(false);
  const isForceMuted = ref(false);
  const voiceParticipantsRoomMap = ref(new Map<string, VoiceParticipant[]>());
  let adminActionUnsubscribable: undefined | { unsubscribe: () => void };
  const speakingIds = ref<string[]>([]);
  const sessionId = computed(() => session.value.data?.session.id);
  const roomParticipants = computed(() =>
    roomStore.currentRoomId ? (voiceParticipantsRoomMap.value.get(roomStore.currentRoomId) ?? []) : [],
  );
  const callParticipants = computed(() =>
    callRoomId.value ? (voiceParticipantsRoomMap.value.get(callRoomId.value) ?? []) : [],
  );
  const isInChannel = computed(() => callParticipants.value.some(({ id }) => id === sessionId.value));
  const isMuted = computed(() => callParticipants.value.find(({ id }) => id === sessionId.value)?.isMuted ?? false);

  const createVoiceParticipant = (roomId: string, participant: VoiceParticipant) => {
    const participants = voiceParticipantsRoomMap.value.get(roomId) ?? [];
    if (participants.some(({ id }) => id === participant.id)) return;
    voiceParticipantsRoomMap.value.set(roomId, [...participants, participant]);
  };
  const deleteVoiceParticipant = (roomId: string, id: string) => {
    const participants = voiceParticipantsRoomMap.value.get(roomId);
    if (!participants) return;
    voiceParticipantsRoomMap.value.set(
      roomId,
      participants.filter((p) => p.id !== id),
    );
  };
  const setMute = (roomId: string, id: string, isMuted: boolean) => {
    const participants = voiceParticipantsRoomMap.value.get(roomId);
    if (!participants) return;
    const participant = participants.find((p) => p.id === id);
    if (!participant) return;
    participant.isMuted = isMuted;
  };
  const setParticipants = (roomId: string, participants: VoiceParticipant[]) => {
    voiceParticipantsRoomMap.value.set(roomId, participants);
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

  const handleAdminAction = async (type: AdminActionType, durationMs?: number) => {
    const roomId = callRoomId.value;
    const localSessionId = sessionId.value;
    switch (type) {
      case AdminActionType.BanUser:
        await leaveVoice();
        await navigateTo("/");
        break;
      case AdminActionType.ForceMute:
        if (roomId && localSessionId) setMute(roomId, localSessionId, true);
        setLocalStreamMuted(true);
        isForceMuted.value = true;
        break;
      case AdminActionType.ForceUnmute:
        if (roomId && localSessionId) setMute(roomId, localSessionId, false);
        setLocalStreamMuted(false);
        isForceMuted.value = false;
        break;
      case AdminActionType.KickFromRoom:
        await leaveVoice();
        await navigateTo("/");
        break;
      case AdminActionType.KickFromVoice:
        await leaveVoice();
        notify("You have been kicked from voice.");
        break;
      case AdminActionType.TimeoutUser: {
        const minutes = durationMs ? Math.round(durationMs / 60000) : 0;
        notify(`You have been timed out for ${minutes} minute${minutes === 1 ? "" : "s"}.`);
        if (roomId) await leaveVoice();
        break;
      }
      default:
        exhaustiveGuard(type);
    }
  };

  const subscribeToAdminActions = (roomId: string) => {
    unsubscribeFromAdminActions();
    adminActionUnsubscribable = $trpc.moderation.onAdminAction.subscribe(
      { roomId },
      { onData: ({ durationMs, type }) => {
        handleAdminAction(type, durationMs)
       } },
    );
  };

  const unsubscribeFromAdminActions = () => {
    adminActionUnsubscribable?.unsubscribe();
    adminActionUnsubscribable = undefined;
  };

  const joinVoice = async () => {
    const roomId = roomStore.currentRoomId;
    if (!roomId || callRoomId.value) return;
    callRoomId.value = roomId;
    try {
      const stream = await acquireLocalStream();
      subscribeToSignals(roomId);
      subscribeToAdminActions(roomId);
      const participants = await $trpc.voice.joinVoiceChannel.mutate({ roomId });
      setParticipants(roomId, participants);
      const localSessionId = sessionId.value;
      if (localSessionId) await setupSpeakingDetection(LOCAL_PARTICIPANT_ID, localSessionId, stream);
    } catch {
      await leaveVoice();
    }
  };

  const leaveVoice = async () => {
    const roomId = callRoomId.value;
    if (!roomId) return;
    const localSessionId = sessionId.value;
    try {
      if (localSessionId) deleteVoiceParticipant(roomId, localSessionId);
      await $trpc.voice.leaveVoiceChannel.mutate({ roomId });
    } finally {
      callRoomId.value = undefined;
      isDeafened.value = false;
      isForceMuted.value = false;
      unsubscribeFromAdminActions();
      await cleanupAll();
      clearSpeakers();
    }
  };

  const toggleDeafen = () => {
    isDeafened.value = !isDeafened.value;
    setRemoteAudioMuted(isDeafened.value);
  };

  const toggleMute = async () => {
    const roomId = callRoomId.value;
    const localSessionId = sessionId.value;
    if (!roomId || !localSessionId) return;
    const newIsMuted = !isMuted.value;
    setMute(roomId, localSessionId, newIsMuted);
    setLocalStreamMuted(newIsMuted);
    await $trpc.voice.setMute.mutate({ isMuted: newIsMuted, roomId });
  };

  return {
    callRoomId,
    clearSpeakers,
    createSpeaker,
    createVoiceParticipant,
    deleteSpeaker,
    deleteVoiceParticipant,
    isDeafened,
    isForceMuted,
    isInChannel,
    isMuted,
    joinVoice,
    leaveVoice,
    roomParticipants,
    setMute,
    setParticipants,
    speakingIds,
    toggleDeafen,
    toggleMute,
    voiceParticipantsRoomMap,
  };
});
