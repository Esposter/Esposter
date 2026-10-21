import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { useRoomStore } from "@/store/message/room";
import { useCallStore } from "@/store/message/room/call";
import { useParticipantStore } from "@/store/message/room/call/participant";
import { useUserStore } from "@/store/message/user";

// The viewed room's call, each participant named as the room knows them
export const useCallRoomParticipantMap = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const callStore = useCallStore();
  const { currentRoomCallSessionId } = storeToRefs(callStore);
  const participantStore = useParticipantStore();
  const { callSessionParticipantsMap } = storeToRefs(participantStore);
  const userStore = useUserStore();
  const { getRoomMemberMap } = userStore;
  return computed(
    () =>
      new Map<string, CallParticipant>(
        Array.from(callSessionParticipantsMap.value.get(currentRoomCallSessionId.value) ?? [], ([id, participant]) => [
          id,
          {
            ...participant,
            name: getRoomMemberMap(currentRoomId.value)?.get(participant.userId)?.displayName ?? participant.name,
          },
        ]),
      ),
  );
};
