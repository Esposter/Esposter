import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomInviteStore } from "@/store/message/room/roomInvite";

// The room's whole set rather than the reader's own link
export const useReadRoomInvites = (roomId: RoomInMessage["id"]) => {
  const { $trpc } = useNuxtApp();
  const roomInviteStore = useRoomInviteStore();
  const { getSliceOperationData } = roomInviteStore;
  const { hasMore, items, readItems, readMoreItems } = getSliceOperationData(roomId);
  const readRoomInvites = () => readItems(() => $trpc.room.readRoomInvites.query({ roomId }));
  const readMoreRoomInvites = (onComplete: () => void) =>
    readMoreItems((cursor) => $trpc.room.readRoomInvites.query({ cursor, roomId }), onComplete);
  return { hasMore, items, readMoreRoomInvites, readRoomInvites };
};
