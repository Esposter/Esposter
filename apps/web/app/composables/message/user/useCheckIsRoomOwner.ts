import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "#src/store/message/room/index";

// The one check for who owns a room, which the member actions and the role editor both ask
export const useCheckIsRoomOwner = () => {
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  return (roomId: RoomInMessage["id"], userId: string) =>
    rooms.value.find(({ id }) => id === roomId)?.userId === userId;
};
