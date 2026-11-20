import type { RoomInMessage } from "@esposter/db-schema";

import { requirePartitionKey } from "#src/services/message/requirePartitionKey";
import { useRoomStore } from "#src/store/message/room/index";
import { useRoleStore } from "#src/store/message/room/role";

export const useReadRooms = async () => {
  const { $trpc } = useNuxtApp();
  const roomStore = useRoomStore();
  const { arriveRooms, readItems, readMoreItems } = roomStore;
  const { currentRoomId } = storeToRefs(roomStore);
  const roleStore = useRoleStore();
  const { readMyPermissions, readRoles } = roleStore;
  const readMyUsersToRooms = useReadMyUsersToRooms();
  const { data: session } = await useAuthSession();
  // A room row is not a room: the sidebar renders a displayName, the reader's own standing and the room's roles
  // Beside every name. Both paths that produce a page go through here rather than restating the fan-out, which
  // Is how a scrolled page comes to render rows the first one does not
  const readRoomMetadata = async (roomIds: RoomInMessage["id"][]) => {
    if (roomIds.length === 0) return;
    await Promise.all([readMyUsersToRooms(roomIds), readMyPermissions({ roomIds }), readRoles({ roomIds })]);
  };
  // The page's rows are held on the overlay as they answer, and the page keeps only their ids for paging. A row's
  // Display name is the server's join, which the room list never shows, so it is left off the held row
  const readRoomPage = async (
    readPage: () => Promise<{ items: (RoomInMessage & { displayName: string })[]; nextCursor: string }>,
  ) => {
    const page = await readPage();
    arriveRooms(page.items.map(({ displayName: _displayName, ...room }) => room));
    await readRoomMetadata(page.items.map(({ id }) => id));
    return { ...page, items: page.items.map(({ id }) => ({ id })) };
  };
  const readRooms = () => {
    requirePartitionKey(session.value?.user.id, readRooms.name);
    return readItems(() =>
      readRoomPage(() => $trpc.room.readRooms.query(currentRoomId.value ? { roomId: currentRoomId.value } : {})),
    );
  };
  const readMoreRooms = (onComplete: () => void) => {
    requirePartitionKey(session.value?.user.id, readMoreRooms.name);
    return readMoreItems((cursor) => readRoomPage(() => $trpc.room.readRooms.query({ cursor })), onComplete);
  };
  return { readMoreRooms, readRooms };
};
