import { setRoomUsers } from "@/services/message/room/setRoomUsers";
import { useDataStore } from "@/store/message/data";
import { useUserStore } from "@/store/message/user";
import { chunk, MAX_READ_LIMIT } from "@esposter/shared";

// A person's name and image are published on the topic of every room they are in, so a room's topic re-reads the users it
// Shows: its members and the authors of its loaded messages. Each is read again by id and its copy replaced. The by-id read
// That fills a room skips a user it already holds, which would keep a renamed member's old name on screen, so a refresh
// Reads every one of them again
export const useRefreshRoomUsers = () => {
  const { $trpc } = useNuxtApp();
  const dataStore = useDataStore();
  const { getSlice } = dataStore;
  const userStore = useUserStore();
  const { getRoomMemberMap } = userStore;
  return async (roomId: string, checkIsStale: () => boolean) => {
    const memberIds = [...(getRoomMemberMap(roomId)?.keys() ?? [])];
    const authorIds = getSlice(roomId).items.value.flatMap(({ userId }) => (userId ? [userId] : []));
    const userIds = [...new Set([...memberIds, ...authorIds])];
    if (userIds.length === 0) return;

    const users = (
      await Promise.all(
        chunk(userIds, MAX_READ_LIMIT).map((userIdChunk) =>
          $trpc.room.readUsersByIds.query({ roomId, userIds: userIdChunk }),
        ),
      )
    ).flat();
    // A refresh a newer one has superseded stores nothing: the newer one reads the room's users again
    if (checkIsStale()) return;

    setRoomUsers(roomId, users);
  };
};
