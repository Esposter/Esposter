import type { RoomInMessage } from "@esposter/db-schema";

import { useRoomInviteStore } from "@/store/message/room/roomInvite";

// The room's whole set rather than the reader's own link
export const useReadRoomInvites = (roomId: RoomInMessage["id"]) => {
  const { $trpc } = useNuxtApp();
  const roomInviteStore = useRoomInviteStore();
  const { getSliceOperationData } = roomInviteStore;
  const { hasMore, items, readItems, readMoreItems } = getSliceOperationData(roomId);
  // Each invite names its creator, and the creator is named as the room knows them, so the creators are read as the
  // Room reads them
  const readUsersByIds = useReadUsersByIds();
  const readInvitePage = async (cursor?: string) => {
    const invitePage = await $trpc.invite.readRoomInvites.query({ cursor, roomId });
    await readUsersByIds(
      roomId,
      invitePage.items.map(({ user }) => user.id),
    );
    return invitePage;
  };
  const readRoomInvites = () => readItems(() => readInvitePage());
  const readMoreRoomInvites = (onComplete: () => void) => readMoreItems((cursor) => readInvitePage(cursor), onComplete);
  return { hasMore, items, readMoreRoomInvites, readRoomInvites };
};
