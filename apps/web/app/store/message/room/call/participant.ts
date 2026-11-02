import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { authClient } from "@/services/auth/authClient";

export const useParticipantStore = defineStore("message/room/call/participant", () => {
  const session = authClient.useSession();
  const callSessionParticipantsMap = ref(new Map<string, Map<string, CallParticipant>>());
  const joinNoticeParticipant = ref<CallParticipant>();
  const speakingIds = ref<string[]>([]);
  const sessionId = computed(() => session.value.data?.session.id);
  const { readWithReplayedPushes, recordReadingPush } = useReadingPushes<CallParticipant, string>();
  const createCallParticipant = (callSessionId: string, participant: CallParticipant) => {
    recordReadingPush(callSessionId, { item: participant, type: "set" });
    const existingParticipantMap = callSessionParticipantsMap.value.get(callSessionId);
    if (existingParticipantMap?.has(participant.id)) return;
    if (existingParticipantMap) existingParticipantMap.set(participant.id, participant);
    else callSessionParticipantsMap.value.set(callSessionId, new Map([[participant.id, participant]]));

    if (participant.id !== sessionId.value) joinNoticeParticipant.value = participant;
  };
  const deleteCallParticipant = (callSessionId: string, id: string) => {
    recordReadingPush(callSessionId, { checkIsRemoved: (participant) => participant.id === id, type: "remove" });
    const participantMap = callSessionParticipantsMap.value.get(callSessionId);
    if (!participantMap) return;
    participantMap.delete(id);
    if (joinNoticeParticipant.value?.id === id) joinNoticeParticipant.value = undefined;
  };
  const setParticipantMuted = (callSessionId: string, id: string, isMuted: boolean) => {
    recordReadingPush(callSessionId, { id, patch: { isMuted }, type: "patch" });
    const participant = callSessionParticipantsMap.value.get(callSessionId)?.get(id);
    if (!participant) return;
    participant.isMuted = isMuted;
  };
  const setParticipantCameraEnabled = (callSessionId: string, id: string, isCameraEnabled: boolean) => {
    recordReadingPush(callSessionId, { id, patch: { isCameraEnabled }, type: "patch" });
    const participant = callSessionParticipantsMap.value.get(callSessionId)?.get(id);
    if (!participant) return;
    participant.isCameraEnabled = isCameraEnabled;
  };
  const setParticipantMap = (callSessionId: string, participants: Map<string, CallParticipant>) => {
    callSessionParticipantsMap.value.set(callSessionId, participants);
  };
  // The read is handed in, as a thread's is. Its answer is merged with the participant writes that landed while it was in flight.
  // A session whose participants a subscription is following is never written back without them.
  const readCallParticipants = (callSessionId: string, read: () => Promise<Map<string, CallParticipant>>) =>
    readWithReplayedPushes(
      callSessionId,
      async () => [...(await read()).values()],
      (participants) => {
        setParticipantMap(callSessionId, new Map(participants.map((participant) => [participant.id, participant])));
      },
      console.error,
    );
  const setParticipantHandRaised = (callSessionId: string, id: string, isHandRaised: boolean) => {
    recordReadingPush(callSessionId, { id, patch: { isHandRaised }, type: "patch" });
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
    joinNoticeParticipant,
    readCallParticipants,
    sessionId,
    setParticipantCameraEnabled,
    setParticipantHandRaised,
    setParticipantMap,
    setParticipantMuted,
    speakingIds,
  };
});
