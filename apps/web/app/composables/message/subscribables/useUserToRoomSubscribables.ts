import { useUserToRoomStore } from "#src/store/message/room/userToRoom";
import { useConnectionStore } from "#src/store/realtime/connection";

export const useUserToRoomSubscribables = () => {
  const userToRoomStore = useUserToRoomStore();
  const { arriveUserToRooms } = userToRoomStore;
  const connectionStore = useConnectionStore();
  const { onUserEvent } = connectionStore;
  // The room's copy of a member is not re-read here: the member list watches the room's membership topic, which a
  // Display-name write publishes, so the list re-reads the member itself
  const unregister = onUserEvent("updateUserToRoom", (userToRoom) => {
    arriveUserToRooms([userToRoom]);
  });
  onScopeDispose(unregister);
};
