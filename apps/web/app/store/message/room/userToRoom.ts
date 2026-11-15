import type { UserToRoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "#src/store/message/room/index";

export const useUserToRoomStore = defineStore("message/room/userToRoom", () => {
  const roomStore = useRoomStore();
  const {
    data: myUserToRoom,
    getData: getMyUserToRoom,
    setData: setMyUserToRoom,
  } = useDataMap<undefined | UserToRoomInMessage>(() => roomStore.currentRoomId, undefined);
  return { getMyUserToRoom, myUserToRoom, setMyUserToRoom };
});
