import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomInviteStore } from "@/store/message/room/roomInvite";

// The room's links rather than the reader's own — a management surface reads every one of them, and only a
// Member who may act on somebody else's is shown it at all
export const useReadRoomInvites = (roomId: RoomInMessage["id"]) => {
  const { $trpc } = useNuxtApp();
  const roomInviteStore = useRoomInviteStore();
  const { readItems, readMoreItems } = roomInviteStore;
  const readRoomInvites = () => readItems(() => $trpc.room.readRoomInvites.query({ roomId }));
  const readMoreRoomInvites = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.room.readRoomInvites.query({ cursor, roomId }), onComplete);
  return { readMoreRoomInvites, readRoomInvites };
};
