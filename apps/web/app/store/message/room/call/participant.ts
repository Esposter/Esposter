import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { SnapshotPush } from "@/models/shared/SnapshotPush";

import { authClient } from "@/services/auth/authClient";
import { mergeSnapshot } from "@/services/shared/mergeSnapshot";

export const useParticipantStore = defineStore("message/room/call/participant", () => {
  const session = authClient.useSession();
  const { executeQuery: executeReadCallParticipantsQuery } = useMutation();
  const callSessionParticipantsMap = ref(new Map<string, Map<string, CallParticipant>>());
  const joinNoticeParticipant = ref<CallParticipant>();
  const speakingIds = ref<string[]>([]);
  const sessionId = computed(() => session.value.data?.session.id);
  // The writes that land while a session's participant read is in flight, kept until its answer is merged with them
  const readingPushesMap = new Map<string, SnapshotPush<CallParticipant>[]>();
  const recordReadingPush = (callSessionId: string, push: SnapshotPush<CallParticipant>) => {
    readingPushesMap.get(callSessionId)?.push(push);
  };
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
  // The read is handed in, as a thread's is: the answer is merged with the participant writes that landed while it was
  // in flight, so a session whose participants a subscription is following is never written back without them
  const readCallParticipants = async (callSessionId: string, read: () => Promise<Map<string, CallParticipant>>) => {
    const readPushes: SnapshotPush<CallParticipant>[] = [];
    readingPushesMap.set(callSessionId, readPushes);
    await executeReadCallParticipantsQuery(read, {
      key: callSessionId,
      onError: console.error,
      onSuccess: (participantMap) => {
        const participants = mergeSnapshot([...participantMap.values()], readPushes);
        setParticipantMap(callSessionId, new Map(participants.map((participant) => [participant.id, participant])));
      },
    });
    if (readingPushesMap.get(callSessionId) === readPushes) readingPushesMap.delete(callSessionId);
  };
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
