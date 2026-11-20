import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomInviteStore } from "#src/store/message/room/roomInvite";

// The room's whole set rather than the reader's own link
export const useReadRoomInvites = (roomId: RoomInMessage["id"]) => {
  const { $trpc } = useNuxtApp();
  const roomInviteStore = useRoomInviteStore();
  const { getInviteItems, getSliceOperationData, readInvitePage } = roomInviteStore;
  const { hasMore, readItems, readMoreItems } = getSliceOperationData(roomId);
  const items = getInviteItems(roomId);
  // Each invite names its creator, and the creator is named as the room knows them, so the creators are read as the
  // Room reads them
  const readUsersByIds = useReadUsersByIds();
  const readRoomInvitePage = async (cursor: string) => {
    const invitePage = await $trpc.invite.readRoomInvites.query({ cursor, roomId });
    await readUsersByIds(
      roomId,
      invitePage.items.map(({ user }) => user.id),
    );
    return readInvitePage(invitePage);
  };
  const readRoomInvites = () => readItems(() => readRoomInvitePage(""));
  const readMoreRoomInvites = (onComplete: () => void) =>
    readMoreItems((cursor) => readRoomInvitePage(cursor), onComplete);
  return { hasMore, items, readMoreRoomInvites, readRoomInvites };
};
