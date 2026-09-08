import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { requirePartitionKey } from "@/services/message/requirePartitionKey";
import { useRoomStore } from "@/store/message/room";
import { useRoleStore } from "@/store/message/room/role";

export const useReadRooms = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const roleStore = useRoleStore();
  const { readMyPermissions, readRoles } = roleStore;
  const { data: session } = await authClient.useSession(useFetch);
  const readMyUsersToRooms = useReadMyUsersToRooms();
  // A room row is not a room: the sidebar renders a nickname, the reader's own standing and the room's roles
  // Beside every name. Both paths that produce a page go through here rather than restating the fan-out, which
  // Is how a scrolled page comes to render rows the first one does not
  const readRoomMetadata = async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;
    await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions({ roomIds }), readRoles({ roomIds })]);
  };
  const readRooms = () => {
    requirePartitionKey(session.value?.user.id, readRooms.name);
    return readItems(async () => {
      const cursorPaginationData = await $trpc.room.readRooms.query(
        currentRoomId.value ? { roomId: currentRoomId.value } : {},
      );
      await readRoomMetadata(cursorPaginationData.items.map(({ id }) => id));
      return cursorPaginationData;
    });
  };
  const readMoreRooms = (onComplete: () => void) => {
    requirePartitionKey(session.value?.user.id, readMoreRooms.name);
    return readMoreItems(async (cursor) => {
      const cursorPaginationData = await $trpc.room.readRooms.query({ cursor });
      await readRoomMetadata(cursorPaginationData.items.map(({ id }) => id));
      return cursorPaginationData;
    }, onComplete);
  };
  return { readMoreRooms, readRooms };
};
