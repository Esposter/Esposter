import type { UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "#src/store/message/room/index";

export const useUserToRoomStore = defineStore("message/room/userToRoom", () => {
  const roomStore = useRoomStore();
  // The viewer's own row is written from more than one panel, so every write queues on this one executor rather than
  // On a per-panel one that cannot see the other's writes to the same room
  const { executeMutation: executeUserToRoomMutation } = useMutation();
  const {
    data: myUserToRoom,
    getData: getMyUserToRoom,
    setData: setMyUserToRoom,
  } = useDataMap<undefined | UserToRoomInMessage>(() => roomStore.currentRoomId, undefined);
  return { executeUserToRoomMutation, getMyUserToRoom, myUserToRoom, setMyUserToRoom };
});
