import type { UserInRoom } from "#shared/models/db/room/UserInRoom";

import { useDataStore } from "#src/store/message/data";
import { useUserStore } from "#src/store/message/user/index";
import { chunk, MAX_READ_LIMIT } from "@esposter/shared";

// A person's name and image are published on the topic of every room they are in, so a room's topic re-reads the users it
// Shows: its members and the authors of its loaded messages. Each is read again by id. The by-id read that fills a room
// Skips a user it already holds, which would keep a renamed member's old name on screen, so a refresh reads every one of
// Them again. The read only returns the users, and the caller applies them through a run scope, so a superseded refresh
// Applies nothing
export const useRefreshRoomUsers = () => {
  const { $trpc } = useNuxtApp();
  const dataStore = useDataStore();
  const { getSlice } = dataStore;
  const userStore = useUserStore();
  const { getRoomMemberMap } = userStore;
  return async (roomId: string): Promise<UserInRoom[]> => {
    const memberIds = [...(getRoomMemberMap(roomId)?.keys() ?? [])];
    const authorIds = getSlice(roomId).items.value.flatMap(({ userId }) => (userId ? [userId] : []));
    const userIds = [...new Set([...memberIds, ...authorIds])];
    if (userIds.length === 0) return [];

    return (
      await Promise.all(
        chunk(userIds, MAX_READ_LIMIT).map((userIdChunk) =>
          $trpc.room.readUsersByIds.query({ roomId, userIds: userIdChunk }),
        ),
      )
    ).flat();
  };
};
