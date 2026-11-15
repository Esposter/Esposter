import { getCallParticipantMap } from "#src/services/message/room/call/getCallParticipantMap";
import { useCallStore } from "#src/store/message/room/call/index";
import { useParticipantStore } from "#src/store/message/room/call/participant";
import { useRoomStore } from "#src/store/message/room/index";
import { useUserStore } from "#src/store/message/user/index";

// The viewed room's call, each participant named as the room knows them
export const useCallRoomParticipantMap = () => {
  const roomStore = useRoomStore();
  const { currentRoomId } = storeToRefs(roomStore);
  const callStore = useCallStore();
  const { currentRoomCallSessionId } = storeToRefs(callStore);
  const participantStore = useParticipantStore();
  const { callSessionParticipantsMap } = storeToRefs(participantStore);
  const userStore = useUserStore();
  const { getRoomMemberName } = userStore;
  return computed(() =>
    getCallParticipantMap(
      callSessionParticipantsMap.value.get(currentRoomCallSessionId.value),
      currentRoomId.value,
      getRoomMemberName,
    ),
  );
};
