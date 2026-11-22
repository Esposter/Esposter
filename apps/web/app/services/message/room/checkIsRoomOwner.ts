import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomStore } from "#src/store/message/room/index";

// The one check for who owns a room, which the member actions and the role editor both ask
export const checkIsRoomOwner = (roomId: RoomInMessage["id"], userId: string) => {
  const roomStore = useRoomStore();
  const { rooms } = storeToRefs(roomStore);
  return rooms.value.find(({ id }) => id === roomId)?.userId === userId;
};
