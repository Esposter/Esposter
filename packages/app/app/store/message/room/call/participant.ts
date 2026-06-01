import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { authClient } from "@/services/auth/authClient";

export const useParticipantStore = defineStore("message/room/call/participant", () => {
  const session = authClient.useSession();
  const callSessionParticipantsMap = ref(new Map<string, CallParticipant[]>());
  const handRaisedIdsMap = ref(new Map<string, string[]>());
  const joinNoticeParticipant = ref<CallParticipant>();
  const speakingIds = ref<string[]>([]);
  const sessionId = computed(() => session.value.data?.session.id);
  const getParticipants = (callSessionId: string) =>
    callSessionId ? (callSessionParticipantsMap.value.get(callSessionId) ?? []) : [];
  const getHandRaisedIds = (callSessionId: string) => handRaisedIdsMap.value.get(callSessionId) ?? [];
  const createCallParticipant = (callSessionId: string, participant: CallParticipant) => {
    const participants = getParticipants(callSessionId);
    if (participants.some(({ id }) => id === participant.id)) return;
    callSessionParticipantsMap.value.set(callSessionId, [...participants, participant]);
    if (participant.id !== sessionId.value) joinNoticeParticipant.value = participant;
  };
  const deleteCallParticipant = (callSessionId: string, id: string) => {
    const participants = callSessionParticipantsMap.value.get(callSessionId);
    if (!participants) return;
    callSessionParticipantsMap.value.set(
      callSessionId,
      participants.filter((participant) => participant.id !== id),
    );
    setHandRaised(callSessionId, id, false);
    if (joinNoticeParticipant.value?.id === id) joinNoticeParticipant.value = undefined;
  };
  const setMute = (callSessionId: string, id: string, isMuted: boolean) => {
    const participant = getParticipants(callSessionId).find((value) => value.id === id);
    if (!participant) return;
    participant.isMuted = isMuted;
  };
  const setParticipantCamera = (callSessionId: string, id: string, isCameraEnabled: boolean) => {
    const participant = getParticipants(callSessionId).find((value) => value.id === id);
    if (!participant) return;
    participant.isCameraEnabled = isCameraEnabled;
  };
  const setParticipants = (callSessionId: string, participants: CallParticipant[]) => {
    callSessionParticipantsMap.value.set(callSessionId, participants);
    const initialHandRaisedIds = participants.filter((p) => p.isHandRaised).map((p) => p.id);
    if (initialHandRaisedIds.length > 0) handRaisedIdsMap.value.set(callSessionId, initialHandRaisedIds);
  };
  const setHandRaised = (callSessionId: string, id: string, isHandRaised: boolean) => {
    const handRaisedIds = getHandRaisedIds(callSessionId);
    handRaisedIdsMap.value.set(
      callSessionId,
      isHandRaised
        ? [id, ...handRaisedIds.filter((handRaisedId) => handRaisedId !== id)]
        : handRaisedIds.filter((handRaisedId) => handRaisedId !== id),
    );
    const participant = getParticipants(callSessionId).find((value) => value.id === id);
    if (participant) participant.isHandRaised = isHandRaised;
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
  const clearHandRaisedIds = (callSessionId: string) => {
    handRaisedIdsMap.value.delete(callSessionId);
  };
  const clearJoinNotice = () => {
    joinNoticeParticipant.value = undefined;
  };

  return {
    callSessionParticipantsMap,
    clearHandRaisedIds,
    clearJoinNotice,
    clearSpeakers,
    createCallParticipant,
    createSpeaker,
    deleteCallParticipant,
    deleteSpeaker,
    getHandRaisedIds,
    getParticipants,
    handRaisedIdsMap,
    joinNoticeParticipant,
    sessionId,
    setHandRaised,
    setMute,
    setParticipantCamera,
    setParticipants,
    speakingIds,
  };
});
