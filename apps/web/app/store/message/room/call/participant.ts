import type { HeldCallParticipant } from "#src/models/message/room/call/HeldCallParticipant";
import type { CallParticipant, CallParticipantRow } from "@esposter/db-schema";

import { participantTable } from "#src/services/message/room/call/constants";
import { useOverlayStore } from "#src/store/overlay";
import { getOrCreate } from "@esposter/shared";

export const useParticipantStore = defineStore("message/room/call/participant", () => {
  const overlayStore = useOverlayStore();
  const { arrive, view } = overlayStore;
  const heldParticipants = view(participantTable);
  // Every participant the overlay holds that has not left, by the call each is in. The map is computed, so a row arriving or
  // A write's entry shows in it at once, and a tombstone is hidden from it
  const callSessionParticipantsMap = computed(() => {
    const sessionParticipantsMap = new Map<string, Map<string, CallParticipant>>();
    for (const participant of heldParticipants.value)
      getOrCreate(sessionParticipantsMap, participant.callSessionId, () => new Map()).set(participant.id, participant);
    return sessionParticipantsMap;
  });
  const joinNoticeParticipant = ref<CallParticipant>();
  // The id the joined call names this client's own connection by, the one source of it: empty while not joined
  const participantId = ref("");
  const speakingIds = ref<string[]>([]);
  const readParticipants = useOverlayRead(participantTable, (participant: HeldCallParticipant) => participant);
  // The rows a call's answer or event carries arrive at their versions, so a row that left is never brought back by an
  // Older one that lands after it
  const storeCallParticipants = (callSessionId: string, participants: CallParticipantRow[]) => {
    for (const participant of participants) arrive(participantTable, { ...participant, callSessionId });
  };
  const storeCallParticipant = (callSessionId: string, participant: CallParticipantRow) => {
    storeCallParticipants(callSessionId, [participant]);
    if (participant.deletedAt && joinNoticeParticipant.value?.id === participant.id)
      joinNoticeParticipant.value = undefined;
  };
  // A join is the one event that announces a participant, so only it raises the notice, and only for a row the call did not
  // Already hold
  const storeJoinedCallParticipant = (callSessionId: string, participant: CallParticipantRow) => {
    const isNewToCall = !callSessionParticipantsMap.value.get(callSessionId)?.has(participant.id);
    storeCallParticipant(callSessionId, participant);
    if (isNewToCall && participant.id !== participantId.value) joinNoticeParticipant.value = participant;
  };
  // The read is handed in, as a thread's is. Its rows arrive at their versions, so the read cannot overwrite a newer row
  const readCallParticipants = (callSessionId: string, read: () => Promise<Map<string, CallParticipantRow>>) =>
    readParticipants(async () =>
      Array.from((await read()).values(), (participant) => ({ ...participant, callSessionId })),
    );
  const deleteSpeaker = (id: string) => {
    speakingIds.value = speakingIds.value.filter((speakingId) => speakingId !== id);
  };
  const clearSpeakers = () => {
    speakingIds.value = [];
  };
  const clearJoinNotice = () => {
    joinNoticeParticipant.value = undefined;
  };
  const setParticipantId = (id: string) => {
    participantId.value = id;
  };

  return {
    callSessionParticipantsMap,
    clearJoinNotice,
    clearSpeakers,
    deleteSpeaker,
    joinNoticeParticipant,
    participantId,
    readCallParticipants,
    setParticipantId,
    speakingIds,
    storeCallParticipant,
    storeCallParticipants,
    storeJoinedCallParticipant,
  };
});
