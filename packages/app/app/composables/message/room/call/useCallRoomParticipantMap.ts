import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";

export const useCallRoomParticipantMap = () => {
  const callStore = useCallStore();
  const { currentRoomCallSessionId } = storeToRefs(callStore);
  const participantStore = useParticipantStore();
  const { callSessionParticipantsMap } = storeToRefs(participantStore);
  return computed(
    () => callSessionParticipantsMap.value.get(currentRoomCallSessionId.value) ?? new Map<string, CallParticipant>(),
  );
};
