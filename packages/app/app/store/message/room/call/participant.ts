import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { authClient } from "@/services/auth/authClient";

export const useParticipantStore = defineStore("message/room/call/participant", () => {
  const session = authClient.useSession();
  const callSessionParticipantsMap = ref(new Map<string, Map<string, CallParticipant>>());
  const joinNoticeParticipant = ref<CallParticipant>();
  const speakingIds = ref<string[]>([]);
  const sessionId = computed(() => session.value.data?.session.id);
  const getParticipants = (callSessionId: string) =>
    callSessionId
      ? (callSessionParticipantsMap.value.get(callSessionId) ?? new Map<string, CallParticipant>())
      : new Map<string, CallParticipant>();
  const createCallParticipant = (callSessionId: string, participant: CallParticipant) => {
    const existing = callSessionParticipantsMap.value.get(callSessionId);
    if (existing?.has(participant.id)) return;
    if (existing) existing.set(participant.id, participant);
    else callSessionParticipantsMap.value.set(callSessionId, new Map([[participant.id, participant]]));

    if (participant.id !== sessionId.value) joinNoticeParticipant.value = participant;
  };
  const deleteCallParticipant = (callSessionId: string, id: string) => {
    const sessionMap = callSessionParticipantsMap.value.get(callSessionId);
    if (!sessionMap) return;
    sessionMap.delete(id);
    if (joinNoticeParticipant.value?.id === id) joinNoticeParticipant.value = undefined;
  };
  const setMute = (callSessionId: string, id: string, isMuted: boolean) => {
    const participant = callSessionParticipantsMap.value.get(callSessionId)?.get(id);
    if (!participant) return;
    participant.isMuted = isMuted;
  };
  const setParticipantCamera = (callSessionId: string, id: string, isCameraEnabled: boolean) => {
    const participant = callSessionParticipantsMap.value.get(callSessionId)?.get(id);
    if (!participant) return;
    participant.isCameraEnabled = isCameraEnabled;
  };
  const setParticipants = (callSessionId: string, participants: CallParticipant[]) => {
    callSessionParticipantsMap.value.set(callSessionId, new Map(participants.map((p) => [p.id, p])));
  };
  const setHandRaised = (callSessionId: string, id: string, isHandRaised: boolean) => {
    const participant = callSessionParticipantsMap.value.get(callSessionId)?.get(id);
    if (!participant) return;
    participant.isHandRaised = isHandRaised;
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
  const clearJoinNotice = () => {
    joinNoticeParticipant.value = undefined;
  };

  return {
    callSessionParticipantsMap,
    clearJoinNotice,
    clearSpeakers,
    createCallParticipant,
    createSpeaker,
    deleteCallParticipant,
    deleteSpeaker,
    getParticipants,
    joinNoticeParticipant,
    sessionId,
    setHandRaised,
    setMute,
    setParticipantCamera,
    setParticipants,
    speakingIds,
  };
});
